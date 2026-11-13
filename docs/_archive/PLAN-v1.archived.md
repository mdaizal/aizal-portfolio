# PLAN.md — Portfolio Site: Build & Deploy Plan

> Execution plan for an Angular static portfolio site deployed to AWS S3 + CloudFront.
> Companion documents: `PRD.md` (what to build), `TRD.md` (how to build it).
> Audience: **Pi** (coding agent) + the site owner.

---

## 0. Decisions locked in (defaults — change any line and the docs stay valid)

| # | Decision | Default chosen | Why |
|---|----------|----------------|-----|
| D1 | Hosting | **S3 (private) + CloudFront + OAC + custom domain + ACM TLS** | Real HTTPS URL, no "index.html" in links, no public bucket. |
| D2 | Rendering | **Prerendered static (SSG)**, `outputMode: "static"` | SEO-crawlable HTML per route, no Node server, still fully static. |
| D3 | Page structure | **Multi-page, Angular Router**: `/`, `/about`, `/projects`, `/contact`, `/404` | Shows routing skill; clean shareable links per section. |
| D4 | Styling | **Tailwind CSS v4 + CSS custom-property design tokens** | Fast to build, easy for an agent to stay consistent; no heavy UI kit. |
| D5 | CI/CD | **Manual npm scripts first, then GitHub Actions with OIDC** | Unblocks day-one deploys; OIDC = no long-lived AWS keys in GitHub. |
| D6 | Language of content | English | — |
| D7 | Domain | `{{DOMAIN}}` — must be purchased before Phase 5 | Not purchasable by an agent; see "Human-only steps". |

Every personal detail is written as `{{PLACEHOLDER}}` in the PRD — fill those in before Pi starts.

---

## Phase 0 — Prerequisites (human-only, do first)

| Step | Action | Done when |
|------|--------|-----------|
| 0.1 | Confirm AWS account + credentials (`aws sts get-caller-identity`) | Returns an account ID |
| 0.2 | Register domain (Route 53, or registrar + Route 53 hosted zone) | `Node: {{DOMAIN}}` exists in Route 53 |
| 0.3 | Install Node 26 LTS | `node -v` → `v26.x` |
| 0.4 | `npm i -g @angular/cli@22` | `ng version` prints 22.x |
| 0.5 | Confirm AWS CLI v2 | `aws --version` → `aws-cli/2.x` |
| 0.6 | GitHub repo created (empty), branch `main` | Repo URL known |
| 0.7 | Fill every `{{PLACEHOLDER}}` in `PRD.md` | No `{{` remains in PRD |

## Phase 1 — Repository & scaffold

| Step | Action | Done when |
|------|--------|-----------|
| 1.1 | `ng new portfolio --style=scss --ssr=false --routing` then `ng add @angular/ssr` (needed for prerender config) | `npm start` serves a hello-world page |
| 1.2 | Set `outputMode: "static"` in `angular.json` build options | `npm run build` emits `dist/portfolio/browser/index.html` and **no** `server/` dir |
| 1.3 | Add Tailwind v4 (`.postcssrc.json` + `@import "tailwindcss"` in `styles.scss`) | A utility class visibly applies |
| 1.4 | Add `.nvmrc` (`26`), `.editorconfig`, Prettier + ESLint, `.gitignore` | `npm run lint` passes on the scaffold |
| 1.5 | Add `docs/`, `README.md`, commit `chore: scaffold` | Clean first commit pushed |

## Phase 2 — Design system & content model

| Step | Action | Done when |
|------|--------|-----------|
| 2.1 | Implement design tokens (color, type scale, spacing, radii, shadows) as CSS custom properties in `styles.scss` | Tokens defined; light + dark values present |
| 2.2 | Build layout shell: header nav, mobile menu, footer, skip-link | Nav works on 375px and 1440px widths |
| 2.3 | Create typed content modules under `src/app/content/` (`profile.ts`, `experience.ts`, `skills.ts`, `projects.ts`) per TRD §5 | All fields typed, no `any`, PRD content transcribed |
| 2.4 | Reusable primitives: `SectionHeading`, `TagChip`, `ProjectCard`, `TimelineEntry`, `ButtonLink` | Each has a unit test |

## Phase 3 — Pages

| Step | Action | Done when |
|------|--------|-----------|
| 3.1 | `/` Home — hero (name, title, one-line pitch), primary CTAs, pivot narrative, skills strip, featured projects, CTA band | Matches PRD §6.1 |
| 3.2 | `/about` — narrative timeline (.NET era → pivot), skills by category, education/certs | Matches PRD §6.2 |
| 3.3 | `/projects` — full card grid from `projects.ts` (min 4 entries) | Matches PRD §6.3 |
| 3.4 | `/contact` — email/`mailto:` + social links, no backend form | Matches PRD §6.4 |
| 3.5 | `/404` — not-found page, wired to CloudFront custom error responses | Direct hit on a bad URL returns the SPA 404 page, status 404 |
| 3.6 | Lazy-load non-home routes; route transitions + focus management on navigation | Initial JS bundle within budget (TRD §9) |

## Phase 4 — Quality gates

| Step | Action | Done when |
|------|--------|-----------|
| 4.1 | Unit tests for content modules + components (Vitest) | `npm test` green, ≥80% lines on `src/app/content` |
| 4.2 | Accessibility pass: WCAG 2.2 AA contrast, keyboard nav, labels, `prefers-reduced-motion` | 0 violations in axe DevTools + Lighthouse a11y ≥ 95 |
| 4.3 | SEO: per-route `title`/`description`, canonical, OG/Twitter tags, `robots.txt`, generated `sitemap.xml`, JSON-LD `Person`, favicon set | Lighthouse SEO = 100 |
| 4.4 | Perf: budgets in `angular.json`, lazy images, correct `width`/`height` | Lighthouse Perf ≥ 95 mobile; LCP < 2.0s on throttled |
| 4.5 | Cross-browser/device spot check (Chrome, Edge, Firefox, Safari/iOS) | No layout breakage |

## Phase 5 — AWS foundation: S3

| Step | Action | Done when |
|------|--------|-----------|
| 5.1 | `aws s3api create-bucket --bucket {{BUCKET_NAME}} --region {{REGION}}` | `aws s3 ls` lists it |
| 5.2 | Block all public access; **do not** enable S3 static website hosting | `aws s3api get-public-access-block` → all `true` |
| 5.3 | Upload a put-object to smoke-test, then delete it | CLI write path proven |
| 5.4 | Create deploy IAM policy (TRD §13.2) — `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` scoped to the bucket ARN | `aws iam simulate-principal-policy` allows writes, denies others |
| 5.5 | Push a first real `aws s3 sync` of `dist/portfolio/browser/` | Objects present with correct `Cache-Control` metadata |

## Phase 6 — CloudFront, TLS & domain

| Step | Action | Done when |
|------|--------|-----------|
| 6.1 | Request ACM cert for `{{DOMAIN}}` + `www.{{DOMAIN}}` in **us-east-1** | Status `ISSUED` |
| 6.2 | Create CloudFront distribution: S3 REST origin + OAC (SigV4), default root `index.html`, `compress: true`, HTTP/2+3, PriceClass_100 | Distribution `Deployed` |
| 6.3 | Attach response-headers policy (HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) | `curl -I` shows all headers |
| 6.4 | Cache behaviours: hashed assets `max-age=31536000, immutable`; HTML `no-cache` | Verified via `curl -I` on a JS file vs `index.html` |
| 6.5 | Custom error responses: 403 & 404 → `/404.html` with HTTP 404 | Bad URL renders the 404 page with a real 404 status |
| 6.6 | Route 53 alias `A`/`AAAA` → CloudFront for apex + `www` (redirect `www` → apex or vice versa) | `https://{{DOMAIN}}` loads over TLS |

## Phase 7 — Deploy automation

| Step | Action | Done when |
|------|--------|-----------|
| 7.1 | `package.json` scripts: `build:prod`, `deploy:sync`, `deploy:invalidate`, `deploy` | `npm run deploy` publishes and invalidates in one command |
| 7.2 | Create GitHub OIDC provider + deploy role with trust policy (TRD §13.3) | `aws iam get-role` shows the repo-scoped trust |
| 7.3 | Add `.github/workflows/deploy.yml` (build → OIDC assume → sync → invalidate) | Push to `main` deploys automatically; no AWS keys in repo |
| 7.4 | Protect `main`: PR required, CI must pass | Branch protection visible in GitHub settings |

## Phase 8 — Verify, monitor, harden

| Step | Action | Done when |
|------|--------|-----------|
| 8.1 | Post-deploy verification script: fetch `/`, each route, `robots.txt`, `sitemap.xml`, 404 path | All return expected status + content |
| 8.2 | Lighthouse + axe run against the **live URL** | Budgets met in production |
| 8.3 | AWS Budget ($5/mo) + CloudWatch alarm on 5xx rate | Alarm fires on a simulated failure |
| 8.4 | Write `docs/RUNBOOK.md`: deploy, rollback, cache-invalidation, cost, cert renewal | Another person could operate it from the doc alone |
| 8.5 | Rollback drill: restore previous `dist/` from GitHub Actions artifact | Previous version live in < 10 min |

---

## Human-only steps (an agent cannot do these)

- Buying the domain / creating the Route 53 hosted zone (billing).
- Confirming ACM validation (DNS records are automatable if the zone is in Route 53; email validation is not).
- Publishing GitHub secrets/roles if it is not authorized to create IAM resources.
- Supplying the real résumé PDF, headshot, project screenshots, and social URLs.
- Reviewing copy for tone (the PRD gives structure; the owner's voice must approve the final wording).

## Work order for Pi

Phases are sequential **within** each Phase 5→6→7 chain. Phases 1–4 are strictly sequential.
Suggested execution: `1 → 2 → 3 → 4` (site works locally) → `5 → 6` (site live on AWS) → `7 → 8` (automated + hardened).
Stop after each phase, report the "Done when" evidence, then continue.

## Definition of done (project level)

- [ ] `https://{{DOMAIN}}` serves over valid TLS from CloudFront/S3.
- [ ] All 4 routes + 404 prerender to real HTML (`curl` returns content, not an empty shell).
- [ ] Lighthouse: Perf ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO 100 — on mobile, in production.
- [ ] Push to `main` auto-deploys with zero static AWS credentials in the repo.
- [ ] `npm run deploy` works locally as an escape hatch.
- [ ] No `{{PLACEHOLDER}}` strings remain in shipped content.
- [ ] `RUNBOOK.md` exists and a rollback has been rehearsed once.
