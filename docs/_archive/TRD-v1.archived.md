# TRD.md — Technical Requirements Document

| Field | Value |
|---|---|
| Project | Angular portfolio site on AWS S3 + CloudFront |
| Doc version | 1.0 |
| Status | Implementation spec — authoritative for Pi |
| Related | `PLAN.md`, `PRD.md` |
| Verified against | Angular v22 (22.2.6), Node 26 LTS, AWS CLI 2.40.1, Nov 2026 |

---

## 1. Architecture

```
                 ┌──────────────────────────────────────────┐
  git push main  │        GitHub Actions (OIDC, no keys)     │
  ──────────────▶│  npm ci → npm run build → aws s3 sync →   │
                 │  create-invalidation                       │
                 └───────────────┬──────────────────────────┘
                                 │ AssumeRoleWithWebIdentity
                                 ▼
   ┌──────────────────┐   ┌────────────────────┐   ┌─────────────────────┐
   │  Route 53        │   │   CloudFront       │   │  S3 bucket (private)│
   │  {{DOMAIN}}  ────┼──▶│  + ACM cert (TLS)  │──▶│  OAC (SigV4 signed) │
   │  A/AAAA alias    │   │  + headers policy  │   │  Block Public: ON   │
   └──────────────────┘   │  + cache policies  │   │  Versioning: ON     │
                          │  + 403/404 → /404  │   └─────────────────────┘
                          └────────────────────┘
                                   ▲
                          dist/portfolio/browser/  ← prerendered static HTML
```

**Key architecture decisions**

| # | Decision | Rationale |
|---|----------|-----------|
| A1 | CloudFront + **OAC** over an S3 **REST** endpoint (not the S3 *website* endpoint) | Website endpoints cannot do HTTPS or OAC. OAC keeps the bucket fully private and gives real TLS + CDN. |
| A2 | **SSG / prerender** with `outputMode: "static"` | Real HTML per route defeats the "SPA is bad for SEO" objection and improves LCP. No Node server to run. |
| A3 | Angular **zoneless** + signals + `OnPush` (v22 defaults) | Smaller bundle (no zone.js), predictable change detection. |
| A4 | Content in **typed TS modules**, not JSON fetched at runtime | Type safety, build-time validation, zero network cost, prerender-safe. |
| A5 | Repo holds **no AWS credentials**; CI uses GitHub **OIDC** | No long-lived keys to leak or rotate. |
| A6 | IAM deploy role is **least privilege** and scoped to one bucket + one distribution | Limits blast radius if CI is compromised. |

## 2. Tech stack (pin exactly)

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| Framework | Angular | **22.x** (`^22.2.0`) | Active until 2027-06 |
| Language | TypeScript | 5.x (as shipped with Angular 22) | `strict: true` |
| Runtime (build only) | Node.js | **26.x LTS** ("Lithium") | `.nvmrc` → `26`. Node ≥24 also works; local dev machine currently has v24.18.0. |
| Package manager | npm | 11.x | Lockfile committed |
| Styling | Tailwind CSS | **v4.x** | PostCSS plugin; no `tailwind.config.js` needed in v4 unless extending |
| Unit tests | **Vitest** | as shipped | Angular 22's default runner (Karma/Jasmine is legacy; experimental Jest/WTR builders were removed) |
| E2E (optional, Phase 8+) | Playwright | latest | Not required for v1 |
| Hosting | Amazon S3 | — | Private bucket, versioning on |
| CDN/TLS | Amazon CloudFront + ACM | — | ACM cert **must be in `us-east-1`** |
| DNS | Amazon Route 53 | — | Apex + `www` alias records |
| Automation | GitHub Actions | — | OIDC → IAM role |
| IaC (deferred) | AWS CDK / Terraform | — | Phase 12/v2 |

## 3. Repository layout

```
portfolio-site/
├─ .github/workflows/deploy.yml
├─ docs/
│  ├─ PLAN.md  PRD.md  TRD.md  RUNBOOK.md
├─ scripts/
│  ├─ deploy.sh              # local deploy escape hatch (bash)
│  └─ verify-deploy.sh       # post-deploy verification (Phase 8.1)
├─ src/
│  ├─ app/
│  │  ├─ app.ts / app.html / app.scss
│  │  ├─ app.config.ts         # provideRouter, withInMemoryScrolling, provideZonelessChangeDetection
│  │  ├─ app.routes.ts         # lazy loadComponent per route
│  │  ├─ app.routes.server.ts  # RenderMode.Prerender for all static routes
│  │  ├─ core/
│  │  │  ├─ seo.service.ts     # title/description/canonical/OG per route
│  │  │  └─ obfuscate.ts       # email assembly helper
│  │  ├─ content/
│  │  │  ├─ profile.ts  experience.ts  skills.ts  projects.ts  certs.ts
│  │  │  └─ models.ts          # exported interfaces
│  │  ├─ layout/
│  │  │  ├─ header/  footer/  skip-link/
│  │  ├─ shared/
│  │  │  ├─ section-heading/  tag-chip/  project-card/  timeline-entry/  button-link/
│  │  └─ pages/
│  │     ├─ home/  about/  projects/  contact/  not-found/
│  ├─ assets/  {{RESUME_FILE}} , og-image.png, icons/
│  ├─ styles.scss              # @import "tailwindcss"; design tokens; base layer
│  └─ index.html               # <head> defaults, meta fallbacks
├─ angular.json   package.json   .nvmrc   .postcssrc.json
└─ README.md
```

## 4. Angular application architecture

### 4.1 Bootstrap
Angular 22 is zoneless by default; **do not add `zone.js`**. Use standalone components only — there are no `NgModule`s in this project.

```ts
// app.config.ts (specification, not final code)
provideZonelessChangeDetection()          // v22 default, be explicit
provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
              withComponentInputBinding())
provideClientHydration()                  // only if hydration is enabled with prerender
```

`app.routes.server.ts` — every route prerendered; no `RenderMode.Server` (rejected when `outputMode: "static"`):

```ts
export const serverRoutes: ServerRoute[] = [
  { path: '',         renderMode: RenderMode.Prerender },
  { path: 'about',    renderMode: RenderMode.Prerender },
  { path: 'projects', renderMode: RenderMode.Prerender },
  { path: 'contact',  renderMode: RenderMode.Prerender },
  { path: '**',       renderMode: RenderMode.Prerender },  // renders the 404 route
];
```

### 4.2 Component rules
- Every component: `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`, `templateUrl` + `styleUrl`, `ChangeDetectionStrategy` left at the v22 default (`OnPush`) unless a signal-driven reason exists to differ.
- State is **signals**: `signal()`, `computed()`, `input()`, `output()`. No manual subscriptions in v1 (no HTTP at all).
- **No `subscribe()` anywhere.** If a subscription ever appears, it must be in a `takeUntilDestroyed()` chain.
- Strict typing: no `any`, no non-null assertions (`!`) in templates; `strictTemplates` on.
- Template control flow uses `@if` / `@for` (with `track`) / `@switch` — never `*ngIf` / `*ngFor`.
- One component per folder; component class named without the `Component` suffix only if that is the CLI v22 default for that project — otherwise keep `XxxComponent` consistently. **Pick one convention and apply it everywhere.**
- Max ~200 lines per component file; extract primitives instead of growing a page component.

### 4.3 Routing & performance
- Lazy-load every non-home route: `loadComponent: () => import('./pages/about/about').then(m => m.About)`.
- `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` so client-side navigation resets scroll.
- On route change, move focus to the `<h1>`/main landmark and announce the page name via a live region (accessibility for SPA navigation).
- Preload strategy: `PreloadAllModules` is acceptable (small site) — measure against the budget before enabling.

### 4.4 HTML shell
- `<html lang="en">`; `<base href="/">`.
- Inline critical meta (title, description, theme-color) in `index.html` as a fallback for the prerendered pages.
- Do **not** disable `index.html` generation — a plain CSR entry (`index.csr.html`) is emitted alongside prerendered routes and is the correct fallback for a not-yet-prerendered path.

## 5. Content layer (typed, build-safe)

```ts
// content/models.ts
export interface Profile {
  fullName: string; role: string; subtitle: string; pitch: string;
  location: string; workMode: string; email: string;
  github: string; linkedin?: string; other?: string;
  resumeUrl: string; headshot?: string;
  currently: CurrentlyItem[]; openTo: string;
}
export interface ExperienceEntry {
  role: string; org: string; period: string; context?: string;
  achievements: string[]; tags: string[];
}
export interface SkillGroup { category: 'Languages'|'.NET & Web'|'Cloud & Infra'|'Data'|'Tooling';
  items: { name: string; level: 'working'|'proficient'|'strong'|'learning' }[]; }
export interface Project {
  slug: string; title: string; period: string; summary: string;
  bullets: string[]; tags: string[]; featured?: boolean;
  repoUrl?: string; liveUrl?: string; writeUpUrl?: string; domain: 'dotnet'|'aws'|'go';
}
export interface Cert { name: string; issuer: string; status: 'earned'|'in-progress'|'planned'; date?: string; url?: string; }
```

Rules:
- `experience.ts` and `projects.ts` are `as const satisfies readonly Project[]` (or typed arrays) — the compiler rejects missing required fields.
- A `validate-content.ts` build helper asserts at build time: `projects.length >= 4`, `projects.filter(p => p.domain === 'aws').length >= 2`, `projects.some(p => p.domain === 'go')`, and that no string field contains `{{` or `TODO`. **Fail the build on violation.**
- Degrees/level labels are ordinal words, never percentages (see PRD §6.2 FR-2.3).

## 6. Styling & design system

### 6.1 Tokens
Define in `styles.scss` under `@theme` (Tailwind v4) or as plain CSS custom properties, and **use only tokens in components** (no raw hex in component styles):

```
--color-bg, --color-surface, --color-border
--color-fg, --color-muted, --color-accent, --color-accent-fg
--font-sans, --font-mono
--text-xs … --text-3xl
--space-1 … --space-16
--radius-sm|md|lg|full
--shadow-sm|md
```

- Dark and light themes via `prefers-color-scheme` plus a manual override attribute (`[data-theme="dark"]`) on `<html>`; persist the override in `localStorage` behind a try/catch.
- Contrast: every foreground/background token pair must be ≥ 4.5:1 (≥ 3:1 for large text and UI borders). Verify with a checker before building pages.

### 6.2 Breakpoints & layout
| Name | Min width | Use |
|------|-----------|-----|
| `sm` | 640 px | 2-column grids begin |
| `md` | 768 px | Nav collapses to full horizontal bar; 2-col project grid |
| `lg` | 1024 px | 3-col project grid; max content width 72 rem, centred |
| `xl` | 1280 px | Wider hero typography only |

Mobile-first. Content column max width **72 rem** with `clamp()` page padding. No horizontal scroll at 320 px.

### 6.3 Motion
- Transitions ≤ 200 ms, `ease-out`; only `transform`/`opacity` animated.
- All motion wrapped in `@media (prefers-reduced-motion: reduce) { animation: none; transition: none; }`.

## 7. SEO, metadata, discoverability

| Item | Requirement |
|------|-------------|
| Title | Per route, `{{FULL_NAME}} — <page>` pattern, ≤ 60 chars |
| Description | Per route, 120–160 chars, unique |
| Canonical | Absolute `https://{{DOMAIN}}<path>`, self-referencing |
| OG/Twitter | `og:title`, `og:description`, `og:image` (`og-image.png`, 1200×630), `og:url`, `og:type=website`, `twitter:card=summary_large_image` |
| JSON-LD | `Person` with `name`, `jobTitle`, `url`, `sameAs[]`, `knowsAbout[]` — injected once in `index.html` |
| `robots.txt` | Allow all; `Sitemap: https://{{DOMAIN}}/sitemap.xml` |
| `sitemap.xml` | Generated at build time from the same route table as `app.routes.server.ts` (single source of truth); absolute URLs; `lastmod` |
| `/404` | `<meta name="robots" content="noindex">` |
| Favicon | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` (180×180), `site.webmanifest` |
| Headings | Exactly one `<h1>` per page; no skipped levels |

`SeoService.set({title, description, canonical})` is called from a route-level resolver or `ngOnInit` of each page; defaults live in `index.html`. Because pages are prerendered, meta must render **server-side during prerender** — use Angular's `Title`/`Meta` services (they run during prerender), not direct `document` mutation.

## 8. Accessibility (WCAG 2.2 AA)

- Landmarks: `<header>`, `<nav aria-label="Main">`, `<main id="main">`, `<footer>`.
- Skip link as first focusable element, visible on focus, targets `#main`.
- Visible focus ring on every interactive element (`:focus-visible`, ≥ 2 px, ≥ 3:1 contrast).
- Mobile menu: `aria-expanded`, `aria-controls`, Escape closes, focus returns to the toggle, focus trapped while open.
- External links: `rel="noopener noreferrer"` and an accessible "opens in new tab" indication.
- Résumé link announces the file type/size ("PDF, 120 KB").
- Icons are `aria-hidden="true"` unless they are the only label.
- Images: meaningful `alt` or `alt=""` for decorative; never `alt` = filename.
- Verified with axe DevTools + keyboard-only pass + Lighthouse a11y ≥ 95.

## 9. Build configuration & budgets

`angular.json` (essential options):

```jsonc
"build": {
  "options": {
    "outputPath": { "base": "dist/portfolio", "browser": "browser" },
    "outputMode": "static",           // prerender, no server bundle
    "index": "src/index.html",
    "browser": "src/main.ts",
    "styles": ["src/styles.scss"],
    "assets": ["src/assets", { "glob": "**/*", "input": "public" }],
    "optimization": true, "sourceMap": false
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

- Budgets are **hard gates** in CI: a failing budget fails the workflow.
- Build output that gets deployed: **`dist/portfolio/browser/`** — never `dist/portfolio/`.
- Confirm post-build the expected artifacts: `browser/index.html` (prerendered home), `browser/about/index.html`, `browser/projects/index.html`, `browser/contact/index.html`, `browser/404/index.html`, `browser/index.csr.html`, hashed `*.js`/`*.css`, `browser/sitemap.xml`, `browser/robots.txt`.

## 10. Testing strategy

| Level | Tool | Scope | Gate |
|-------|------|-------|------|
| Unit | Vitest (`ng test`) | Content modules validate; content validator rejects bad data; `SeoService` sets meta; obfuscation helper; each shared primitive renders | Must pass; ≥80% lines on `src/app/content` and `core` |
| A11y | axe (manual or `@axe-core/playwright` in Phase 8+) | Each prerendered route, 0 critical/serious violations | Phase 4 gate |
| E2E (optional v1.x) | Playwright | Nav between all routes, 404 path, résumé download, mobile menu | Phase 8+ |
| Content | Custom build validator (§5) | No placeholders, minimum project counts | **Build fails** on violation |
| Perf | Lighthouse CI or manual | NFR-1/NFR-2 budgets | Phase 4 + 8 gates |

Test file naming: `*.spec.ts` co-located. Vitest runs in Node with `jsdom`/`happy-dom` by default — no browser required.

## 11. AWS — S3

Bucket: `{{BUCKET_NAME}}` (suggested `{{DOMAIN}}-site`), region `{{REGION}}` (default `us-east-1`).

| Setting | Value | Why |
|---------|-------|-----|
| Block Public Access | **all four ON** | CloudFront reads via OAC; nothing is public |
| Static website hosting | **DISABLED** | Conflicts with OAC and forces HTTP-only |
| Versioning | Enabled | Recover from a bad sync |
| Default encryption | SSE-S3 (AES256) | Free, automatic |
| Lifecycle | noncurrent versions → expire after 30 days | Contains version sprawl |
| Public access via ACLs | disabled (`BucketOwnerEnforced`) | Modern default |

```bash
aws s3api create-bucket --bucket {{BUCKET_NAME}} --region {{REGION}}
aws s3api put-public-access-block --bucket {{BUCKET_NAME}} --public-access-block-configuration \
  'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'
aws s3api put-bucket-versioning --bucket {{BUCKET_NAME}} \
  --versioning-configuration Status=Enabled
```
(For any region other than `us-east-1`, add `--create-bucket-configuration LocationConstraint={{REGION}}`.)

## 12. AWS — CloudFront, TLS, DNS, headers

| Setting | Value |
|---------|-------|
| Origin | S3 REST endpoint via **Origin Access Control** (SigV4, sign requests) |
| Viewer protocol | Redirect HTTP → HTTPS |
| Allowed methods | `GET, HEAD` |
| Cache policy (HTML) | Caching optimized; min TTL 0, default 0, max 0 → effectively revalidate |
| Cache policy (assets) | min/default/max 31536000 |
| Compression | Enabled (CloudFront auto-compresses gzip/brotli) |
| HTTP versions | HTTP/2 + HTTP/3 |
| Price class | `PriceClass_100` (NA + EU) — widen to `200` if the audience is global |
| Default root object | `index.html` |
| WAF | Not in v1 (cost); revisit if abuse appears |
| Logging | Standard logs to a separate S3 prefix, or CloudFront real-time metrics only |

**Cache-Control set at upload time** (metadata, since CloudFront honours origin headers):

| Paths | `Cache-Control` |
|-------|-----------------|
| `*.js`, `*.css`, `*.woff2`, hashed assets under `media/` | `public, max-age=31536000, immutable` |
| `*.html`, `index.html`, `index.csr.html`, `/about/`, etc. | `public, max-age=0, must-revalidate` |
| `*.png`, `*.jpg`, `*.svg`, `*.webp`, `*.avif`, `*.pdf` | `public, max-age=604800` |
| `robots.txt`, `sitemap.xml` | `public, max-age=3600` |

**Custom error responses** (this is what makes deep links and bad URLs behave):

| HTTP code | Response page | Response code |
|-----------|---------------|---------------|
| 403 | `/404/index.html` | 404 |
| 404 | `/404/index.html` | 404 |

Rationale: the bucket is private, so a missing object surfaces to CloudFront as `403`; both codes must therefore be mapped. All valid routes are prerendered, so falling back to the CSR shell would be wrong — a genuine 404 page with a real 404 status is correct.

**Response headers policy:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=(), camera=()`, and a CSP:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self'; connect-src 'self';
base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'
```

`style-src 'unsafe-inline'` is required if component styles are injected at runtime; if a fully nonce-based CSP is achievable, tighten it — record the decision in `RUNBOOK.md`.

**ACM:** certificate for `{{DOMAIN}}` and `www.{{DOMAIN}}` in **`us-east-1`** (hard requirement for CloudFront), DNS validation via Route 53.

**Route 53:** `A` + `AAAA` alias → CloudFront for the apex; `www` either an alias to the same distribution (CloudFront handles both domains via alternate domain names) or a redirect. Canonical = apex (PRD Q2).

## 13. Deployment & CI/CD

### 13.1 npm scripts

```jsonc
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test --watch=false",
    "lint": "ng lint",
    "deploy:sync": "aws s3 sync dist/portfolio/browser/ s3://{{BUCKET_NAME}}/ --delete --exclude \"*.html\" --cache-control \"public,max-age=31536000,immutable\"",
    "deploy:html": "aws s3 sync dist/portfolio/browser/ s3://{{BUCKET_NAME}}/ --exclude \"*\" --include \"*.html\" --cache-control \"public,max-age=0,must-revalidate\"",
    "deploy:invalidate": "aws cloudfront create-invalidation --distribution-id {{DISTRIBUTION_ID}} --paths \"/\" \"/index.html\" \"/index.csr.html\" \"/about/*\" \"/projects/*\" \"/contact/*\" \"/404/*\" \"/sitemap.xml\" \"/robots.txt\"",
    "deploy": "npm run build:prod && npm run deploy:sync && npm run deploy:html && npm run deploy:invalidate",
    "verify:deploy": "bash scripts/verify-deploy.sh"
  }
}
```

Note: `--delete` on the first sync removes stale hashed bundles; HTML is deliberately excluded from that pass so its cache headers stay short-lived, then synced in a second pass. **Order matters:** assets first, HTML second, invalidate last — this avoids a window where HTML references a bundle that has not uploaded yet.

### 13.2 Deploy IAM policy (attach to both the local user/role and the CI role)

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

No `s3:*`, no bucket deletion, no IAM permissions.

### 13.3 GitHub Actions with OIDC

One-time setup:
1. Create the OIDC provider for `token.actions.githubusercontent.com` (audience `sts.amazonaws.com`).
2. Create role `github-actions-portfolio-deploy` with the trust policy below, attach the §13.2 policy.
3. Store `AWS_DEPLOY_ROLE_ARN`, `BUCKET_NAME`, `DISTRIBUTION_ID` as **repository variables** (not secrets — they are not sensitive).

```jsonc
// trust policy — scope to the repo AND the main branch
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
      - uses: actions/checkout@v5          # pin to latest major at implementation time
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test                      # ng test --watch=false
      - run: npm run build:prod            # fails on budget or content-validator violation
      - uses: aws-actions/configure-aws-credentials@v5   # latest major; OIDC, no static keys
        with:
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}
      - run: aws s3 sync dist/portfolio/browser/ s3://${{ vars.BUCKET_NAME }}/ --delete --exclude "*.html" --cache-control "public,max-age=31536000,immutable"
      - run: aws s3 sync dist/portfolio/browser/ s3://${{ vars.BUCKET_NAME }}/ --exclude "*" --include "*.html" --cache-control "public,max-age=0,must-revalidate"
      - run: aws cloudfront create-invalidation --distribution-id ${{ vars.DISTRIBUTION_ID }} --paths "/" "/index.html" "/index.csr.html" "/sitemap.xml" "/robots.txt"
      - uses: actions/upload-artifact@v4   # enables rollback (PLAN 8.5)
        with:
          name: dist-${{ github.sha }}
          path: dist/portfolio/browser/
          retention-days: 30
```

`index.html` is invalidated explicitly; hashed assets are immutable so they never need invalidating.

## 14. Security

- S3 bucket fully private; CloudFront is the only reader (OAC, not a public bucket policy).
- No AWS access keys in the repo, in Actions, or in the built site. `.env*` gitignored.
- HTTPS enforced via `viewer_protocol_policy = redirect-to-https` + HSTS.
- CSP as in §12; `frame-ancestors 'none'` prevents clickjacking.
- Email address assembled in TS (§4) to reduce naive scrapers — it is not a security control, only friction.
- `{{RESUME_FILE}}` is public by design (PRD Q3) — remove if the owner changes that decision.
- Dependencies: `npm audit` in CI (non-blocking warn for v1, blocking for `critical`).
- CloudFront/S3 access logging enabled if the owner wants request-level evidence.
- Any accidental secret commit → rotate immediately, do not rely on history rewriting.

## 15. Observability, cost, operations

| Concern | Approach |
|---------|----------|
| Uptime | CloudWatch synthetic canary or an external 1-minute monitor on `/` and one deep route |
| Errors | CloudFront 4xx/5xx rate metric → CloudWatch alarm (Phase 8.3) |
| Cost | Route 53 zone $0.50/mo + domain ~$12/yr + S3 storage pennies + CloudFront free-tier (1 TB egress) + ACM free → **≈ $1.50/mo** steady state |
| Budget guard | AWS Budget at $5/mo with email alert; CloudFront/S3 usage alarm at 50 GB egress |
| CAC | ACM auto-renews while DNS validation records remain in Route 53 — do not delete them |
| Access | Root account has MFA; deploy uses a scoped role, not root |
| Rollback | Re-sync a previous `dist-<sha>` artifact (or `aws s3 sync` from a git tag), then invalidate HTML paths |

## 16. Local development

```bash
nvm use                 # → Node 26 from .nvmrc (Node 24+ works)
npm ci
npm start               # ng serve → http://localhost:4200
npm test                # Vitest, single run
npm run build:prod      # must pass budgets + content validator
npx serve dist/portfolio/browser   # preview the real static output BEFORE deploying
```

Always preview with a static server (not `ng serve`) before the first deploy — `ng serve` does not exercise prerendered routes or extensionless URLs the way CloudFront will.

## 17. Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Deploying `dist/portfolio` instead of `dist/portfolio/browser` | Directory listing / broken site | Assert the sync source path exists and contains `index.html` in the deploy script; verification step 8.1 catches it |
| Assuming an SPA fallback for deep links | 404s on refresh | All routes prerendered; 403/404 mapped to the real 404 page; verify with `curl -I` |
| Wrong ACM region | Cert cannot attach to CloudFront | Always request in `us-east-1` |
| Budget regression | NFR-1 missed | CI-enforced `budgets` + Lighthouse gate |
| Placeholder text ships | Embarrassing, unprofessional | Content validator fails the build on `{{` or `TODO` |
| Cache poisoning of HTML | Stale site for hours | HTML `max-age=0` + explicit invalidation |
| `--delete` removing a needed file | Broken asset | Assets uploaded before HTML; artifact of every successful build is retained |
| Zoneless/signal misuse | UI not updating | Follow v22 signal patterns; no manual `ChangeDetectorRef`; if the UI must update outside signals, use `afterNextRender`/signal writes, never monkey-patching |
| Scope creep (blog, form, CMS) | Never ships | §12 deferrals are explicit non-goals for v1 |

## 18. Pi's deliverables checklist

1. Working Angular 22 project, `npm run build:prod` passing with budgets and content validation.
2. All five routes implemented and prerendering to real HTML files.
3. Tailwind design system with tokens; light + dark; responsive 320 px → 2560 px.
4. Content modules populated from `PRD.md` (placeholders replaced or dev-only).
5. Unit tests green, ≥80% coverage on `content/` and `core/`.
6. Accessibility and SEO requirements from §7/§8 implemented and manually verified.
7. `scripts/deploy.sh` and `scripts/verify-deploy.sh` executable from git-bash.
8. AWS resources created per §11/§12 (or an exact, copy-pasteable runbook if Pi lacks AWS permission).
9. GitHub Actions workflow committed; a push to `main` deploys without stored AWS keys.
10. `docs/RUNBOOK.md` written, and nothing left as `TODO`.

## 19. Definition of done (technical)

- [ ] Production build emits `dist/portfolio/browser/` with prerendered HTML for all five routes + `index.csr.html` + `sitemap.xml` + `robots.txt`.
- [ ] `curl -s https://{{DOMAIN}}/about | grep -q "{{FULL_NAME}}"` succeeds (proves prerender, not an empty shell).
- [ ] `curl -sI https://{{DOMAIN}}/main.HASH.js` → `cache-control: public, max-age=31536000, immutable`.
- [ ] `curl -sI https://{{DOMAIN}}/` → `cache-control: public, max-age=0, must-revalidate`, HSTS present.
- [ ] `curl -sI https://{{DOMAIN}}/nope` → `HTTP/2 404` and renders the 404 page.
- [ ] `aws s3api get-public-access-block` → all four `true`.
- [ ] Lighthouse mobile, production URL: Perf ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO 100.
- [ ] Push to `main` → site updated within 5 minutes, zero AWS keys in the repo.
- [ ] Rollback rehearsed once from a retained artifact.
