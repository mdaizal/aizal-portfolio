# Portfolio Site — Document Index

Mohd Aizal Baharuddin's personal portfolio: an Angular 22 **single-page** static site, prerendered at build time and deployed to a **private S3 bucket behind CloudFront**.

- **Project root:** `E:\Go Projects\portfolio-site\`
- **Audience:** **Pi** (coding agent) and Aizal, who runs every AWS command himself.
- **Cost basis:** **$0/month** on the AWS free tier for v1 (CloudFront default domain — no Route 53, no ACM, no domain purchase).

| Document | Purpose | Read it for |
|---|---|---|
| [`PLAN.md`](PLAN.md) | Execution plan, Phases 0–9 | What to do, in what order, and how each step is proven done. Phases 5–7 give the exact AWS CLI commands **and the output you should see**. Phase 9.4 retires the old GitHub Pages site. |
| [`PRD.md`](PRD.md) | Product requirements, single-page structure | What the site must say, to whom, and how it is judged. Real content is in §8; binding honesty rules are in §2. |
| [`TRD.md`](TRD.md) | Technical requirements | Stack, config, AWS resources, CI/CD, security, definition of done. |
| `_archive/` | Superseded versions | History only — **do not implement from these.** `_archive/v2/` is the pre-résumé version; `_archive/*-v1.archived.md` is the original multi-page plan. |

## Status

**Phase 2 complete** — design system, typed content layer, primitives and app shell.

- [x] PLAN / PRD / TRD written; rewritten as **v3** from the résumé (Nov 2026)
- [x] Node.js **26.13.1** · npm **12.2.2** · Angular CLI **22.2.7** — installed and verified
- [x] AWS CLI 2.40.1 authenticated (account `323661593352`)
- [x] **Phase 1 — Angular 22 workspace scaffolded** at `E:\Go Projects\portfolio-site`
  - `--style=tailwind` (Tailwind v4 wired automatically) · `--ssr=true` · `--zoneless=true` · `--test-runner=vitest`
  - `outputMode: "static"` → prerendered HTML, **no** server bundle emitted
  - Routes: `''` and `404` prerendered, `**` client-rendered (safety net only)
  - **PLAN 1.4 recorded result → `TRD.md` §4.1** (verified: `browser/404/index.html` is the exact path CloudFront needs)
  - Pushed to `origin/main`
- [x] **Phase 2 — design system, content layer, primitives, app shell**
  - Tokens via CSS **`light-dark()`** + `@theme inline`; OS preference by default, `data-theme` override applied pre-boot in `main.ts` (an inline theme script would be blocked by the CSP)
  - **`scripts/check-contrast.mjs`: 24 WCAG AA pairs, 0 failures**
  - Content from the résumé: 6 experience entries, 7 projects, 6 skill groups
  - **Content gate as a Vitest suite**, wired into `build:prod` — verified by injection (placeholder → exit 1)
  - 6 primitives + layout shell (skip link, header, footer) with specs
  - Gates: **47 tests pass** · lint clean · build **280 kB raw / 79 kB gzip** · 2 routes prerendered
- [x] **Phase 3 — the seven page sections** (hero, currently, about, experience, skills, projects, contact + 404)
  - Built as components under `pages/home/sections/`, composed by `home.html`
  - Verified against the **prerendered build**: all 7 section ids, 1 `<h1>`, 6 timeline entries, 7 project cards, 6 skill groups
  - Browser-verified: **zero horizontal overflow** at 320–1024 px, `light-dark()` theming with no JavaScript, `scroll-margin-top: 72px` clearing the 56 px header, mobile nav swapping correctly
  - Gates: **60 tests** · lint clean · build 291 kB raw / 80 kB gzip
  - Fixed: Contact lead read as one run-on; duplicate `<main>` removed from the home template
- [ ] PRD §11 open questions — Q2 (Panasonic end date) **resolved**; Q1, Q3–Q7 remain on their defaults
- [ ] Retire `mdaizal.github.io` (PLAN Phase 9.4)
- [ ] Phase 4 — quality gates (SEO service, a11y pass, perf budget, Lighthouse)

## Decisions in force (PLAN §0)

| # | Decision |
|---|----------|
| D1 | Private S3 + CloudFront + OAC on the **CloudFront default HTTPS domain** — $0 on the free tier. Fallback only if CloudFront is unavailable: plain S3 website hosting. |
| D2 | Prerendered static output (`outputMode: "static"`) — real HTML, no runtime server |
| D3 | **Single scrolling page** with anchor sections, plus a prerendered 404 |
| D4 | Tailwind CSS v4 + custom design tokens, no component library |
| D5 | **You run every AWS command; the agent guides** with exact commands and expected output |
| D6 | Manual `npm run deploy` first, then GitHub Actions with OIDC — no stored AWS keys |
| D7 | Custom domain deferred to v2 |
| D8 | Content sourced from the résumé; no placeholders in personal content |
| D9 | Project lives at `E:\Go Projects\portfolio-site\`, ignored by the parent repo |

## Content summary (what the site claims, and on what evidence)

| Claim | Evidence |
|---|---|
| **5+ years of .NET development** | Trilevel (Dec 2006 – Jan 2008) + Panasonic (Jun 2022 – Oct 2026) ≈ 5.4 years. The 2006–2008 role is visible in the timeline, which reconciles this with LinkedIn's "4+ years". |
| **19 years of professional experience** | Timeline runs 2006 → 2026; 2008–2021 in IT operations, application support and programme management (Prime Minister's Department; Ministry of Youth & Sports). |
| **5 production enterprise systems shipped** | Inventory ticketing, real-time bidding (EF Core + SignalR), visitor management, weighbridge compliance, workflow-engine rollout. |
| **AWS — hands-on, learning** | This site's own S3 + CloudFront + OAC + least-privilege IAM + OIDC deployment, plus the public `cloud-lab` repo. SAA certification targeted **January 2027**. |
| **Go — learning** | Tutorial/self-study stage. First real artifact is the v2 Go Lambda contact form. **No Go proficiency claim anywhere.** |
| Available immediately | Résumé states availability from 1 November 2026 — **confirm, since LinkedIn still shows the Panasonic role as current.** |

## Before Pi starts coding

1. Resolve `PRD.md` §11, starting with **Q2** — the hero's availability line depends on the employment end date.
2. Read `TRD.md` §18 (deliverables) and §19 (definition of done) — that is the acceptance contract.
3. Begin at `PLAN.md` Phase 1.1. Note the scaffold workaround: the project folder already holds `docs/` and `src/`, and `ng new` refuses a non-empty directory.
4. **Stop after Phase 1.4** and record the prerendered 404 behaviour in `TRD.md` §4.1 before building any UI. That is the one unknown that could invalidate the deploy design.

## Environment verified on this machine (2026-11-13)

| Tool | Version | Status |
|---|---|---|
| Node.js | **v26.13.1** ("Lithium", Active LTS) | ✅ upgraded from v24.18.0 via winget |
| npm | **12.2.2** | ✅ engines allow `>=26.0.0` |
| Angular CLI | **22.2.7** | ✅ `ng version` confirms Node 26.13.1 / npm 12.2.2 |
| AWS CLI | 2.40.1 | ✅ |
| AWS identity | assumed role, account `323661593352` | ✅ authenticated |

Host notes:
- `terminal` runs through **git-bash** with MSYS path conversion **disabled** — `/` and `dist/...` pass through to native programs literally. Good for `aws` commands. Use `cd` (a builtin) rather than `git -C /e/...`.
- `npm i -g …` installs into `~/AppData/Roaming/npm`, already on `PATH`.
- `E:\Go Projects` is itself a git repo; `/portfolio-site/` is gitignored there so the nested repo is not double-tracked.

## Remaining placeholders

Only deployment parameters remain — no personal content is missing:

| Placeholder | Where | Resolved when |
|---|---|---|
| `{{BUCKET_NAME}}`, `{{REGION}}` | PLAN Phase 5, TRD §11 | You choose them (suggestions given) |
| `{{DISTRIBUTION_ID}}`, `{{ACCOUNT_ID}}` | TRD §13 | After the CloudFront distribution exists |
| `{{GITHUB_OWNER}}`, `{{GITHUB_REPO}}` | TRD §13.3 | After the GitHub repo exists |
