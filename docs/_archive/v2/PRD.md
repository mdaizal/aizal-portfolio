# PRD.md — Personal Portfolio Site (single page)

| Field | Value |
|---|---|
| Product | Personal portfolio — single-page scrolling site |
| Owner | Mohd Aizal Baharuddin ("Aizal") |
| Doc version | 2.0 (content filled; structure changed to single page) |
| Status | Ready for implementation (Pi) |
| Related | `PLAN.md`, `TRD.md` |

---

## 1. Overview

A single-owner static marketing site that presents **Aizal** as a **Software Engineer** with **4+ years** of professional .NET work at Panasonic AVC Networks, now actively pivoting into **AWS cloud engineering** and working through **Go**.

The site makes one claim credible in under 60 seconds:

> *"Four years building and supporting production business systems in C#/.NET — now doing the same engineering on AWS, with a real deployment pipeline to prove it."*

Two assets make this claim unusual, and both must be visible above the fold: the depth of the .NET work (measurable outcomes), and the fact that **this site already runs on AWS** — S3, CloudFront, least-privilege IAM and keyless OIDC deploys.

## 2. Honesty guardrails (binding on all content)

Hard rules. Pi must not write content that violates them; the build validator (TRD §5) should fail on obvious violations.

| Claim | Rule | Why |
|-------|------|-----|
| Years of experience | **"4+ years"** — never "5 years" | LinkedIn (linked from the site) says "4+ years" and the role began June 2022. Matching your own profile is credible; overshooting it is not. |
| AWS experience | May claim: hands-on learning, projects deployed to AWS, SAA certification **in progress**. Must not claim: production AWS workload ownership, migration delivery, cost-optimisation results at scale. | None of the latter are true yet. |
| Go | **Learning / in progress only.** No proficiency claim and no Go deliverable in the project list. | Tutorial level. A proficiency claim collapses under one interview question. |
| Titles | "Software Engineer" as the headline. "Web Application Developer" / ".NET Application Developer" may appear in the experience timeline as the actual job title. | The headline should not invite the "just websites" discount. |
| Technologies | Only list what has actually been used, with an honest label (`learning` / `working` / `proficient` / `strong`). | Fabricated stack entries lose interviews. |

**First Go artifact (planned, v2):** the contact-form endpoint — API Gateway + **Lambda written in Go** + SES. This turns "learning Go" into a shipped, linkable artifact and pairs both learning goals in one project. Until it exists, the site says "learning Go" and links the learning resources, nothing more.

## 3. Goals

| ID | Goal | Measure of success |
|----|------|--------------------|
| G1 | Make the .NET → AWS pivot obvious within 5 seconds | Hero carries the role, the .NET foundation and the AWS direction; no scrolling |
| G2 | Prove the cloud claim with verifiable evidence | The site's own AWS architecture (S3 + CloudFront + OAC + IAM + OIDC) plus the public `cloud-lab` repo are linked and described |
| G3 | Present Go as active, honest, in-progress learning | Explicit "learning" label plus a named first project; no skill overclaim |
| G4 | Let a recruiter act immediately | Email / LinkedIn / GitHub reachable in ≤1 click from anywhere on the page |
| G5 | Demonstrate the claimed engineering through the site itself | Live Lighthouse Perf/A11y ≥ 95, SEO 100; keyboard-operable; CI-gated builds |
| G6 | Be cheap and maintenance-free | ≈ $0/month on AWS free tier (no custom domain in v1); no servers to patch |

## 4. Non-goals

- No CMS, auth, database, comments or analytics cookies.
- No blog section in v1 (see §12).
- No server-side rendering at request time — static output only.
- No contact-form backend in v1; that is the v2 Go project.
- No custom domain required in v1 (CloudFront's own HTTPS domain is used; see PLAN §0 D1).
- Not a design showcase — restraint over novelty.

## 5. Audience

| Persona | Wants in 30 seconds | Design implication |
|---|---|---|
| Technical recruiter | Role, years, location, work mode, stack keywords, contact | Keyword chips, "4+ years" stated numerically, contact in the sticky nav |
| Hiring manager / tech lead | Evidence the .NET depth is real and the AWS work is genuine | Measurable outcomes ("2 days → 20 minutes"), this site's AWS architecture, public repos |
| Engineering peer | Artifacts, honest signal, how the site is built | "How this site is built" section with the repo link |

Primary: hiring manager. Optimize for credibility with them; keep it scannable for the recruiter.

## 6. Information architecture — one page, anchor sections

Single scrolling page at `/` with a sticky header nav. All nav links are in-page anchors. A separate prerendered `/404/index.html` exists for bad paths.

| Order | Section | Anchor | Priority |
|---|---|---|---|
| 1 | Hero | `#top` | P0 |
| 2 | Currently | `#currently` | P0 |
| 3 | About | `#about` | P0 |
| 4 | Experience | `#experience` | P0 |
| 5 | Skills | `#skills` | P0 |
| 6 | Projects | `#projects` | P0 |
| 7 | Contact | `#contact` | P0 |
| — | Footer | — | P1 |

Sticky header: display name (scrolls to `#top`), `About / Experience / Skills / Projects / Contact` anchors, a **Résumé** button, and GitHub + LinkedIn icon links.

### 6.1 Hero (`#top`)
| Req ID | Requirement |
|--------|-------------|
| FR-1.1 | `Mohd Aizal Baharuddin` as the only `<h1>`; secondary line **"Software Engineer"** |
| FR-1.2 | Subtitle: **".NET / C# · moving to AWS Cloud · learning Go"** |
| FR-1.3 | Pitch, ≤ 25 words, derived from §1 |
| FR-1.4 | CTAs: **View projects** (primary, `#projects`) and **Download résumé** (secondary) — the résumé button renders **only if the PDF exists** (§8) |
| FR-1.5 | Meta line: `Salak Tinggi, Selangor, Malaysia` · `Open to remote or hybrid` |
| FR-1.6 | No headshot asset: render a typographic monogram block instead |

### 6.2 Currently (`#currently`)
| Req ID | Requirement |
|--------|-------------|
| FR-2.1 | Exactly 3 status items: **(a)** building hands-on AWS projects and studying for **AWS Certified Solutions Architect – Associate** (target {{SAA_TARGET}}), **(b)** learning **Go** (self-study/tutorial stage), **(c)** open to remote or hybrid software engineering roles |
| FR-2.2 | Each item is a short statement, not a badge; no fabricated progress percentages or dates that cannot be honoured |

### 6.3 About (`#about`)
| Req ID | Requirement |
|--------|-------------|
| FR-3.1 | 150–250 word first-person narrative: the .NET foundation, what he builds today, why the move to AWS |
| FR-3.2 | Frame AWS as *the same engineering applied to new constraints* — never frame .NET as the past and never apologise for the pivot |
| FR-3.3 | Education: **Bachelor of Computer Science**, Universiti Putra Malaysia — Computer Systems Networking and Telecommunications |
| FR-3.4 | "How this site is built" paragraph: Angular 22, prerendered static output, S3 + CloudFront + OAC, least-privilege IAM, GitHub Actions with OIDC, no servers — with the public repo link |

### 6.4 Experience (`#experience`)
| Req ID | Requirement |
|--------|-------------|
| FR-4.1 | Entry 1 — **.NET Application Developer**, Panasonic AVC Networks Kuala Lumpur Malaysia Sdn. Bhd., **June 2022 – Present**, Shah Alam, Selangor, with the bullets in §8 |
| FR-4.2 | Earlier roles: LinkedIn lists 6 positions but only the current one is documented. Render entry 1 only until the earlier roles are supplied. **Never invent prior employers.** |
| FR-4.3 | Every bullet must contain a number, a system name, or a scope — no adjective-only bullets |
| FR-4.4 | The owner's employer and its internal systems may be named; any third-party or customer data must stay anonymised |

### 6.5 Skills (`#skills`)
| Req ID | Requirement |
|--------|-------------|
| FR-5.1 | Groups: **Languages**, **.NET & Web**, **Cloud & Infrastructure**, **Data**, **Ways of working** |
| FR-5.2 | Every item carries an honest label from `learning` / `working` / `proficient` / `strong` — ordinal words only, **no percentages, stars or progress bars** |
| FR-5.3 | `learning` items must be visually distinct, so the AWS/Go gap reads as intentional progress rather than padding |
| FR-5.4 | The source list is `skills.ts` (§8) — no ad-hoc skill markup |

### 6.6 Projects (`#projects`)
| Req ID | Requirement |
|--------|-------------|
| FR-6.1 | Minimum 5 cards, sourced only from `projects.ts`; no hardcoded project markup |
| FR-6.2 | Each card: title, period, one-line summary, 2–5 bullets (problem → what was built → outcome), tech tags, links (repo / write-up) where they exist |
| FR-6.3 | Cards must include: inventory ticketing/workflow (2 days → 20 min), visitor management (100+/day), weighbridge/Customs compliance, workflow-engine modernisation, **this site's AWS deployment**, and `cloud-lab` |
| FR-6.4 | **This site's own card** must describe the real AWS architecture (private S3 + CloudFront + OAC, least-privilege IAM, OIDC keyless deploys) and link the repo — it is the primary AWS evidence |
| FR-6.5 | No card may imply production AWS workload experience beyond deploying this site and learning projects |
| FR-6.6 | If a project has no repo or live URL, omit the link — never render a dead button |
| FR-6.7 | Internal/proprietary detail stays out: no internal hostnames, ticket IDs, server names or customer data |

### 6.7 Contact (`#contact`)
| Req ID | Requirement |
|--------|-------------|
| FR-7.1 | Email `mohdaizal@gmail.com` as an obfuscated `mailto:` (assembled in TS, not a literal string in HTML) |
| FR-7.2 | Links: GitHub `https://github.com/mdaizal`, LinkedIn `https://www.linkedin.com/in/mohd-aizal-baharuddin-0b0b0519b/` |
| FR-7.3 | No form in v1 — and no disabled/decorative form either; it reads as broken |
| FR-7.4 | "Open to" statement: software engineering roles, .NET-adjacent and cloud/AWS-oriented, remote or hybrid, Malaysia (UTC+8) |
| FR-7.5 | Honest response expectation ("I usually reply within 2 business days") |

### 6.8 404
| Req ID | Requirement |
|--------|-------------|
| FR-8.1 | Friendly message with links back to `/` and to `#projects` |
| FR-8.2 | Served with HTTP status **404**, not 200, via CloudFront custom error responses |
| FR-8.3 | `noindex` |

## 7. Non-functional requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Lighthouse mobile (live URL) | Perf ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO 100 |
| NFR-2 | Core Web Vitals | LCP < 2.0 s throttled, CLS < 0.05, INP < 200 ms |
| NFR-3 | Bundle budget | ≤ 200 KB gzip initial JS, ≤ 40 KB gzip CSS |
| NFR-4 | Accessibility | WCAG 2.2 AA — contrast ≥ 4.5:1, full keyboard operation, visible focus, skip link, `prefers-reduced-motion` respected, exactly one `<h1>` |
| NFR-5 | SEO | Unique `<title>` + description, canonical, OG/Twitter card with a 1200×630 image, `sitemap.xml`, `robots.txt`, JSON-LD `Person` |
| NFR-6 | Responsive | 320 px → 2560 px; no horizontal scroll at 320 px |
| NFR-7 | Browser support | Last 2 versions of Chrome, Edge, Firefox, Safari incl. iOS |
| NFR-8 | Copy rules | No "passionate", "results-driven", "guru", "10x", "ninja", "rockstar". First person. Specific over impressive. |
| NFR-9 | Cost | $0/month AWS steady state in v1 (free tier); domain optional later |
| NFR-10 | Maintainability | Adding a project or skill = editing one typed object; no component changes needed |
| NFR-11 | Content integrity | No `{{...}}` placeholder or `TODO` may reach a deployed build; the validator fails the build |

## 8. Content — authoritative values (real data, not placeholders)

### Identity
| Field | Value |
|---|---|
| Display name / `<h1>` | Mohd Aizal Baharuddin |
| Short name (nav, footer) | Aizal |
| Headline role | Software Engineer |
| Subtitle | .NET / C# · moving to AWS Cloud · learning Go |
| Location | Salak Tinggi, Selangor, Malaysia |
| Work mode | Remote or hybrid |
| Email | mohdaizal@gmail.com |
| GitHub | https://github.com/mdaizal |
| LinkedIn | https://www.linkedin.com/in/mohd-aizal-baharuddin-0b0b0519b/ |
| Résumé PDF | **Not yet supplied** → `src/assets/aizal-resume.pdf` (see §11 Q1) |
| Headshot | None — use a monogram block |

### Experience entry 1 (source: LinkedIn, verified)
**.NET Application Developer** — Panasonic AVC Networks Kuala Lumpur Malaysia Sdn. Bhd. — June 2022 – Present — Shah Alam, Selangor.

Bullets (tighten the wording, keep every number):
1. Design and develop enterprise web and desktop applications in **C#, VB.NET, ASP.NET, JavaScript, jQuery, HTML, Bootstrap and SQL Server**.
2. Built an **inventory transfer ticketing system with workflow-based approval**, cutting a manual processing cycle from **2 days to about 20 minutes**.
3. Developed **REST APIs** integrating legacy systems with a modern workflow engine for system-to-system integration.
4. Deployed a workflow engine to **modernise legacy applications** and standardise business approval processes.
5. Built a **Visitor Management System** handling **100+ daily visitors** plus logistics vehicles and scrap lorries.
6. Built a **weighbridge system** recording lorry weight before and after scrap loading for **Customs compliance**.
7. Provide production support for business-critical manufacturing systems; manage SQL Server databases and **IIS-hosted** applications across the full SDLC.
8. Use **AI-assisted engineering and agentic workflows**, reviewing generated code for maintainability, security and internal compliance.

### Education
Bachelor of Computer Science — **Universiti Putra Malaysia** — Computer Systems Networking and Telecommunications.

### Skills (with labels)
| Group | Items |
|---|---|
| Languages | C# `strong` · SQL `proficient` · JavaScript `proficient` · VB.NET `working` · TypeScript `working` · **Go `learning`** |
| .NET & Web | ASP.NET `strong` · Entity Framework `proficient` · REST APIs `proficient` · ASP.NET Core `working` · React `working` · jQuery, Bootstrap, HTML/CSS `proficient` |
| Cloud & Infrastructure | **AWS (hands-on) `learning`** · IIS `proficient` · Windows Server `working` |
| Data | SQL Server `strong` · Database design `proficient` |
| Ways of working | SDLC `proficient` · Production troubleshooting `strong` · Git/GitHub `proficient` · AI-assisted development `working` |

Labelling note: AWS sits at `learning` because there is no production AWS workload yet — this site's deployment is the first real practice. State that plainly; it is the point of the site.

### Projects (`projects.ts`)
| # | Title | Period | Domain | Key content | Links |
|---|-------|--------|--------|-------------|-------|
| 1 | Portfolio site on AWS (this site) | 2026 | `aws` | Private S3 + CloudFront + OAC, least-privilege IAM deploy role, GitHub Actions OIDC (no stored keys), prerendered Angular 22 build, CI budget and quality gates | repo |
| 2 | Inventory Transfer Ticketing & Workflow Approval | 2023–24 | `dotnet` | C#/ASP.NET + SQL Server; workflow approval replaced a manual 2-day cycle with ~20 minutes | none (internal) |
| 3 | Visitor Management System | 2023 | `dotnet` | 100+ daily visitors, logistics vehicles, scrap lorries; check-in/out records for site access control | none (internal) |
| 4 | Scrap Weighbridge Compliance System | 2024 | `dotnet` | Captures lorry weight before/after scrap loading and produces Customs-compliance records | none (internal) |
| 5 | Workflow Engine Rollout / Legacy Modernisation | 2022–23 | `dotnet` | REST APIs bridging legacy systems to a modern workflow engine; standardised approval processes | none (internal) |
| 6 | cloud-lab | ongoing | `aws` | Public learning repo — the hands-on path toward AWS certification: notes, labs and small experiments | https://github.com/mdaizal/cloud-lab |

Internal projects ship without links (correct — FR-6.6). `featured: true` for 1, 2 and 3 if a featured row is used.

### Certifications
| Cert | Issuer | Status |
|---|---|---|
| AWS Certified Solutions Architect – Associate | Amazon Web Services | `in-progress` |

## 9. Analytics

None in v1. If wanted later, choose a cookieless, consent-free option and record the decision in the PRD first. No Google Analytics, no ad pixels.

## 10. Acceptance criteria

- [ ] The single page loads with all 7 sections; every nav anchor scrolls correctly.
- [ ] Hero states name, "Software Engineer", the .NET→AWS subtitle and location/work mode without scrolling.
- [ ] Every FR-* in §6 satisfied, verified by manual checklist on the live URL.
- [ ] Every NFR-* in §7 verified with named evidence (Lighthouse report, axe run, `curl -I` output).
- [ ] Zero `{{...}}` placeholders and zero `TODO` markers in the deployed build.
- [ ] A recruiter can reach the email in one click; a hiring manager can reach this site's repo in one click.
- [ ] This site's own AWS card describes the real architecture, not marketing language.
- [ ] "4+ years" stated, Go labelled `learning`, no production-AWS claim anywhere.
- [ ] Lighthouse mobile on the live URL meets NFR-1.

## 11. Open questions

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Résumé PDF — supply one, or point the button at LinkedIn? | Button hidden until the PDF exists (never a dead link) |
| Q2 | Earlier roles — LinkedIn shows 6 positions, only the current one is documented. Supply them, or leave the timeline at one entry? | One entry; no invented history |
| Q3 | Custom domain, or ship on the CloudFront URL? | CloudFront URL first (free, HTTPS); add a domain later |
| Q4 | Nav/footer short name "Aizal" vs full name? | Short name in nav, full name in the hero |
| Q5 | Target date for the SAA exam (used in `Currently`)? | "targeting 2026" |
| Q6 | Include `TicTacToe` / `dam-haji-game` repos as learning artifacts? | No — low signal, omit |

## 12. Deferred to v2 (each a genuine AWS/Go learning project)

1. **Contact form** → API Gateway + **Lambda in Go** + SES, with a honeypot/Turnstile. *The planned first Go artifact* (PRD §2).
2. **Live status widget** → a scheduled Go job writing a small JSON file the site fetches (e.g. cert progress, repo activity).
3. **Infrastructure as Code** → re-implement Phases 5–7 in AWS CDK (TypeScript) or Terraform and document the before/after. Strong portfolio material and directly reusable SAA knowledge.
4. **Blog / notes** → markdown-driven, prerendered at build time.
5. **Custom domain + Route 53 + ACM** → whenever a hosted zone is worth paying for.
