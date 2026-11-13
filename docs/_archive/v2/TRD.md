# TRD.md — Technical Requirements Document

| Field | Value |
|---|---|
| Project | Angular single-page portfolio on AWS S3 + CloudFront |
| Doc version | 2.0 (single page; real content; owner-runs-AWS workflow) |
| Status | Implementation spec — authoritative for Pi |
| Related | `PLAN.md`, `PRD.md` |
| Verified against | Angular 22.2.6, Node 26.13.1, npm 12.2.2, AWS CLI 2.40.1 (Nov 2026) |

---

## 1. Architecture

```
                        you run: npm run deploy  (or push to main)
                                    │
        ┌───────────────────────────┴────────────────────────────┐
        │  build: ng build --configuration production             │
        │  → prerender → dist/portfolio/browser/                  │
        └───────────────────────────┬────────────────────────────┘
                                    ▼
   ┌────────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
   │ GitHub Actions (OIDC)  │──▶│  aws s3 sync (2 passes)│──▶│  S3 bucket (private) │
   │ no stored AWS keys     │   │  + cache-control md    │   │  Block Public: ON    │
   └────────────────────────┘   │  + cloudfront          │   │  Versioning: ON      │
                                │    create-invalidation │   └──────────┬───────────┘
                                └──────────────────────┘              │ OAC (SigV4)
                                                                      ▼
   viewer ──https──▶ ┌─────────────────────────────────────────────────────────┐
                    │ CloudFront  (*.cloudfront.net, free tier TLS)           │
                    │  default root: index.html · compress · HTTP/2+3         │
                    │  response headers policy (HSTS, CSP, nosniff, …)        │
                    │  cache policy: HTML revalidate · assets immutable       │
                    │  custom errors: 403→/404 (404) · 404→/404 (404)        │
                    └─────────────────────────────────────────────────────────┘
```

### Key architecture decisions

| # | Decision | Rationale |
|---|----------|-----------|
| A1 | CloudFront + **OAC** against the S3 **REST** endpoint (not the S3 *website* endpoint) | Website endpoints cannot do HTTPS or OAC. OAC keeps the bucket fully private while giving real TLS and a CDN. |
| A2 | **SSG / prerender**, `outputMode: "static"` | Real HTML in the first response (fast LCP, crawlable), no Node server to run or patch. |
| A3 | **CloudFront default domain in v1**, custom domain in v2 | $0 and HTTPS immediately; no Route 53 zone ($0.50/mo) or domain ($12/yr) needed to ship. |
| A4 | Angular 22 defaults: **zoneless**, signals, `OnPush` | No `zone.js` in the bundle; explicit change detection. |
| A5 | In-page navigation uses **plain `<a href="#anchor">`**, not router fragment navigation | Works without JavaScript, no history pollution, anchors are directly deep-linkable and shareable. |
| A6 | Content in **typed TS modules**, validated at build time | Type safety and a build that fails on placeholders missing content. |
| A7 | Repo holds **no AWS credentials**; CI uses GitHub **OIDC** | Nothing to leak or rotate. |
| A8 | Deploy IAM role is **least privilege**, scoped to one bucket + one distribution | Limits blast radius if CI is compromised. |
| A9 | **The owner runs all AWS commands**; the agent produces them | Owner's explicit preference, and it builds the hands-on AWS experience the site is about. |

## 2. Tech stack (pin these)

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| Framework | Angular | **22.x** (`^22.2.0`) | Active support until 2027-06 |
| Language | TypeScript | as shipped with Angular 22 | `strict: true`, `strictTemplates: true` |
| Build runtime | Node.js | **26.13.1** ("Lithium", Active LTS) | ✅ installed; `.nvmrc` → `26` |
| Package manager | npm | **12.2.2** (engines: `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0`) | ✅ installed; `package-lock.json` committed |
| Styling | Tailwind CSS | **v4.x** via `@tailwindcss/postcss` | v4 needs no `tailwind.config.js` unless extending |
| Unit tests | **Vitest** | as shipped | Angular 22's default runner; Karma/Jasmine is legacy, experimental Jest/WTR builders were removed |
| Hosting | Amazon S3 | — | Private bucket, versioning on, tagging on |
| CDN + TLS | Amazon CloudFront | — | Free-tier TLS on the default domain; ACM/Route 53 deferred |
| Automation | GitHub Actions | — | OIDC → least-privilege IAM role |
| IaC (deferred) | AWS CDK or Terraform | — | Phase 9.3 |

## 3. Repository layout

```
portfolio-site/
├─ .github/workflows/deploy.yml
├─ docs/  PLAN.md  PRD.md  TRD.md  RUNBOOK.md  _archive/
├─ scripts/
│  ├─ validate-content.ts     # build-time content gate
│  ├─ deploy.sh               # local deploy escape hatch (git-bash)
│  └─ verify-deploy.sh        # post-deploy verification
├─ src/
│  ├─ app/
│  │  ├─ app.ts / app.html / app.scss
│  │  ├─ app.config.ts         # provideZonelessChangeDetection, provideRouter, provideClientHydration
│  │  ├─ app.routes.ts         # '' → Home, '404' → NotFound, '**' → NotFound
│  │  ├─ app.routes.server.ts  # RenderMode per route (see §4.1)
│  │  ├─ core/
│  │  │  ├─ seo.service.ts     # title/description/canonical/OG via Title + Meta services
│  │  │  ├─ obfuscate.ts       # email assembly
│  │  │  └─ active-section.ts  # IntersectionObserver scroll-spy (progressive enhancement)
│  │  ├─ content/  models.ts  profile.ts  experience.ts  skills.ts  projects.ts  certs.ts
│  │  ├─ layout/   header/  footer/  skip-link/  monogram/
│  │  ├─ shared/   section-heading/  tag-chip/  project-card/  timeline-entry/  skill-group/  button-link/
│  │  └─ pages/    home/  not-found/
│  ├─ assets/  og-image.png  favicon*  icons/  (aizal-resume.pdf when supplied)
│  ├─ styles.scss              # @import "tailwindcss"; tokens; base layer
│  └─ index.html
├─ angular.json  package.json  package-lock.json  .nvmrc  .postcssrc.json
└─ README.md
```

## 4. Angular application architecture

### 4.1 Bootstrap

Angular 22 is zoneless by default — **do not add `zone.js`**. Standalone components only; no `NgModule`s.

```ts
// app.config.ts (specification)
provideZonelessChangeDetection()
provideRouter(routes)
provideClientHydration()   // hydration of the prerendered HTML
```

Routes — a single page plus an explicit 404 route:

```ts
// app.routes.ts
export const routes: Routes = [
  { path: '',    loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: '404', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) },
  { path: '**',  loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) },
];
```

```ts
// app.routes.server.ts — static output mode rejects RenderMode.Server
export const serverRoutes: ServerRoute[] = [
  { path: '',    renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  { path: '**',  renderMode: RenderMode.Client },   // never reachable in practice: CloudFront maps 403/404 → /404/
];
```

> **Verify empirically in Phase 1.3.** Build once with these routes and inspect `dist/portfolio/browser/` to confirm `index.html`, `404/index.html` and `index.csr.html` are produced as expected, and that the wildcard route does not generate a stray error file. Record the observed behaviour in this section before building the rest of the app. Do not assume — this is the single most likely place for the deploy to surprise you.

### 4.2 In-page navigation (single page, D3)

- Nav items are real anchors: `<a href="#about">About</a>`, `#experience`, `#skills`, `#projects`, `#contact`.
- Each section carries its own `id` matching the anchor exactly.
- `html { scroll-behavior: smooth }` wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Every section gets `scroll-margin-top: <header height + 1rem>` so the sticky header never covers the heading after a jump.
- Scroll-spy (`core/active-section.ts`) uses `IntersectionObserver` to set `aria-current="true"` on the active nav link. It is **progressive enhancement only** — with JavaScript disabled the links must still navigate correctly.
- The skip link and browser focus order must work with no JavaScript at all.

### 4.3 Component rules

- `standalone: true`; v22's default change detection (`OnPush`) everywhere.
- State via signals: `signal()`, `computed()`, `input()`, `output()`, `linkedSignal()`.
- **No `subscribe()` anywhere** in v1 (there is no HTTP). If one ever appears it must be in a `takeUntilDestroyed()` chain.
- Template control flow: `@if` / `@for` (with `track`) / `@switch` — never `*ngIf` / `*ngFor`.
- No `any`; no non-null assertions in templates; `strictTemplates` on.
- One component per folder; class naming consistent (`HomeComponent` style suffixes throughout — pick one and never mix).
- ~200 lines max per component file; extract primitives rather than growing a page component.

### 4.4 HTML shell

- `<html lang="en">`, `<base href="/">`.
- Critical meta inline in `index.html` (title, description, theme-color) as a fallback.
- Do **not** disable `index.html` generation — leave the CSR entry (`index.csr.html`) in place as a safety net for any path that is not prerendered.

## 5. Content layer (typed, build-validated)

```ts
// content/models.ts
export type Level = 'learning' | 'working' | 'proficient' | 'strong';

export interface Profile {
  fullName: string; shortName: string; role: string; subtitle: string; pitch: string;
  location: string; workMode: string; email: string;
  github: string; linkedin?: string;
  resumeUrl: string | null;     // null → résumé button is not rendered (PRD FR-1.4)
  currently: string[];          // exactly 3 items (PRD FR-2.1)
  openTo: string; responseExpectation: string;
}
export interface ExperienceEntry {
  role: string; org: string; period: string; location?: string;
  achievements: string[]; tags: string[];
}
export interface SkillItem { name: string; level: Level }
export interface SkillGroup { category: 'Languages' | '.NET & Web' | 'Cloud & Infrastructure' | 'Data' | 'Ways of working'; items: SkillItem[] }
export interface Project {
  slug: string; title: string; period: string; summary: string; bullets: string[];
  tags: string[]; domain: 'dotnet' | 'aws' | 'go'; featured?: boolean;
  repoUrl?: string; liveUrl?: string; writeUpUrl?: string;
}
export interface Cert { name: string; issuer: string; status: 'earned' | 'in-progress' | 'planned'; date?: string; url?: string }
```

Build-time validator (`scripts/validate-content.ts`, runs before `ng build`):

1. Fail if any string field contains `{{` or `TODO`.
2. Fail if `projects.length < 5`.
3. Fail if no project has `domain === 'aws'`.
4. Fail if `profile.currently.length !== 3`.
5. Fail if any `SkillItem.level` is not one of the four allowed labels (guards against percentages creeping in — PRD FR-5.2).
6. Fail if `projects` has more than one entry whose `domain === 'go'` while no Go artifact exists — a reminder that Go stays in the `Currently` section, not the project list (PRD §2).

## 6. Styling & design system

### 6.1 Tokens
Defined in `styles.scss` under Tailwind v4's `@theme` (or as plain custom properties). Components use tokens only — **no raw hex in component styles**.

```
--color-bg, --color-surface, --color-border
--color-fg, --color-muted, --color-accent, --color-accent-fg
--color-learning (distinct accent for `learning` skill labels — PRD FR-5.3)
--font-sans, --font-mono
--text-xs … --text-3xl
--space-1 … --space-16
--radius-sm|md|lg|full
--shadow-sm|md
--header-height   (drives scroll-margin-top)
```

- Light + dark via `prefers-color-scheme`, plus a manual override attribute (`[data-theme="dark"]`) persisted in `localStorage` behind try/catch.
- Contrast: text ≥ 4.5:1, large text and UI/borders ≥ 3:1. Check every token pair before building sections.

### 6.2 Breakpoints

| Name | Min width | Use |
|------|-----------|-----|
| `sm` | 640 px | 2-column project grid |
| `md` | 768 px | Nav switches to the full horizontal bar |
| `lg` | 1024 px | 3-column project grid |
| `xl` | 1280 px | Wider hero typography only |

Mobile-first. Content column max width 72 rem, `clamp()` page padding. No horizontal scroll at 320 px.

### 6.3 Motion
Transitions ≤ 200 ms `ease-out`, animating only `transform`/`opacity`. Smooth anchor scrolling only under `prefers-reduced-motion: no-preference`.

## 7. SEO, metadata, discoverability

Single-page consequences: one canonical URL, one title/description, sitemap contains one entry. Anchor sections are **not** separate URLs — do not invent `#about` entries in the sitemap.

| Item | Requirement |
|------|-------------|
| Title | `Mohd Aizal Baharuddin — Software Engineer` (≤ 60 chars) |
| Description | 120–160 chars, mentioning .NET, AWS and Go |
| Canonical | `https://<distribution-domain>/` (self-referencing; swap to the custom domain in v2) |
| OG/Twitter | `og:title`, `og:description`, `og:image` (`og-image.png`, 1200×630), `og:url`, `og:type=website`, `twitter:card=summary_large_image` |
| JSON-LD | `Person` with `name`, `jobTitle`, `url`, `sameAs[]` (GitHub + LinkedIn), `knowsAbout[]`, `alumniOf` |
| `robots.txt` | Allow all; `Sitemap: https://<distribution-domain>/sitemap.xml` |
| `sitemap.xml` | One `<url>` for `/`, with `lastmod` from the build date |
| `/404/` | `<meta name="robots" content="noindex">` |
| Favicon | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` (180×180), `site.webmanifest` |
| Headings | Exactly one `<h1>` (the hero); each section opens with an `<h2>`; no skipped levels |

Meta must be set through Angular's `Title` / `Meta` services so it renders **during prerender** — never by mutating `document` directly.

## 8. Accessibility (WCAG 2.2 AA)

- Landmarks: `<header>`, `<nav aria-label="Main">`, `<main id="main">`, `<footer>`; sections use `<section aria-labelledby="…">`.
- Skip link as the first focusable element, visible on focus, targeting `#main`.
- Visible focus ring on every interactive element (`:focus-visible`, ≥ 2 px, ≥ 3:1 contrast).
- Mobile menu: `aria-expanded`, `aria-controls`, Escape closes it, focus returns to the toggle, focus trapped while open.
- Scroll-spy sets `aria-current`, never colour alone.
- External links: `rel="noopener noreferrer"` + an accessible "opens in a new tab" indication.
- Résumé link announces file type and size ("PDF, 120 KB") when present.
- Icons `aria-hidden="true"` unless they are the only label.
- Images: meaningful `alt` or `alt=""`; never the filename.
- Verified with axe DevTools, a keyboard-only pass, and Lighthouse a11y ≥ 95.

## 9. Build configuration & budgets

```jsonc
"build": {
  "options": {
    "outputPath": { "base": "dist/portfolio", "browser": "browser" },
    "outputMode": "static",           // prerender; no server bundle
    "index": "src/index.html",
    "browser": "src/main.ts",
    "styles": ["src/styles.scss"],
    "assets": ["src/assets", { "glob": "**/*", "input": "public" }],
    "optimization": true,
    "sourceMap": false
  },
  "configurations": {
    "production": {
      "budgets": [
        { "type": "initial", "maximumWarning": "180kB", "maximumError": "220kB" },
        { "type": "anyComponentStyle", "maximumWarning": "6kB", "maximumError": "10kB" }
      ],
      "outputHashing": "all"
    },
    "development": { "optimization": false, "sourceMap": true, "outputHashing": "none" }
  },
  "defaultConfiguration": "production"
}
```

- Budgets are hard gates in CI.
- **Deploy `dist/portfolio/browser/`** — never `dist/portfolio/`.
- Expected post-build artifacts: `browser/index.html` (prerendered page), `browser/404/index.html`, `browser/index.csr.html`, hashed `*.js`/`*.css`, `browser/og-image.png`, `browser/robots.txt`, `browser/sitemap.xml`.

## 10. Testing strategy

| Level | Tool | Scope | Gate |
|-------|------|-------|------|
| Unit | Vitest (`npm test`) | Content validator accepts real data and rejects placeholders; `SeoService` sets meta; obfuscation helper; every shared primitive renders | Must pass; ≥80% lines on `content/` and `core/` |
| Content | `scripts/validate-content.ts` | The six rules in §5 | **Build fails** on violation |
| A11y | axe (manual, or `@axe-core/playwright` later) | The live page and the 404 page; 0 critical/serious | Phase 4 gate |
| E2E (optional) | Playwright | Anchors scroll correctly, résumé button absent/present, mobile menu, 404 path | Phase 9 |
| Performance | Lighthouse | PRD NFR-1/NFR-2 | Phase 4 + 8 gates |

Test files: `*.spec.ts`, co-located. Vitest runs in Node with jsdom/happy-dom — no browser needed.

## 11. AWS — S3

Bucket `{{BUCKET_NAME}}` (suggest `aizal-portfolio-site`), region `{{REGION}}` (suggest `ap-southeast-5` for latency; `us-east-1` is equally free-tier eligible).

| Setting | Value | Why |
|---------|-------|-----|
| Block Public Access | **all four ON** | CloudFront reads via OAC; nothing is public |
| Static website hosting | **DISABLED** | Conflicts with OAC and is HTTP-only |
| Versioning | Enabled | Recover from a bad sync |
| Default encryption | SSE-S3 (AES256) | Free, automatic |
| Lifecycle | noncurrent versions expire after 30 days | Contains version sprawl |
| Object ownership | `BucketOwnerEnforced` | Modern default; ACLs disabled |
| Tags | `Project=portfolio-site`, `Owner=aizal` | Cost attribution |

Commands and expected output: `PLAN.md` Phase 5.

## 12. AWS — CloudFront, headers, caching, errors

**Origin:** S3 REST endpoint, **Origin Access Control** (SigV4, sign requests). Not the website endpoint.

| Setting | Value |
|---------|-------|
| Viewer protocol policy | Redirect HTTP → HTTPS |
| Allowed methods | `GET, HEAD` |
| Default root object | `index.html` |
| Compression | Enabled (CloudFront auto-compresses gzip/brotli) |
| Supported HTTP versions | HTTP/2 and HTTP/3 |
| Price class | `PriceClass_100` (cheapest; widen if the audience is global) |
| Alternate domain names / ACM | **None in v1** (uses the default `*.cloudfront.net` certificate); added in v2 |
| WAF | Not in v1 (cost); revisit if abuse appears |

**Cache-Control is set at upload time** (CloudFront honours origin headers). `deploy:sync` applies one value per pass, so the npm scripts split the upload into two passes:

| Paths | `Cache-Control` |
|-------|-----------------|
| `*.js`, `*.css`, `*.woff2`, hashed assets | `public, max-age=31536000, immutable` |
| `*.html`, `index.html`, `index.csr.html`, `404/index.html` | `public, max-age=0, must-revalidate` |
| `*.png`, `*.jpg`, `*.svg`, `*.webp`, `*.avif`, `*.ico` | `public, max-age=604800` |
| `*.pdf` (résumé) | `public, max-age=604800` |
| `robots.txt`, `sitemap.xml` | `public, max-age=3600` |

**Custom error responses:**

| HTTP code from origin | Response page | HTTP code to viewer |
|---|---|---|
| 403 | `/404/index.html` | 404 |
| 404 | `/404/index.html` | 404 |

Rationale: the bucket is private, so a missing object reaches CloudFront as `403`. Both codes must therefore be mapped. Because the page is prerendered, a genuine 404 page with a real 404 status is correct here — do **not** fall back to the app shell, and do not return 200.

**Response headers policy:**
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
  img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self';
  form-action 'self'; frame-ancestors 'none'; object-src 'none'
```
`style-src 'unsafe-inline'` is required if component styles are injected at runtime. Tighten it if a nonce-based CSP proves achievable, and record the decision in `RUNBOOK.md`.

## 13. Deployment & CI/CD

### 13.1 npm scripts

```jsonc
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "validate:content": "tsx scripts/validate-content.ts",
    "build:prod": "npm run validate:content && ng build --configuration production",
    "test": "ng test --watch=false",
    "lint": "ng lint",
    "deploy:sync": "bash scripts/deploy.sh sync",
    "deploy:invalidate": "bash scripts/deploy.sh invalidate",
    "deploy": "npm run build:prod && bash scripts/deploy.sh all",
    "verify:deploy": "bash scripts/verify-deploy.sh"
  }
}
```

`scripts/deploy.sh` (git-bash) performs, in this exact order — **assets first, HTML second, invalidate last** — so there is never a window where HTML references an asset that has not uploaded yet:

1. Guard: assert `dist/portfolio/browser/index.html` exists, else exit non-zero with a clear message. (This catches the classic `dist/portfolio` mistake.)
2. `aws s3 sync dist/portfolio/browser/ s3://{{BUCKET_NAME}}/ --delete --exclude "*.html" --cache-control "public,max-age=31536000,immutable"`
3. `aws s3 sync dist/portfolio/browser/ s3://{{BUCKET_NAME}}/ --exclude "*" --include "*.html" --cache-control "public,max-age=0,must-revalidate"`
4. `aws cloudfront create-invalidation --distribution-id {{DISTRIBUTION_ID}} --paths "/" "/index.html" "/index.csr.html" "/404/*" "/sitemap.xml" "/robots.txt"`

Hashed assets are immutable and never need invalidating. `--delete` in step 2 removes stale hashed bundles; HTML is deliberately excluded from that pass so its short cache headers are applied separately.

Configuration comes from a gitignored `.env.deploy`: `BUCKET_NAME`, `DISTRIBUTION_ID`, `AWS_REGION`.

### 13.2 Deploy IAM policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "ListBucket", "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::{{BUCKET_NAME}}" },
    { "Sid": "WriteObjects", "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:AbortMultipartUpload"],
      "Resource": "arn:aws:s3:::{{BUCKET_NAME}}/*" },
    { "Sid": "Invalidate", "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": "arn:aws:cloudfront::{{ACCOUNT_ID}}:distribution/{{DISTRIBUTION_ID}}" }
  ]
}
```

No `s3:*`, no bucket deletion, no IAM rights, no other distributions.

### 13.3 GitHub Actions with OIDC

One-time setup (you do this in the console):

1. Create the OIDC provider for `token.actions.githubusercontent.com`, audience `sts.amazonaws.com`.
2. Create role `github-actions-portfolio-deploy` with the trust policy below; attach the §13.2 policy.
3. Add repository **variables** (not secrets — none of these are sensitive): `AWS_DEPLOY_ROLE_ARN`, `BUCKET_NAME`, `DISTRIBUTION_ID`, `AWS_REGION`.

```jsonc
// trust policy — scoped to the repo AND the main branch
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::{{ACCOUNT_ID}}:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:{{GITHUB_OWNER}}/{{GITHUB_REPO}}:ref:refs/heads/main" }
    }
  }]
}
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push: { branches: [main] }
  workflow_dispatch:

permissions:
  id-token: write      # required for OIDC
  contents: read

concurrency:
  group: deploy-main
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5          # pin to the latest major at implementation time
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test                      # includes the content validator
      - run: npm run build:prod            # fails on budget or content violation
      - uses: aws-actions/configure-aws-credentials@v5   # latest major; OIDC, no static keys
        with:
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}
      - run: bash scripts/deploy.sh all
      - uses: actions/upload-artifact@v4   # enables rollback (PLAN 8.5)
        with:
          name: dist-${{ github.sha }}
          path: dist/portfolio/browser/
          retention-days: 30
```

## 14. Security

- S3 bucket fully private; CloudFront is the only reader, via OAC.
- No AWS access keys in the repo, in Actions, or in the built site; `.env.deploy` and `.env*` gitignored.
- HTTPS enforced (`redirect-to-https`) plus HSTS.
- CSP as in §12; `frame-ancestors 'none'` prevents clickjacking.
- Email assembled in TS to reduce naive scrapers — friction, not a security control.
- Résumé PDF is public by design while the button is rendered; remove it if that decision changes.
- `npm audit` in CI: non-blocking warning in v1, blocking on `critical`.
- A compromised CI run can only write to this one bucket and invalidate this one distribution.
- Accidental secret commit → rotate immediately; do not rely on rewriting history.

## 15. Observability, cost, operations

| Concern | Approach |
|---------|----------|
| Uptime | CloudWatch synthetic canary, or an external 1-minute monitor on `/` and `/404/` |
| Errors | CloudFront 4xx/5xx rate metrics → CloudWatch alarm (PLAN 8.3) |
| Cost (v1) | **$0/month** — CloudFront free tier covers 1 TB egress + 10 M requests/month permanently; S3 storage is pennies; no Route 53, no ACM, no domain |
| Cost (v2) | + ~$12/yr domain, + $0.50/mo hosted zone |
| Budget guard | AWS Budget at $1–5/mo with an email alert; usage alarm at 50 GB egress |
| Access | Root account has MFA; deploys use a scoped role |
| Rollback | Re-sync a previous `dist-<sha>` artifact, then invalidate the HTML paths |
| Cert renewal | N/A in v1 (CloudFront's default certificate). In v2, ACM auto-renews while the DNS validation records stay in Route 53 |

## 16. Local development

```bash
nvm use                     # → Node 26 from .nvmrc
npm ci
npm start                   # ng serve → http://localhost:4200
npm test                    # Vitest, single run
npm run build:prod          # must pass content validation + budgets
npx serve dist/portfolio/browser   # preview the real static output BEFORE deploying
```

Always preview with a static server rather than `ng serve`: `ng serve` does not exercise prerendered HTML, extensionless paths or the 404 behaviour the way CloudFront will.

## 17. Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Wildcard-route prerender behaviour differs from expectation | Missing or stray 404 output; a broken catch-all | Verified empirically in PLAN 1.3 before any other work; record the actual result here |
| Deploying `dist/portfolio` instead of `dist/portfolio/browser` | Directory listing / broken site | `deploy.sh` asserts `browser/index.html` exists and exits non-zero otherwise |
| Assuming SPA-style fallback for unknown paths | Wrong status codes or a blank page | Explicit `404` route prerendered + CloudFront 403/404 → `/404/index.html` with a real 404 |
| Sticky header covering anchor targets | Nav feels broken | `scroll-margin-top` driven by `--header-height`, verified at 320 px and 1440 px |
| Budget regression | PRD NFR-1 missed | CI-enforced Angular budgets + Lighthouse gate |
| Placeholder text shipping | Unprofessional and worse than no site | Content validator fails the build on `{{` or `TODO` |
| HTML cached too long | Stale site for hours | HTML `max-age=0` + explicit invalidation on every deploy |
| `--delete` removing a needed object | Broken asset | Assets uploaded before HTML; every successful build retained as an artifact |
| Zoneless/signal misuse | UI silently not updating | Follow v22 signal patterns; no manual `ChangeDetectorRef`; write to signals, never patch globals |
| Scope creep (blog, CMS, form) | Never ships | PRD §4 non-goals and §12 deferrals are explicit |
| Two live portfolios (`mdaizal.github.io` still up) | Diluted, inconsistent personal brand | Decided in PLAN Phase 9.4 |

## 18. Pi's deliverables checklist

1. Working Angular 22 project; `npm run build:prod` passes content validation and budgets.
2. Single page with all 7 sections plus a prerendered 404 route.
3. Tailwind design system with tokens; light + dark; responsive 320 px → 2560 px; anchors not hidden by the sticky header.
4. Content modules populated from `PRD.md` §8 (real data; no placeholders).
5. Unit tests green with ≥80% coverage on `content/` and `core/`.
6. Accessibility and SEO requirements from §7/§8 implemented and manually verified.
7. `scripts/deploy.sh` and `scripts/verify-deploy.sh` runnable from git-bash, with the guard from §13.1.
8. Exact AWS commands with expected output, per `PLAN.md` Phases 5–7 — **for the owner to run** (A9).
9. GitHub Actions workflow committed; push to `main` deploys with no stored AWS keys.
10. `docs/RUNBOOK.md` written; nothing left as `TODO`.

## 19. Definition of done (technical)

- [ ] `dist/portfolio/browser/` contains prerendered `index.html`, `404/index.html`, `index.csr.html`, `sitemap.xml`, `robots.txt`, hashed assets.
- [ ] `curl -s https://<d-id>.cloudfront.net/ | grep -q "Mohd Aizal"` → success (prerendered content, not an empty shell).
- [ ] `curl -sI https://<d-id>.cloudfront.net/<hashed>.js` → `cache-control: public, max-age=31536000, immutable`.
- [ ] `curl -sI https://<d-id>.cloudfront.net/` → `cache-control: public, max-age=0, must-revalidate` + HSTS present.
- [ ] `curl -sI https://<d-id>.cloudfront.net/does-not-exist` → `HTTP/2 404` and renders the 404 page.
- [ ] `aws s3api get-public-access-block --bucket {{BUCKET_NAME}}` → all four `true`.
- [ ] Navigation anchors from the sticky header land with the heading fully visible at 320 px and 1440 px.
- [ ] Lighthouse mobile on the live URL: Perf ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO 100.
- [ ] Push to `main` → deployed within 5 minutes with zero AWS keys in the repo.
- [ ] Rollback rehearsed once from a retained artifact.
