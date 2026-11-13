# PLAN.md — Portfolio Site: Build & Deploy Plan

> Execution plan for Aizal's Angular single-page portfolio, deployed to AWS S3 + CloudFront.
> Companion docs: `PRD.md` (what to build), `TRD.md` (how to build it).
> Project root: **`E:\Go Projects\portfolio-site\`**. Superseded versions live in `_archive/`.

---

## 0. Decisions locked in

| # | Decision | Chosen | Notes |
|---|----------|--------|-------|
| D1 | Hosting | **S3 (private) + CloudFront + OAC**, served on the **CloudFront default HTTPS domain** | **$0/month** on the AWS free tier — no domain purchase, no Route 53, no ACM. Custom domain is v2. **Fallback only if CloudFront cannot be set up:** plain S3 static-website hosting (HTTP-only, slower, no custom error pages) — works, but visibly worse. |
| D2 | Rendering | **Prerendered static (SSG)**, `outputMode: "static"` | Real HTML at build time, no Node server at runtime. |
| D3 | Page structure | **Single scrolling page** with anchor sections + a separate prerendered 404 | Per owner's choice. Mitigated with correct anchor ids and `scroll-margin-top` so the sticky header never covers a heading. |
| D4 | Styling | **Tailwind CSS v4 + CSS custom-property design tokens** | No component library. |
| D5 | Deployment | **Owner runs every AWS command; the agent guides** | Pi writes code, scripts and docs, and produces exact copy-pasteable commands *with the expected output*. Pi does **not** create or modify AWS resources. |
| D6 | CI/CD | Manual `npm run deploy` first, then GitHub Actions with OIDC | No long-lived AWS keys at any point. |
| D7 | Domain | **Deferred to v2** | v1 ships on `<id>.cloudfront.net`. |
| D8 | Content | Real data from the owner's résumé — `PRD.md` §8 | Résumé PDF supplied at `src/assets/aizal-resume.pdf`. Only §11 open questions remain. |
| D9 | Project location | **`E:\Go Projects\portfolio-site\`** | E:\Go Projects is itself a git repo for the owner's learning projects; a `/portfolio-site/` entry has been added to its `.gitignore` so the parent repo does not track the nested site repo. |

### Division of work (D5 in practice)

| Work | Who |
|------|-----|
| Angular code, Tailwind design system, content modules, tests, `scripts/*.sh`, docs | Agent (Pi) |
| Exact AWS CLI commands + the output you should see for each | Agent produces, **you run** |
| AWS console clicking (CloudFront distribution, bucket settings, IAM role) | **You** |
| GitHub repo creation, branch protection, repository variables | **You** (agent gives the exact values to paste) |
| Retiring `mdaizal.github.io` | **You** (steps in Phase 9.4) |
| Buying a domain, DNS records, ACM validation | **You** (v2 only) |
| Verification runs (`curl`, Lighthouse, axe) | Either — commands are provided |

---

## Phase 0 — Prerequisites

| Step | Action | Status / Done when |
|------|--------|--------------------|
| 0.1 | AWS account + working credentials | ✅ `aws sts get-caller-identity` → account `323661593352` |
| 0.2 | AWS CLI v2 | ✅ `aws-cli/2.40.1` |
| 0.3 | Node.js 26 LTS | ✅ `node -v` → `v26.13.1` (installed via winget, 2026-11-13) |
| 0.4 | npm latest | ✅ `npm -v` → `12.2.2` (engines allow node ≥26) |
| 0.5 | Angular CLI 22 | ✅ `ng version` → CLI **22.2.7**, on Node 26.13.1 / npm 12.2.2 |
| 0.6 | Résumé PDF staged | ✅ `src/assets/aizal-resume.pdf` (from `~/Documents/Aizal_Resume.pdf`) |
| 0.7 | Docs relocated to the project root | ✅ `E:\Go Projects\portfolio-site\docs\` |
| 0.8 | GitHub repo created (empty, branch `main`) | ⬜ Repo URL known |
| 0.9 | Resolve PRD §11 open questions | ⬜ At minimum Q2 (employment end date), since the hero's availability line depends on it |

## Phase 1 — Repository & scaffold

| Step | Status | What actually happened |
|------|--------|------------------------|
| 1.1 | ✅ | Scaffolded with `ng new portfolio --directory .` into this folder. **Two deviations from the original plan:** `--style=tailwind` (v22 offers Tailwind as a first-class style choice — it wired Tailwind v4 and `.postcssrc.json` automatically, so no separate manual step was needed) and `--ssr=true` (configures SSR *and* SSG/prerendering at creation, so `ng add @angular/ssr` proved unnecessary). Also `--zoneless=true --test-runner=vitest --package-manager=npm --skip-git --defaults`. **`ng new` did refuse the non-empty directory**, so `docs/` and the résumé PDF were staged outside the folder and restored afterwards. |
| 1.2 | ✅ | Prerender wiring was already present from `--ssr=true`: `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`, `src/server.ts`. |
| 1.3 | ✅ | `outputMode: "static"` set. Build emits **no** `dist/portfolio/server/` directory — server bundles are built as intermediates but not written to disk. |
| 1.4 | ✅ | **Verified empirically.** `Prerendered 2 static routes.` Emitted: `browser/index.html` (9,405 B, real `<h1>`), `browser/404/index.html` (9,214 B, real `<h1>Page not found</h1>`), `browser/index.csr.html` (8,622 B, empty shell), `browser/assets/aizal-resume.pdf`, `prerendered-routes.json` = `{"/": {}, "/404": {}}`. The `RenderMode.Client` wildcard emitted nothing. **Full result recorded in `TRD.md` §4.1 — that section is authoritative.** |
| 1.5 | ✅ | Tailwind v4 via `--style=tailwind`. `src/styles.css` has `@import 'tailwindcss';`; `.postcssrc.json` registers `@tailwindcss/postcss`. |
| 1.6 | ✅ | `.nvmrc` (`26`), `.editorconfig`, `.prettierrc`, `eslint.config.js` (via `ng add angular-eslint` — added a working `lint` target to `angular.json`), `.gitattributes` (LF normalisation so Windows matches Linux CI), `.gitignore` extended with `.env`, `.env.*`, `.env.deploy`. `npm run lint` → **All files pass linting.** |
| 1.7 | ⏳ | `git init -b main`, 47 files tracked, commit *"chore: scaffold Angular 22 workspace…"* on `main`, authored as Aizal. **Push blocked:** the GitHub repo does not exist yet (Phase 0.8). |

**Corrections to this plan's original assumptions** (all reflected in `TRD.md`):

- Assets are served from **`public/`**, not `src/assets/` — Angular 20+ copies `public/` to the output root. The résumé now lives at `public/assets/aizal-resume.pdf` and is served at `/assets/aizal-resume.pdf`. Leaving it in `src/assets/` would have silently not deployed it.
- Styles are **`src/styles.css`**, not `.scss`, because `--style=tailwind` implies CSS.
- **Angular's `budgets` measure raw bytes, not gzip.** The first production build *failed* because 180 kB was configured as if it were gzip while the raw initial total is 275 kB (73 kB gzip). Ceilings are now 300 kB warning / 350 kB error.
- A cold build took ~272 s; warm builds ~10 s. Set CI timeouts accordingly.
- `ng test` on the scaffold initially failed because `app.spec.ts` asserted the default welcome template; the spec now asserts the routing shell instead.

## Phase 2 — Design system & content layer

| Step | Status | What actually happened |
|------|--------|------------------------|
| 2.1 | ✅ | Tokens declared once using CSS **`light-dark()`** in `src/styles.css`, mapped into Tailwind via `@theme inline`. The OS preference applies with zero JavaScript; an explicit choice sets `data-theme` on `<html>`. **Deviation from the plan:** the original design used an inline `<script>` in `index.html` to set the theme before first paint — that is blocked by the project's own `script-src 'self'` CSP, so the stored override is applied in `main.ts` before bootstrap instead, and `light-dark()` covers the no-choice case with no flash at all. Documented in `TRD.md` §6.1. |
| 2.2 | ✅ | `layout/skip-link`, `layout/header` (sticky, 5 anchors, résumé, GitHub + LinkedIn, theme toggle, accessible mobile menu, `IntersectionObserver` scroll-spy with `aria-current`), `layout/footer`, `layout/monogram`. Wired into `app.html` as skip link → header → `<main id="main">` → footer. |
| 2.3 | ✅ | `models.ts`, `profile.ts`, `experience.ts` (**6 entries**), `skills.ts` (**6 groups**), `projects.ts` (**7 cards**), `certs.ts`. Contact address stored split (`emailUser`/`emailDomain`) so the contiguous string never reaches the bundle. |
| 2.4 | ✅ | Primitives with specs: `SectionHeading`, `TagChip`, `ButtonLink`, `ProjectCard`, `TimelineEntry`, `SkillGroup`. Small presentational primitives use inline templates; `ProjectCard` and `TimelineEntry` use separate `.html` files. |
| 2.5 | ✅ | **Deviation from the plan:** validation is a Vitest suite (`content.validation.spec.ts`, 10 rules) rather than `scripts/validate-content.ts`, and `build:prod` is now `npm run test:ci && ng build --configuration production`. Same guarantee, no extra dependency, and it gets TypeScript and real imports for free. **Verified by injection:** replacing `availability` with `{{FILL_ME}}` makes `build:prod` exit **1**; restoring it exits **0**. |
| 2.6 | ✅ | `scripts/check-contrast.mjs` (not in the original plan) parses the tokens out of `styles.css` and gates every foreground/background pair. **24 pairs, 0 failures** — lowest light `learning`-on-surface 4.68:1, lowest dark `border-strong`-on-surface 3.64:1. |

**Defects the gates caught during Phase 2** (both real, both fixed):

- `ButtonLink` used a **property** binding for `target`, and `HTMLAnchorElement.target` coerces `null` to the string `"null"` — every internal link would have shipped `target="null"`. Now `[attr.target]`.
- `@angular-eslint/template/interactive-supports-focus` correctly rejected a `(keydown)` handler on the non-focusable `<header>`; Escape/Tab handling moved to a component `host` listener.

Bundle after Phase 2: **280 kB raw / 79 kB gzip** (budget ceilings are 300 kB warning / 350 kB error).

## Phase 3 — Sections

**✅ Complete.** All seven sections built as components under `pages/home/sections/`, composed by `home.html`. Verified against the **prerendered production build**, not just `ng serve`.

| Evidence | Result |
|---|---|
| Sections present in `browser/index.html` | `#top`, `#currently`, `#about`, `#experience`, `#skills`, `#projects`, `#contact` — all 7 |
| `<h1>` count | **1** (the hero) |
| Experience timeline entries | **6**, each with its date range (`Jun 2022 – Oct 2026` … `Dec 2006 – Jan 2008`) |
| Project cards | **7**, with repository links on exactly the 2 that have one |
| Skill groups | **6**, `learning` items visually distinct |
| Prerendered page size | 76,527 bytes (real content, not a shell) |
| `npm test` | **60 passed** (9 files), incl. 13 new integration assertions in `pages/home/home.spec.ts` |
| Lint / build | clean · 291 kB raw / 80 kB gzip · 2 routes prerendered |

Browser-verified beyond the build output:

- **Theming works with zero JavaScript.** Emulating `prefers-color-scheme: dark` resolves `--canvas` to `rgb(11,15,20)` and `--ink` to `rgb(232,238,245)` from `light-dark()` alone, with no `data-theme` set.
- **No horizontal overflow** at 320 / 360 / 390 / 768 / 1024 px (PRD NFR-6).
- **Sticky-header anchor fix confirmed**: `scroll-margin-top` computes to `72px` = the 56 px `--header-height` + 1rem, so a jump never hides the heading.
- **Mobile nav swaps correctly**: desktop nav `display: none`, toggle visible with `aria-expanded="false"`.
- External links carry `rel="noopener noreferrer"`; no phone number anywhere in the rendered text.

**Defects found by the visual pass and fixed:**

- The Contact lead rendered as **"Available immediately — Software engineering roles — .NET-adjacent…"** — availability and the open-to statement were concatenated with an em-dash, producing one run-on. Now two sentences, assembled in a computed signal.
- The Phase 1 placeholder home carried its **own `<main id="main">`** while the app shell provides one too. Removed — a duplicate landmark would have broken the skip link.

Original plan steps, for reference:

| Step | Action | Done when |
|------|--------|-----------|
| 3.1 | Hero `#top` — incl. the availability marker and a working résumé button | Matches PRD §6.1 |
| 3.2 | Currently `#currently` (3 items; SAA target **January 2027**) | Matches PRD §6.2 |
| 3.3 | About `#about` + "How this site is built" | Matches PRD §6.3 |
| 3.4 | Experience `#experience` — **all 6 entries**, newest first, with date ranges | Matches PRD §6.4 and §8 |
| 3.5 | Skills `#skills` (6 groups, honest labels, `learning` visually distinct, no React) | Matches PRD §6.5 |
| 3.6 | Projects `#projects` (7 cards from `projects.ts`) | Matches PRD §6.6 |
| 3.7 | Contact `#contact` + footer (no phone number) | Matches PRD §6.7 |
| 3.8 | 404 page | Matches PRD §6.8 |

## Phase 4 — Quality gates

| Step | Action | Done when |
|------|--------|-----------|
| 4.1 | Vitest: content modules, validator, obfuscation helper, every primitive | `npm test` green; ≥80% lines on `content/` and `core/` |
| 4.2 | Accessibility: WCAG 2.2 AA — contrast, keyboard-only pass, focus visible, skip link, `prefers-reduced-motion`, timeline semantics | 0 axe violations; Lighthouse a11y ≥ 95 |
| 4.3 | SEO: title/description, canonical, OG/Twitter (1200×630 image), `robots.txt`, `sitemap.xml`, JSON-LD `Person`, favicon set | Lighthouse SEO = 100 |
| 4.4 | Performance: budgets enforced, résumé PDF and OG image sized, no layout shift | Lighthouse Perf ≥ 95 mobile; LCP < 2.0 s throttled |
| 4.5 | Preview the real static output with a plain static server (not `ng serve`) | Prerendered HTML and anchor behaviour match production |
| 4.6 | Cross-browser/device spot check | No breakage in Chrome, Edge, Firefox, Safari/iOS |

## Phase 5 — AWS: S3 bucket *(you run these)*

Work from the project root in **git-bash**. Replace `{{BUCKET_NAME}}` (suggest `aizal-portfolio-site`) and `{{REGION}}` (suggest `ap-southeast-5` — Malaysia, closest to you; `us-east-1` is equally free-tier eligible).

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
| 6.1 | Upload a first build: `npm run build:prod` then `aws s3 sync dist/portfolio/browser/ s3://{{BUCKET_NAME}}/ --delete` | `upload: …` lines, then `aws s3 ls s3://{{BUCKET_NAME}}/` shows `index.html` |
| 6.2 | Create the CloudFront distribution (console is easiest): origin = the S3 **REST** endpoint, **Origin access control** = new OAC, viewer protocol = *Redirect HTTP to HTTPS*, allowed methods `GET, HEAD`, compress objects = Yes, default root object = `index.html`, price class = `PriceClass_100` | Distribution state → `Deployed` (~3–5 min) |
| 6.3 | Paste the bucket policy CloudFront suggests (it grants `s3:GetObject` to `cloudfront.amazonaws.com` for this distribution only) | Bucket stays fully private; `https://<d-id>.cloudfront.net/` returns your page |
| 6.4 | Response headers policy: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, CSP (per TRD §12) | `curl -I https://<d-id>.cloudfront.net/` shows every header |
| 6.5 | Custom error responses: **403 → `/404/index.html`, response code 404**; **404 → `/404/index.html`, response code 404** | A bad path renders the 404 page and returns `HTTP/2 404` |
| 6.6 | Verify caching: a hashed JS file vs `index.html` | JS → `max-age=31536000, immutable`; HTML → `max-age=0, must-revalidate` |
| 6.7 | **Explore the free tier while you're here** — note the CloudFront metrics view and where invalidation history lives. This is study material for the SAA exam. | You can describe the request flow viewer → CloudFront → OAC → S3 unaided |

**No ACM certificate and no Route 53 in v1** — CloudFront serves HTTPS on its own `*.cloudfront.net` domain for free.

## Phase 7 — Deploy automation

| Step | Action | Done when |
|------|--------|-----------|
| 7.1 | npm scripts: `build:prod`, `deploy:sync`, `deploy:html`, `deploy:invalidate`, `deploy` | `npm run deploy` publishes and invalidates in one command |
| 7.2 | Configuration in a gitignored `.env.deploy`: `BUCKET_NAME`, `DISTRIBUTION_ID`, `AWS_REGION` | Scripts run from a clean shell without editing files |
| 7.3 | Create the GitHub OIDC provider + deploy role (TRD §13.3 has the exact JSON) | `aws iam get-role --role-name github-actions-portfolio-deploy` shows the repo-scoped trust policy |
| 7.4 | Add `.github/workflows/deploy.yml`; set the three repository **variables** | Push to `main` deploys automatically; no AWS keys stored anywhere |
| 7.5 | Protect `main`: PR required, CI must pass | Branch protection visible in GitHub settings |

## Phase 8 — Verify, monitor, harden

| Step | Action | Done when |
|------|--------|-----------|
| 8.1 | `scripts/verify-deploy.sh` — fetch `/`, `/assets/aizal-resume.pdf`, `robots.txt`, `sitemap.xml`, a hashed asset, and a bad path | All return the expected status and content; the script exits non-zero on any failure |
| 8.2 | Lighthouse + axe against the **live CloudFront URL** | PRD NFR-1 met in production, not just locally |
| 8.3 | AWS Budget ($1–5/mo) + CloudWatch alarm on 5xx rate | Alarm fires on a simulated failure |
| 8.4 | Write `docs/RUNBOOK.md`: deploy, rollback, invalidation, cost, where each resource lives | Someone else could operate the site from that doc alone |
| 8.5 | Rollback drill: re-sync a previous `dist-<sha>` artifact from GitHub Actions | Previous version live in < 10 minutes |

## Phase 9 — Cleanup and next steps

### 9.4 Retire `mdaizal.github.io` *(you run these — decided: take it down)*

It was a test/experiment, and a second live portfolio competes with this one.

| Step | Action | Expected result |
|------|--------|-----------------|
| 9.4a | `curl -sI https://mdaizal.github.io` — record the current status before changing anything | `HTTP/2 200` (site is live now) |
| 9.4b | GitHub → repo `mdaizal.github.io` → **Settings → Pages → Unpublish site** (or set Source to *None*) | The site stops serving |
| 9.4c | GitHub → same repo → **Settings → General → Danger Zone → Delete this repository** | Repo gone; your public repo count drops from 4 to 3 |
| 9.4d | `curl -sI https://mdaizal.github.io` again | **404** — confirms the retirement |
| 9.4e | If you keep the repo but unpublish Pages, note it here — otherwise delete it | One portfolio, one URL, no ambiguity |

Order matters: unpublish first, then verify, then delete. Don't skip 9.4a — you want a before/after for your own confidence.

### 9.1–9.3, 9.5 Optional v2 (each doubles as AWS/Go practice)

| Step | Action | Why it's worth doing |
|------|--------|----------------------|
| 9.1 | **Go contact form**: API Gateway + Lambda (Go) + SES | Becomes the first real Go artifact (PRD §2) |
| 9.2 | Custom domain + Route 53 + ACM + `www` redirect | Professional URL; ~$12/yr domain + $0.50/mo zone |
| 9.3 | Re-implement Phases 5–7 as **AWS CDK or Terraform** | Directly reusable SAA knowledge; strong portfolio material |
| 9.5 | Blog / notes, starting with the SAA study path | Content pipeline that doubles as exam revision |

---

## Human-only steps (cannot be done by an agent)

- AWS console work and accepting the CloudFront-suggested bucket policy.
- Creating the GitHub repo, the OIDC provider, the IAM role and repository variables.
- Retiring `mdaizal.github.io` (Phase 9.4).
- Confirming the employment end date and availability (PRD §11 Q2).
- Approving the tone of the About narrative — especially how the non-development years are framed.

## Execution order

Phases 1–4 are strictly sequential. Then 5 → 6 → 7 → 8 in order. Phase 9.4 is independent and can be done any time. Stop after each phase, report the "Done when" evidence, then continue.

## Definition of done (project level)

- [ ] `https://<d-id>.cloudfront.net/` serves the site over valid HTTPS from CloudFront + a private S3 bucket.
- [ ] `curl -s https://<d-id>.cloudfront.net/ | grep -q "Mohd Aizal"` succeeds (proves prerendered HTML, not an empty shell).
- [ ] All 7 sections present; all 6 experience entries render with date ranges; every nav anchor scrolls and is not hidden behind the sticky header.
- [ ] `https://<d-id>.cloudfront.net/assets/aizal-resume.pdf` downloads.
- [ ] No phone number anywhere in the rendered page.
- [ ] Lighthouse mobile on the live URL: Perf ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO 100.
- [ ] `aws s3api get-public-access-block --bucket {{BUCKET_NAME}}` → all four `true`.
- [ ] Bad path returns `HTTP/2 404` and renders the 404 page.
- [ ] Push to `main` auto-deploys with zero static AWS credentials.
- [ ] `npm run deploy` works locally as an escape hatch.
- [ ] No `{{...}}` or `TODO` in the deployed build.
- [ ] `https://mdaizal.github.io` returns 404 (retired).
- [ ] `RUNBOOK.md` exists and a rollback has been rehearsed once.
