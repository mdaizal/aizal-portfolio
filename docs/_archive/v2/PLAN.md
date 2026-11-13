# PLAN.md — Portfolio Site: Build & Deploy Plan

> Execution plan for Aizal's Angular single-page portfolio, deployed to AWS S3 + CloudFront.
> Companion docs: `PRD.md` (what to build), `TRD.md` (how to build it).
> Supersedes v1 (multi-page plan); v1 archived in `_archive/`.

---

## 0. Decisions locked in

| # | Decision | Chosen | Notes |
|---|----------|--------|-------|
| D1 | Hosting | **S3 (private) + CloudFront + OAC**, served on the **CloudFront default HTTPS domain** in v1 | $0 on the AWS free tier; no domain purchase, no Route 53, no ACM. Custom domain is v2 (Phase 9). **Fallback only if CloudFront cannot be set up:** plain S3 static-website hosting (HTTP-only, slower, no custom error pages) — acceptable but visibly better to avoid. |
| D2 | Rendering | **Prerendered static (SSG)**, `outputMode: "static"` | Real HTML at build time, no Node server at runtime. |
| D3 | Page structure | **Single scrolling page** with anchor sections + a separate prerendered 404 | Per owner's choice. Weaker per-section linkability than multi-page; mitigated with correct anchor ids and `scroll-margin-top`. |
| D4 | Styling | **Tailwind CSS v4 + CSS custom-property design tokens** | No component library. |
| D5 | Deployment | **Owner runs every AWS command; the agent guides** | Pi writes code, scripts and docs, and produces exact copy-pasteable commands *with the expected output*. Pi does **not** create or modify AWS resources. |
| D6 | CI/CD | Manual `npm run deploy` first, then GitHub Actions with OIDC | No long-lived AWS keys at any point. |
| D7 | Domain | **Deferred to v2** | v1 ships on `<id>.cloudfront.net`. |
| D8 | Content | Real data in `PRD.md` §8 — no placeholders | Only `{{SAA_TARGET}}` and the résumé PDF remain open. |

### Division of work (D5 in practice)

| Work | Who |
|------|-----|
| Angular code, Tailwind design system, content modules, tests, `scripts/*.sh`, docs | Agent (Pi) |
| Exact AWS CLI commands + the output you should see for each | Agent produces, **you run** |
| AWS console clicking (CloudFront distribution, bucket settings, IAM role) | **You** |
| GitHub repository creation, branch protection, repository variables | **You** (agent gives the exact values to paste) |
| Buying a domain, DNS records, ACM validation | **You** (v2) |
| Verification runs (`curl`, Lighthouse, axe) | Either — commands are provided |

---

## Phase 0 — Prerequisites

| Step | Action | Status / Done when |
|------|--------|--------------------|
| 0.1 | AWS account + working credentials | ✅ `aws sts get-caller-identity` returns account `323661593352` |
| 0.2 | AWS CLI v2 | ✅ `aws-cli/2.40.1` |
| 0.3 | Node.js 26 LTS | ✅ `node -v` → `v26.13.1` (installed via winget 2026-11-13) |
| 0.4 | npm latest | ✅ `npm -v` → `12.2.2` (engines allow node ≥26) |
| 0.5 | Angular CLI 22 | ⬜ `npm i -g @angular/cli@22` → `ng version` prints 22.x |
| 0.6 | GitHub repo created (empty, branch `main`) | ⬜ Repo URL known |
| 0.7 | Résumé decision + `{{SAA_TARGET}}` filled in `PRD.md` §11 | ⬜ No unresolved placeholders |

## Phase 1 — Repository & scaffold

| Step | Action | Done when |
|------|--------|-----------|
| 1.1 | `ng new portfolio --style=scss --ssr=false --routing` then `ng add @angular/ssr` | `npm start` serves a hello-world page |
| 1.2 | Set `outputMode: "static"` in `angular.json` build options | `npm run build` emits `dist/portfolio/browser/index.html`, **no** `server/` dir |
| 1.3 | **Confirm the 404 route's prerender behaviour empirically** — build with a `404` route + `**` route and inspect `dist/portfolio/browser/` | Exactly one of `404/index.html` or the wildcard fallback exists; record the actual behaviour in `TRD.md` §4.1 before continuing |
| 1.4 | Add Tailwind v4 (`.postcssrc.json` with `@tailwindcss/postcss`, `@import "tailwindcss"` in `styles.scss`) | A utility class visibly applies |
| 1.5 | Add `.nvmrc` (`26`), `.editorconfig`, Prettier + ESLint, `.gitignore` | `npm run lint` passes on the scaffold |
| 1.6 | Commit `chore: scaffold` and push | Clean first commit on `main` |

## Phase 2 — Design system & content layer

| Step | Action | Done when |
|------|--------|-----------|
| 2.1 | Design tokens as CSS custom properties: colour, type scale, spacing, radii, shadows; light + dark | Every token pair passes 4.5:1 (text) / 3:1 (UI) contrast |
| 2.2 | Layout shell: sticky header (name, 5 anchors, résumé slot, GitHub + LinkedIn), footer, skip link, monogram block | Usable at 375 px and 1440 px; header does not cover anchors (`scroll-margin-top`) |
| 2.3 | Typed content modules per `PRD.md` §8: `profile.ts`, `experience.ts`, `skills.ts`, `projects.ts`, `certs.ts`, `models.ts` | All fields typed, zero `any`, PRD content transcribed |
| 2.4 | Reusable primitives: `SectionHeading`, `TagChip`, `ProjectCard`, `TimelineEntry`, `SkillGroup`, `ButtonLink` | Each has a passing unit test |
| 2.5 | Content validator script (`scripts/validate-content.ts`) — fails the build on `{{`, `TODO`, or missing minimums | Build fails when a placeholder is injected deliberately |

## Phase 3 — Sections

| Step | Action | Done when |
|------|--------|-----------|
| 3.1 | Hero `#top` | Matches PRD §6.1; résumé button hidden while no PDF exists |
| 3.2 | Currently `#currently` (3 honest status items) | Matches PRD §6.2 |
| 3.3 | About `#about` + "How this site is built" | Matches PRD §6.3 |
| 3.4 | Experience `#experience` (timeline, entry 1 + earlier-role slot) | Matches PRD §6.4 |
| 3.5 | Skills `#skills` (5 groups, honest labels, `learning` visually distinct) | Matches PRD §6.5 |
| 3.6 | Projects `#projects` (6 cards from `projects.ts`) | Matches PRD §6.6 |
| 3.7 | Contact `#contact` + footer | Matches PRD §6.7 |
| 3.8 | 404 page | Matches PRD §6.8 |

## Phase 4 — Quality gates

| Step | Action | Done when |
|------|--------|-----------|
| 4.1 | Vitest: content modules, validator, obfuscation helper, each primitive | `npm test` green; ≥80% lines on `content/` and `core/` |
| 4.2 | Accessibility: WCAG 2.2 AA — contrast, keyboard-only pass, focus visible, skip link, `prefers-reduced-motion` | 0 axe violations; Lighthouse a11y ≥ 95 |
| 4.3 | SEO: title/description, canonical, OG/Twitter (1200×630 image), `robots.txt`, `sitemap.xml`, JSON-LD `Person`, favicon set | Lighthouse SEO = 100 |
| 4.4 | Performance: budgets enforced, images sized, no layout shift; verify LCP/CLS/INP | Lighthouse Perf ≥ 95 mobile; LCP < 2.0 s throttled |
| 4.5 | Preview the real static output with a plain static server (not `ng serve`) | Prerendered HTML and anchors behave as they will in production |
| 4.6 | Cross-browser/device spot check | No breakage in Chrome, Edge, Firefox, Safari/iOS |

## Phase 5 — AWS: S3 bucket *(you run these)*

Work from the repo root in **git-bash**. Replace `{{BUCKET_NAME}}` (suggest `aizal-portfolio-site`) and `{{REGION}}` (suggest `ap-southeast-5` — Malaysia, closest to you; use `us-east-1` if the free-tier picture matters more than latency).

| Step | Command you run | Output you should see |
|------|-----------------|-----------------------|
| 5.1 | `aws s3api create-bucket --bucket {{BUCKET_NAME}} --region {{REGION}} --create-bucket-configuration LocationConstraint={{REGION}}` *(omit the LocationConstraint flag only for `us-east-1`)* | JSON with a `Location` field, no error |
| 5.2 | `aws s3api put-public-access-block --bucket {{BUCKET_NAME}} --public-access-block-configuration 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'` | **no output** (silence = success) |
| 5.3 | `aws s3api get-public-access-block --bucket {{BUCKET_NAME}}` | all four values `true` |
| 5.4 | `aws s3api put-bucket-versioning --bucket {{BUCKET_NAME}} --versioning-configuration Status=Enabled` | no output |
| 5.5 | `aws s3api put-bucket-tagging --bucket {{BUCKET_NAME}} --tagging 'TagSet=[{Key=Project,Value=portfolio-site},{Key=Owner,Value=aizal}]'` | no output |
| 5.6 | `aws s3 ls` | the bucket listed |

**Do not enable S3 static website hosting** — CloudFront reads the bucket over the REST endpoint with OAC.

## Phase 6 — AWS: CloudFront + TLS + cache + headers *(you run / click these)*

| Step | Action | Expected result |
|------|--------|-----------------|
| 6.1 | Upload a first build: `npm run build:prod` then `aws s3 sync dist/portfolio/browser/ s3://{{BUCKET_NAME}}/ --delete` | `upload: ...` lines, then `aws s3 ls s3://{{BUCKET_NAME}}/` shows `index.html` |
| 6.2 | Create the CloudFront distribution (console is easiest): origin = the S3 **REST** endpoint, **Origin access control** = new OAC, viewer protocol = *Redirect HTTP to HTTPS*, allowed methods `GET, HEAD`, compress objects = Yes, default root object = `index.html`, price class = `PriceClass_100` (all if you prefer) | Distribution state → `Deployed` (~3–5 min) |
| 6.3 | Paste the suggested bucket policy CloudFront offers (it grants `s3:GetObject` to `cloudfront.amazonaws.com` for this distribution only) | Bucket remains fully private; `https://<d-id>.cloudfront.net/` returns your page |
| 6.4 | Response headers policy: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, CSP (per TRD §12) | `curl -I https://<d-id>.cloudfront.net/` shows every header |
| 6.5 | Custom error responses: **403 → `/404/index.html`, response code 404**; **404 → `/404/index.html`, response code 404** | A bad path renders the 404 page and returns `HTTP/2 404` |
| 6.6 | Verify caching: check a hashed JS file vs `index.html` | JS → `max-age=31536000, immutable`; HTML → `max-age=0, must-revalidate` |

**Note:** no ACM certificate and no Route 53 in v1 — CloudFront serves HTTPS on its own `*.cloudfront.net` domain for free.

## Phase 7 — Deploy automation

| Step | Action | Done when |
|------|--------|-----------|
| 7.1 | npm scripts: `build:prod`, `deploy:sync`, `deploy:html`, `deploy:invalidate`, `deploy` | `npm run deploy` publishes and invalidates in one command |
| 7.2 | Record `BUCKET_NAME`, `DISTRIBUTION_ID`, `REGION` in a gitignored `.env.deploy` used by the scripts | Scripts run from a clean shell without editing files |
| 7.3 | Create the GitHub OIDC provider + deploy role (TRD §13.3 gives the exact JSON) | `aws iam get-role --role-name github-actions-portfolio-deploy` shows the repo-scoped trust policy |
| 7.4 | Add `.github/workflows/deploy.yml`; set the three repository **variables** | Push to `main` deploys automatically; no AWS keys stored anywhere |
| 7.5 | Protect `main`: PR required, CI must pass | Branch protection visible in GitHub settings |

## Phase 8 — Verify, monitor, harden

| Step | Action | Done when |
|------|--------|-----------|
| 8.1 | `scripts/verify-deploy.sh` — fetch `/`, `/#projects`, `robots.txt`, `sitemap.xml`, a hashed asset, and a bad path | All return the expected status and content; the script exits non-zero on any failure |
| 8.2 | Lighthouse + axe against the **live CloudFront URL** | PRD NFR-1 met in production, not just locally |
| 8.3 | AWS Budget ($1–5/mo) + CloudWatch alarm on 5xx rate | Alarm fires on a simulated failure |
| 8.4 | Write `docs/RUNBOOK.md`: deploy, rollback, invalidation, cost, where each resource lives | Someone else could operate the site from that doc alone |
| 8.5 | Rollback drill: re-sync a previous `dist-<sha>` artifact from GitHub Actions | Previous version live in < 10 minutes |

## Phase 9 — Optional v2 (each doubles as AWS/Go practice)

| Step | Action | Why it's worth doing |
|------|--------|----------------------|
| 9.1 | **Go contact form**: API Gateway + Lambda (Go) + SES | Becomes the first real Go artifact (PRD §2) |
| 9.2 | Custom domain + Route 53 + ACM + `www` redirect | Professional URL; ~$12/yr domain + $0.50/mo zone |
| 9.3 | Re-implement Phases 5–7 as **AWS CDK or Terraform** | Directly reusable SAA knowledge; strong portfolio material |
| 9.4 | Retire or redirect `mdaizal.github.io` | Currently a separate single-HTML portfolio at that URL — two portfolios is worse than one. Either point it at the new site or delete the repo. **Decision needed.** |

---

## Human-only steps (cannot be done by an agent)

- AWS console work and accepting the CloudFront-suggested bucket policy.
- Creating the GitHub repo, the OIDC provider, the IAM role and repository variables.
- Supplying the résumé PDF (or deciding to point the button at LinkedIn).
- Supplying earlier roles, if the experience timeline should show more than one entry.
- Approving the copy and tone of the About narrative.
- Deciding the fate of `mdaizal.github.io` (Phase 9.4).

## Execution order

Phases 1–4 are strictly sequential. Then 5 → 6 → 7 → 8 in order. Phase 9 is optional and independent.
Stop after each phase, report the "Done when" evidence, then continue.

## Definition of done (project level)

- [ ] `https://<d-id>.cloudfront.net/` serves the site over valid HTTPS from CloudFront + a private S3 bucket.
- [ ] `curl -s https://<d-id>.cloudfront.net/ | grep -q "Mohd Aizal"` succeeds (proves prerendered HTML, not an empty shell).
- [ ] All 7 sections present; every nav anchor scrolls and is not hidden behind the sticky header.
- [ ] Lighthouse mobile on the live URL: Perf ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO 100.
- [ ] `aws s3api get-public-access-block` → all four `true`.
- [ ] Bad path returns `HTTP/2 404` and renders the 404 page.
- [ ] Push to `main` auto-deploys with zero static AWS credentials.
- [ ] `npm run deploy` works locally as an escape hatch.
- [ ] No `{{...}}` or `TODO` in the deployed build.
- [ ] `RUNBOOK.md` exists and a rollback has been rehearsed once.
