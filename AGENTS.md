# AGENTS.md — working in this repository

Handoff contract for any coding agent (Pi, Codex, Claude Code, or a human) asked to change
this repository. Read it before touching anything.

## What this is

Mohd Aizal Baharuddin's personal portfolio: an Angular 22 **single-page** site, prerendered to
static HTML at build time, deployed to a private S3 bucket behind CloudFront.

Working directory: the repository root. Node 26, npm 12, Angular CLI 22.

## Read these first, in this order

| File | Why |
|---|---|
| `docs/PLAN.md` | The phased execution plan. **Find the current phase and do only that phase.** |
| `docs/TRD.md` | Authoritative spec: architecture, pinned stack, design tokens, AWS resources, CI/CD, security, definition of done. |
| `docs/PRD.md` | Requirements with stable IDs (`FR-*`, `NFR-*`). **§2 is binding** — it lists claims that must never be made. |
| `docs/README.md` | Document index and current status. |

`docs/_archive/` holds superseded document versions. **Never implement from it.**

## Non-negotiables

**Angular**
- Zoneless + signals. No `zone.js`. Never `ChangeDetectorRef`, never monkey-patch globals.
- Standalone components only, no `NgModule`, `ChangeDetectionStrategy.OnPush` everywhere.
- `@if` / `@for` (always with `track`) / `@switch` — never `*ngIf` / `*ngFor`.
- Use `[attr.x]` for attributes that must be **absent** when falsy. Property binding coerces
  `null` to the string `"null"` — `[target]="cond ? '_blank' : null"` ships `target="null"`.
- Interactive handlers on a component `host` listener, not a template binding on a
  non-focusable element.
- Lint expects: `T[]` not `Array<T>`; no ternary as a statement; no unused imports.

**Styling**
- Components use theme tokens only — **no raw hex in component styles**.
- Tokens are declared once with `light-dark()` in `src/styles.css` and mapped into Tailwind via
  `@theme inline`. Do not add a second source of truth.
- An inline `<script>` cannot be used for theming: the deployed CSP sets `script-src 'self'`.
- Static assets live in **`public/`**, not `src/assets/` — the build config reads only `public/`.

**Content**
- All copy and data lives in typed modules under `src/app/content/`. No hardcoded content in
  components.
- Never touch the honesty guardrails in `docs/PRD.md` §2, and never invent experience,
  projects, skills or dates.
- Skill proficiency is expressed **only** as `learning` / `working` / `proficient` / `strong`.
  Never percentages, stars or bars.
- **No phone number may be rendered.** It exists only inside the downloadable résumé PDF.
- Go and AWS must stay labelled `learning` until there is a real artifact to point at.

## Before you say you are done

Run these, in this order, and report the raw output — not a summary of it:

```bash
npm run lint
npm run test:ci            # includes the content gate and the acceptance integration suite
node scripts/check-contrast.mjs
npm run build:prod         # runs test:ci, then builds; fails on a budget or content violation
```

`build:prod` fails deliberately on a bundle-budget breach or a content-gate violation.
**Do not bypass or weaken either** to make a build pass.

Then verify the **artifact**, not the build log:

- `dist/portfolio/browser/` contains `index.html`, `404/index.html`, `index.csr.html`,
  `assets/aizal-resume.pdf`, `robots.txt`, `sitemap.xml`
- there is **no** `dist/portfolio/server/` directory
- `grep -c '<h1' dist/portfolio/browser/index.html` returns exactly `1`

## Scope discipline

- Do not add a dependency without stating it explicitly in your report.
- Do not commit. Leave your changes in the working tree and report what changed and why.
- Do not deploy. All AWS steps are run by the repository owner; an agent may only produce the
  exact command plus the output it should produce.
- If a requirement looks wrong or conflicts with the spec, say so instead of guessing.
