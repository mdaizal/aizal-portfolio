# Portfolio Site — Document Index

Aizal's personal portfolio: an Angular 22 **single-page** static site, prerendered at build time and deployed to a **private S3 bucket behind CloudFront**.
Audience for these docs: **Pi** (coding agent) and Aizal (who runs all AWS commands).

| Document | Purpose | Read it for |
|---|---|---|
| [`PLAN.md`](PLAN.md) | Step-by-step execution plan, Phases 0–9 | What to do, in what order, and how each step is proven done. Phase 5–7 give you the exact AWS CLI commands **and the output you should see**. |
| [`PRD.md`](PRD.md) | Product requirements, single-page structure | What the site must say, to whom, and how it is judged. Real content lives in §8; binding honesty rules in §2. |
| [`TRD.md`](TRD.md) | Technical requirements | Stack, config, AWS resources, CI/CD, security, definition of done. |
| `_archive/` | v1 docs (multi-page plan) | History only — **superseded, do not implement from these.** |

## Status

- [x] PLAN / PRD / TRD written
- [x] v2 rewrite — single-page structure, real content, owner-runs-AWS workflow
- [x] Node.js upgraded to **26.13.1** (Active LTS) and npm to **12.2.2**
- [x] AWS CLI v2 present and authenticated (account `323661593352`)
- [ ] Angular CLI 22 installed (`npm i -g @angular/cli@22`)
- [ ] Résumé PDF supplied — or decide the button links to LinkedIn instead
- [ ] `{{SAA_TARGET}}` filled in (PRD §6.2)
- [ ] Earlier roles supplied, if the timeline should show more than one entry
- [ ] Decision on retiring `mdaizal.github.io` (PLAN Phase 9.4)
- [ ] Implementation started

## Decisions in force (PLAN §0)

| # | Decision |
|---|----------|
| D1 | Private S3 + CloudFront + OAC, on the **CloudFront default HTTPS domain** — $0 on the free tier. Fallback only if CloudFront is unavailable: plain S3 website hosting. |
| D2 | Prerendered static output (`outputMode: "static"`) — real HTML, no runtime server |
| D3 | **Single scrolling page** with anchor sections, plus a prerendered 404 |
| D4 | Tailwind CSS v4 + custom design tokens, no component library |
| D5 | **You run every AWS command; the agent guides** with exact commands and expected output |
| D6 | Manual `npm run deploy` first, then GitHub Actions with OIDC — no stored AWS keys |
| D7 | Custom domain deferred to v2 |

## Before Pi starts coding

1. Resolve the open items in `PRD.md` §11 — everything else is already filled with real data.
2. Note the workflow split (PLAN §0, D5): the agent writes code, scripts and commands; **you** execute the AWS steps.
3. Read `TRD.md` §18 (deliverables) and §19 (definition of done) — that is the acceptance contract.
4. Start at `PLAN.md` Phase 0.5, then Phase 1. Stop after Phase 1.3 and confirm the 404 prerender behaviour empirically before building further.

## Environment verified on this machine (2026-11-13)

| Tool | Version | Status |
|---|---|---|
| Node.js | **v26.13.1** ("Lithium", Active LTS) | ✅ installed via winget, replacing v24.18.0 |
| npm | **12.2.2** | ✅ engines allow `>=26.0.0` |
| AWS CLI | 2.40.1 | ✅ |
| Angular CLI | not installed | ⬜ `npm i -g @angular/cli@22` |
| AWS identity | assumed role, account `323661593352` | ✅ authenticated |

Notes for this host:
- `terminal` runs through **git-bash**, and MSYS path conversion is **disabled** — paths like `/` and `dist/...` pass through to native programs literally. Good for `aws` commands.
- `npm i -g …` installs into `~/AppData/Roaming/npm`, which is already on `PATH`.

## Remaining placeholders

Only deployment parameters and one content decision remain — no personal data is missing:

| Placeholder | Where | Filled when |
|---|---|---|
| `{{BUCKET_NAME}}`, `{{REGION}}` | PLAN Phase 5, TRD §11 | You choose them (suggestions given) |
| `{{DISTRIBUTION_ID}}`, `{{ACCOUNT_ID}}` | TRD §13 | Exists after the CloudFront distribution is created |
| `{{GITHUB_OWNER}}`, `{{GITHUB_REPO}}` | TRD §13.3 | Exists after the GitHub repo is created |
| `{{SAA_TARGET}}` | PRD §6.2 | Your target exam window (defaults to "targeting 2026") |
