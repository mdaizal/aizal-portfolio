# PRD.md — Personal Portfolio Site

| Field | Value |
|---|---|
| Product | Personal portfolio + career-pivot landing site |
| Owner | {{FULL_NAME}} |
| Doc version | 1.0 |
| Status | Ready for implementation (Pi) |
| Related | `PLAN.md`, `TRD.md` |

---

## 1. Overview

A single-owner static marketing site that presents {{FULL_NAME}} as an experienced **software engineer / web application developer** with 5 years of professional .NET work, who is now actively pivoting into **AWS cloud engineering** and learning **Go**.

The site's job is not to be a blog or an app. Its job is to make one specific claim credible and easy to verify in under 60 seconds:

> *"Five years of shipping production software in C#/.NET — now building the same things on AWS, and writing Go while doing it."*

That claim is unusual and is the site's entire differentiator. It must be visible above the fold, not buried in an About paragraph.

## 2. Goals

| ID | Goal | Measure of success |
|----|------|--------------------|
| G1 | Make the .NET → AWS transition obvious within 5 seconds of landing | Hero states both roles; no scrolling required |
| G2 | Prove the cloud claim with evidence, not adjectives | ≥2 projects involving real AWS services are described with architecture + repo link |
| G3 | Show Go as an active, current skill, not an aspiration | ≥1 Go artifact (repo or service) linked, with a one-line description of what it does |
| G4 | Let a recruiter act immediately | Contact affordances reachable in ≤1 click from any page |
| G5 | Demonstrate the engineering the owner claims, through the site itself | Live Lighthouse Perf/A11y ≥ 95, SEO 100; accessible by keyboard |
| G6 | Be cheap and maintenance-free | < $2/month running cost after domain; zero servers to patch |

## 3. Non-goals

- No CMS. Content lives in typed TypeScript modules edited via git.
- No authentication, user accounts, comments, or database.
- No blog / articles section in v1 (see §12).
- No contact form backend in v1 — `mailto:` and social links only (see §12).
- No server-side rendering at request time. Static output only.
- Not a design showcase — restraint over novelty.

## 4. Audience

| Persona | What they want in 30 seconds | Design implication |
|---|---|---|
| **Technical recruiter** (non-specialist) | Role, years, location/work-mode, stack keywords, a way to contact | Scannable keyword chips, years stated numerically, contact in header |
| **Hiring manager / tech lead** (specialist) | Evidence the .NET depth is real and the AWS work is genuine, not tutorial-following | Real project entries with architecture notes, repo links, trade-offs mentioned |
| **Engineering peer** (referrals, community) | Interesting artifacts, Go code, how the site is built | "How this site is built" note + link to the repo |

Primary: hiring manager. Optimize for credibility with them; keep it scannable for the recruiter.

## 5. Positioning & content rules

**Title/label decision (D-PRD-1):** Primary label is **"Software Engineer"**, with the specialization stated as **".NET / C# · moving to AWS Cloud · Go"** in the hero subtitle. "Web Application Developer" may appear in the About narrative. Rationale: "Software Engineer" is broader and does not invite the "but that's just websites" discount, while the subtitle carries all the specificity.

**Voice rules:**
- First person, plain, specific. No "passionate", "results-driven", "guru", "10x".
- Every claim needs a number, a name, or a link. "5 years" not "several years".
- Never apologise for the pivot or frame .NET as the past — frame AWS as *the same engineering applied to new constraints*.
- No "learning" without a concrete artifact next to it. "Learning Go" only ships alongside a Go repo link.

**The pivot framing (canonical wording to derive from):**
> I spent five years building and maintaining business applications in C# and .NET — ASP.NET APIs, Entity Framework data layers, SQL Server, production deployments. I'm now moving that same engineering into AWS: designing with IAM and VPC as the default, choosing between Lambda and containers on purpose, and learning Go for the services where concurrency and a small footprint matter.

## 6. Information architecture

Prerendered static routes (each must produce real HTML at build time):

| Route | Page | Priority |
|-------|------|----------|
| `/` | Home | P0 |
| `/about` | About / experience | P0 |
| `/projects` | Projects & cloud work | P0 |
| `/contact` | Contact | P0 |
| `/404` | Not found | P1 |

Header nav is present on every page with `Home / About / Projects / Contact` + a persistent **Résumé** download link and a GitHub icon link.

### 6.1 Home (`/`)

| Req ID | Requirement |
|--------|-------------|
| FR-1.1 | Hero: `{{FULL_NAME}}` as `<h1>`, role line "Software Engineer", subtitle ".NET / C# · moving to AWS Cloud · Go" |
| FR-1.2 | One-sentence pitch, max 25 words, drawn from §5 canonical wording |
| FR-1.3 | Two CTAs: **View projects** (primary → `/projects`) and **Download résumé** (secondary → `{{RESUME_PATH}}` PDF) |
| FR-1.4 | Location + work-mode line: `{{LOCATION}}` · `{{WORK_MODE}}` |
| FR-1.5 | "Currently" strip: 3 short status items (e.g. AWS cert target, Go project, open-to) |
| FR-1.6 | Skills strip: max 10 chips grouped as `.NET`, `Cloud`, `Language` |
| FR-1.7 | Featured projects: exactly 3 cards pulled from `projects.ts` (`featured: true`) with title, one-line result, tags, repo/live links |
| FR-1.8 | Closing CTA band: contact link + email |
| FR-1.9 | No hero image required; if `{{HEADSHOT}}` is blank, render a monogram/initials block |

### 6.2 About (`/about`)

| Req ID | Requirement |
|--------|-------------|
| FR-2.1 | Narrative, 150–250 words, covering the .NET period and the pivot |
| FR-2.2 | Timeline: 1 entry per role/period, newest first — `{{ROLE}}`, `{{COMPANY_OR_CONTEXT}}`, `{{PERIOD}}`, 2–4 achievement bullets each with a number |
| FR-2.3 | Skills by category: Languages, .NET & Web, Cloud & Infra, Data, Tooling — with an honest proficiency label per group (no fake percentages) |
| FR-2.4 | Certifications section: `{{CERT_1..n}}` with status (`earned` / `in progress` / `planned`) |
| FR-2.5 | "How this site is built" note: one paragraph naming Angular 22, S3, CloudFront, and linking the public repo — reinforces technical credibility |
| FR-2.6 | Résumé download repeated here |

### 6.3 Projects (`/projects`)

| Req ID | Requirement |
|--------|-------------|
| FR-3.1 | Card grid, minimum **4** entries, at least **2** with substantive AWS content and at least **1** with Go |
| FR-3.2 | Each card: title, period, one-line summary, 2–5 bullets (problem → what was built → outcome/measure), tech tags, links (repo / live / write-up) |
| FR-3.3 | .NET-era entries must be sanitised: no client names, no proprietary detail, no internal URLs. Use "a large retail platform" style anonymisation |
| FR-3.4 | Cards are content-driven only — no hardcoded project markup in components |
| FR-3.5 | Filter/tag control is optional; if implemented it must work without JS-only affordances degrading the page (progressive enhancement not required, but no filter may hide all content on load) |
| FR-3.6 | Empty-state: if a project has no live URL, omit the button rather than showing a dead link |

### 6.4 Contact (`/contact`)

| Req ID | Requirement |
|--------|-------------|
| FR-4.1 | Email as an obfuscated `mailto:` (`{{EMAIL}}`) — assembled in TS, not a raw string in HTML |
| FR-4.2 | Links: `{{GITHUB_URL}}`, `{{LINKEDIN_URL}}`, `{{OTHER_URL_OPTIONAL}}` |
| FR-4.3 | No form submission in v1; if a form is rendered it must be disabled-labelled and submit via `mailto:` fallback |
| FR-4.4 | "Open to" statement: roles, seniority, work mode, timezone |
| FR-4.5 | Response expectation stated honestly (e.g. "I reply within 2 business days") |

### 6.5 404

| Req ID | Requirement |
|--------|-------------|
| FR-5.1 | Friendly message, link home, link to projects |
| FR-5.2 | Served with HTTP status **404** (not 200) via CloudFront custom error response |
| FR-5.3 | Not indexed (`noindex`) |

## 7. Non-functional requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Performance — Lighthouse mobile | Perf ≥ 95, LCP < 2.0 s throttled, CLS < 0.05, INP < 200 ms |
| NFR-2 | Bundle budget | Initial route JS ≤ 200 KB gzip, total CSS ≤ 40 KB gzip |
| NFR-3 | Accessibility | WCAG 2.2 AA: contrast ≥ 4.5:1 body text, full keyboard operation, visible focus, skip-link, respect `prefers-reduced-motion`, semantic landmarks |
| NFR-4 | SEO | Per-route unique `<title>` + meta description, canonical URL, OG + Twitter card, `sitemap.xml`, `robots.txt`, JSON-LD `Person` |
| NFR-5 | Responsive | Usable at 320 px → 2560 px; breakpoints per TRD §6.2 |
| NFR-6 | Browser support | Last 2 versions of Chrome, Edge, Firefox, Safari (incl. iOS) |
| NFR-7 | Security | HTTPS only + HSTS, CSP without `unsafe-inline` where feasible, S3 bucket private, no secrets in repo |
| NFR-8 | Availability | Static + CDN; no single point of failure to operate |
| NFR-9 | Cost | ≤ $2/month steady state excluding domain |
| NFR-10 | Privacy | No third-party analytics cookies in v1 (see §9) |
| NFR-11 | Maintainability | Adding a project = editing one typed object; no component changes |

## 8. Content requirements (must exist before Pi is "done")

| Content | Source | Placeholder |
|---------|--------|-------------|
| Full name | Owner | `{{FULL_NAME}}` |
| Email | Owner | `{{EMAIL}}` |
| Location / work mode | Owner | `{{LOCATION}}`, `{{WORK_MODE}}` |
| GitHub, LinkedIn, other | Owner | `{{GITHUB_URL}}`, `{{LINKEDIN_URL}}`, `{{OTHER_URL_OPTIONAL}}` |
| Résumé PDF | Owner, placed at `src/assets/{{RESUME_FILE}}` | `{{RESUME_FILE}}` |
| Headshot (optional) | Owner | `{{HEADSHOT}}` |
| 3+ roles with measurable achievements | Owner | `experience.ts` |
| 4+ projects (≥2 AWS, ≥1 Go) | Owner | `projects.ts` |
| Certifications + status | Owner | `{{CERT_1}}`… |
| Domain | Owner | `{{DOMAIN}}` |

If a value is missing, the build must still succeed and render a visible `TODO:` marker in development only — never ship a literal `{{PLACEHOLDER}}` to production (see NFR/acceptance).

## 9. Analytics

v1: **none** by default. If the owner wants numbers, use a cookieless, no-consent-required option (e.g. CloudFront standard logs or a privacy-first counter), documented in the PRD before adding. No Google Analytics, no ad pixels.

## 10. Acceptance criteria

- [ ] All P0 routes reachable from the nav and prerender to real HTML.
- [ ] Every FR-* in §6 satisfied, verified by manual checklist on the live URL.
- [ ] Every NFR-* in §7 verified with named evidence (Lighthouse report, axe run, `curl -I` output).
- [ ] Zero `{{...}}` placeholders and zero `TODO:` markers in the deployed build.
- [ ] A recruiter can reach the email from the landing page in one click.
- [ ] Both AWS projects link to a repo or documented write-up.
- [ ] The Go artifact is linked and described in one sentence.

## 11. Open questions (resolve before Phase 3)

| # | Question | Default if unanswered |
|---|----------|-----------------------|
| Q1 | Which domain? | Block Phase 6 only; build with `localhost` + `{{DOMAIN}}` constant |
| Q2 | `www` or apex as canonical? | Apex canonical, `www` 301s to it |
| Q3 | Résumé public or on-request? | Public PDF at a stable path |
| Q4 | Include phone number? | No |
| Q5 | English only? | Yes |
| Q6 | Real company names in experience? | Yes for employers, no for clients |

## 12. Explicitly deferred (v2 candidates — good AWS/Go learning projects)

1. **Contact form** → API Gateway + Lambda (Go) + SES, with Turnstile/honeypot. Doubles as the first real Go-on-AWS artifact.
2. **Blog / notes** → markdown-driven, prerendered at build time.
3. **Live status widgets** → Lambda + DynamoDB or a scheduled Go job writing JSON that the site fetches (e.g. cert progress, Go-repo stats).
4. **Infrastructure as Code** → re-implement Phases 5–7 as AWS CDK (TypeScript) or Terraform, with the site documenting the before/after. Strong portfolio material.
