# PRD.md — Personal Portfolio Site (single page)

| Field | Value |
|---|---|
| Product | Personal portfolio — single-page scrolling site |
| Owner | Mohd Aizal Baharuddin ("Aizal") |
| Doc version | 3.0 — sourced from the owner's résumé (Nov 2026) |
| Status | Ready for implementation (Pi) |
| Related | `PLAN.md`, `TRD.md` |

---

## 1. Overview

A single-owner static marketing site presenting **Aizal** as a **Software Engineer** with **5+ years of .NET development** inside **19 years of professional software delivery, IT operations and programme management** — now pivoting into **AWS cloud engineering** and working through **Go**.

The site makes one claim credible in under 60 seconds:

> *"Five years of .NET — C#, ASP.NET, EF Core, SQL Server, IIS, in a high-volume manufacturing environment. Nineteen years of delivering and supporting systems people depend on. Now moving that engineering to AWS."*

Three assets carry the claim, and all must be reachable in one click: the measurable .NET outcomes, the breadth of the 19-year history (a differentiator, not a liability), and the fact that **this site already runs on AWS** — S3, CloudFront, least-privilege IAM and keyless OIDC deploys.

**Availability is the most important thing on the page.** The owner is available immediately (from 1 November 2026). That line belongs in the hero, not the footer.

## 2. Honesty guardrails (binding on all content)

Hard rules. Pi must not write content that violates them; the build validator (TRD §5) should fail on obvious violations.

| Claim | Rule | Why |
|-------|------|-----|
| .NET experience | **"5+ years of .NET development"** — supported by the résumé: Trilevel (Dec 2006 – Jan 2008) plus Panasonic (Jun 2022 – Oct 2026) ≈ 5.4 years. | This is the owner's own résumé figure. LinkedIn shows "4+ years" because it counts only recent named history — showing the 2006–2008 .NET role in the experience timeline **reconciles the two numbers** instead of leaving a visible discrepancy. |
| Total experience | May claim **"19 years in software delivery, IT operations and programme management"** — the résumé states it and the timeline evidences it. | A genuine differentiator for a career-pivot story. |
| Availability | May claim **"available immediately (from 1 November 2026)"**. | Stated on the résumé. Confirm before publishing (PRD §11 Q2). |
| AWS experience | May claim: hands-on learning, projects deployed to AWS, SAA certification **in progress** (target January 2027). Must not claim: production AWS workload ownership, migration delivery, or cost-optimisation results at scale. | None of the latter are true yet. |
| Go | **Learning / in progress only.** No proficiency claim, no Go deliverable in the project list. | Tutorial level. A proficiency claim collapses under one interview question. |
| Technologies | Only list what appears in the résumé or has demonstrably been used here. **React is dropped** — it appears on LinkedIn but not on the résumé, and is not in use. | Fabricated stack entries lose interviews. |
| Titles | "Software Engineer" as the headline. The real job titles (" .NET Application Developer", "IT Support", "Training & Development Officer") appear as-is in the timeline. | The headline should not invite the "just websites" discount; the timeline must not rewrite history. |
| Skill levels | Ordinal labels only — `learning` / `working` / `proficient` / `strong`. **Never percentages, stars or progress bars.** | Anything numeric is unfalsifiable and reads as padding. |

**First Go artifact (planned, v2):** the contact-form endpoint — API Gateway + **Lambda written in Go** + SES. This turns "learning Go" into a shipped, linkable artifact and pairs both learning goals in one project. Until it exists, the site says "learning Go" and links the learning repo, nothing more.

## 3. Goals

| ID | Goal | Measure of success |
|----|------|--------------------|
| G1 | Communicate role, depth and availability within 5 seconds | Hero carries Software Engineer, "5+ years .NET", the AWS direction and "available immediately"; no scrolling |
| G2 | Prove the cloud claim with verifiable evidence | This site's own AWS architecture (S3 + CloudFront + OAC + IAM + OIDC) plus the public `cloud-lab` repo are linked and described |
| G3 | Turn 19 years of mixed history from a liability into the story | The timeline shows every role honestly; the About narrative explains the through-line (delivering and supporting systems) rather than apologising for it |
| G4 | Let a recruiter act immediately | Email / LinkedIn / GitHub / résumé reachable in ≤1 click from anywhere on the page |
| G5 | Demonstrate the claimed engineering through the site itself | Live Lighthouse Perf/A11y ≥ 95, SEO 100; keyboard-operable; CI-gated builds |
| G6 | Be cheap and maintenance-free | **$0/month** on AWS free tier (CloudFront default domain, no Route 53, no ACM); no servers to patch |

## 4. Non-goals

- No CMS, auth, database, comments or analytics cookies.
- No blog section in v1 (see §12).
- No server-side rendering at request time — static output only.
- No contact-form backend in v1; that is the v2 Go project.
- No custom domain in v1 (CloudFront's own HTTPS domain is used; see PLAN §0 D1).
- No phone number on the public page (it remains in the downloadable résumé PDF) — see §11 Q1.
- Not a design showcase — restraint over novelty.

## 5. Audience

| Persona | Wants in 30 seconds | Design implication |
|---|---|---|
| Technical recruiter | Role, years, location, work mode, availability, contact | Keyword chips, "5+ years .NET" stated numerically, "available immediately" in the hero, contact in the sticky nav |
| Hiring manager / tech lead | Evidence the .NET depth is real and the AWS work is genuine | Measurable outcomes ("2 days → 20 minutes"), this site's AWS architecture, public repos, full honest timeline |
| Engineering peer | Artifacts, honest signal, how the site is built | "How this site is built" section with the repo link |

Primary: hiring manager. Optimize for credibility with them; keep it scannable for the recruiter.

## 6. Information architecture — one page, anchor sections

Single scrolling page at `/` with a sticky header nav. All nav links are in-page anchors. A separate prerendered `/404/index.html` exists for bad paths.

| Order | Section | Anchor | Priority |
|---|---|---|---|
| 1 | Hero | `#top` | P0 |
| 2 | Currently (availability first) | `#currently` | P0 |
| 3 | About | `#about` | P0 |
| 4 | Experience (6 roles) | `#experience` | P0 |
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
| FR-1.4 | CTAs: **View projects** (primary, `#projects`) and **Download résumé** (secondary → `/assets/aizal-resume.pdf`), which **now renders** because the PDF exists |
| FR-1.5 | Meta line: `Salak Tinggi, Selangor, Malaysia` · `Available immediately` · `Open to remote or hybrid` |
| FR-1.6 | Prominent availability marker (e.g. a dot + "Available for work, from Nov 2026"). No headshot asset — use a typographic monogram block |

### 6.2 Currently (`#currently`)
| Req ID | Requirement |
|--------|-------------|
| FR-2.1 | Exactly 3 status items: **(a)** studying for **AWS Certified Solutions Architect – Associate**, targeting **January 2027**, while building hands-on AWS projects; **(b)** learning **Go** (self-study/tutorial stage); **(c)** available immediately for remote or hybrid software engineering roles |
| FR-2.2 | Each item is a short statement, not a badge; no fabricated progress percentages or dates that cannot be honoured |

### 6.3 About (`#about`)
| Req ID | Requirement |
|--------|-------------|
| FR-3.1 | 150–250 word first-person narrative building the through-line: .NET delivery at Panasonic → earlier IT operations, application support and programme management across government and private sectors (Prime Minister's Department; Ministry of Youth & Sports) → returning to full-time development in 2022 → now moving to AWS |
| FR-3.2 | Frame the career breadth as accumulated capability (systems that people depend on, in regulated and high-volume environments), and AWS as *the same engineering applied to new constraints*. Never apologise for the non-development years |
| FR-3.3 | Education: **Bachelor of Computer Science (Computer Networking)**, Universiti Putra Malaysia, **2006** |
| FR-3.4 | "How this site is built" paragraph: Angular 22, prerendered static output, S3 + CloudFront + OAC, least-privilege IAM, GitHub Actions with OIDC, no servers — with the public repo link |

### 6.4 Experience (`#experience`) — 6 entries, newest first
| Req ID | Requirement |
|--------|-------------|
| FR-4.1 | Render all six entries from `experience.ts` in the order and with the content in §8. Roles 2–6 are compressed (1–2 bullets each); role 1 carries the detail |
| FR-4.2 | Show the date range for every entry; this is what evidences "5+ years .NET" and "19 years total" |
| FR-4.3 | Every bullet must contain a number, a system name, or a scope — no adjective-only bullets |
| FR-4.4 | The employer and its internal systems may be named; any third-party or customer data must stay anonymised. No internal hostnames, ticket IDs or server names |
| FR-4.5 | Non-development roles (3–5) are presented without apology and without inflation — they are the reason the site says 19 years |

### 6.5 Skills (`#skills`)
| Req ID | Requirement |
|--------|-------------|
| FR-5.1 | Groups: **Languages**, **.NET & Backend**, **Data & ORM**, **Frontend**, **Cloud & Infrastructure**, **Ways of working** |
| FR-5.2 | Every item carries an honest label from `learning` / `working` / `proficient` / `strong` — ordinal words only |
| FR-5.3 | `learning` items (AWS, Go, TypeScript) must be visually distinct, so the in-progress areas read as intentional rather than as gaps |
| FR-5.4 | Source list is `skills.ts` (§8). **React must not appear** |
| FR-5.5 | No skill may be listed that the résumé does not support, except TypeScript (`learning`, justified by this Angular build) and AWS (`learning`, justified by this deployment) |

### 6.6 Projects (`#projects`)
| Req ID | Requirement |
|--------|-------------|
| FR-6.1 | 7 cards, sourced only from `projects.ts`; no hardcoded project markup |
| FR-6.2 | Each card: title, period, one-line summary, 2–5 bullets (problem → what was built → outcome), tech tags, links where they exist |
| FR-6.3 | Cards must include: this site's AWS deployment, inventory ticketing/workflow (2 days → 20 min), the real-time internal bidding application (EF Core + SignalR), visitor management (100+/day), weighbridge/Customs compliance, workflow-engine modernisation, and `cloud-lab` |
| FR-6.4 | **This site's own card** must describe the real AWS architecture (private S3 + CloudFront + OAC, least-privilege IAM, OIDC keyless deploys) and link the repo — it is the primary AWS evidence |
| FR-6.5 | No card may imply production AWS workload experience beyond deploying this site and learning projects |
| FR-6.6 | If a project has no repo or live URL, omit the link — never render a dead button. The five internal systems therefore carry no links |
| FR-6.7 | Project periods default to **"Panasonic · 2022–2026"** — the résumé does not date individual systems, so do not invent year ranges (see §11 Q3) |

### 6.7 Contact (`#contact`)
| Req ID | Requirement |
|--------|-------------|
| FR-7.1 | Email `mohdaizal@gmail.com` as an obfuscated `mailto:` (assembled in TS, not a literal string in HTML) |
| FR-7.2 | Links: GitHub `https://github.com/mdaizal`, LinkedIn `https://www.linkedin.com/in/mohd-aizal-baharuddin-0b0b0519b/` |
| FR-7.3 | Direction link to the résumé PDF. **No phone number on the page** (it is in the PDF, which a recruiter can download) |
| FR-7.4 | No form in v1 — and no disabled/decorative form either; it reads as broken |
| FR-7.5 | "Open to" statement: software engineering roles, .NET-adjacent and cloud/AWS-oriented, remote or hybrid, Malaysia (UTC+8). Available immediately |
| FR-7.6 | Honest response expectation ("I usually reply within 2 business days") |

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
| NFR-3 | Bundle budget | ≤ 200 KB **gzip** initial transfer (JS + CSS combined). Enforced in CI via Angular's `budgets`, which measure **raw** size — so the configured raw ceilings are 300 kB warning / 350 kB error. Measured baseline: **241 kB raw = 68 kB gzip** (varies with build cache; ~275 kB raw on a cold build) |
| NFR-4 | Accessibility | WCAG 2.2 AA — contrast ≥ 4.5:1, full keyboard operation, visible focus, skip link, `prefers-reduced-motion` respected, exactly one `<h1>`, a 6-entry timeline that reads correctly in a screen reader |
| NFR-5 | SEO | Unique `<title>` + description, canonical, OG/Twitter card with a 1200×630 image, `sitemap.xml`, `robots.txt`, JSON-LD `Person` |
| NFR-6 | Responsive | 320 px → 2560 px; no horizontal scroll at 320 px |
| NFR-7 | Browser support | Last 2 versions of Chrome, Edge, Firefox, Safari incl. iOS |
| NFR-8 | Copy rules | No "passionate", "results-driven", "guru", "10x", "ninja", "rockstar". First person. Specific over impressive. No apologising for the career path |
| NFR-9 | Cost | **$0/month** AWS steady state in v1 (free tier); domain optional later |
| NFR-10 | Maintainability | Adding a project, skill or role = editing one typed object; no component changes needed |
| NFR-11 | Content integrity | No `{{...}}` placeholder or `TODO` may reach a deployed build; the validator fails the build |

## 8. Content — authoritative values (from the résumé, Nov 2026)

### Identity
| Field | Value |
|---|---|
| Display name / `<h1>` | Mohd Aizal Baharuddin (résumé header reads "Mohd Aizal Bin Baharuddin"; the form without "Bin" matches LinkedIn — see §11 Q6) |
| Short name (nav, footer) | Aizal |
| Headline role | Software Engineer |
| Subtitle | .NET / C# · moving to AWS Cloud · learning Go |
| Location | Salak Tinggi, Selangor, Malaysia |
| Work mode | Remote or hybrid |
| Availability | **Available immediately (from 1 November 2026)** |
| Email | mohdaizal@gmail.com |
| Phone | +60 13-397 1830 — **résumé PDF only, not on the page** |
| GitHub | https://github.com/mdaizal |
| LinkedIn | https://www.linkedin.com/in/mohd-aizal-baharuddin-0b0b0519b/ |
| Résumé | `/assets/aizal-resume.pdf` ✅ file supplied and staged |
| Headshot | None — use a monogram block |
| Summary numbers | 5+ years .NET development · 19 years total professional experience · 5 production enterprise systems shipped at Panasonic |

### Experience (6 entries, newest first)

**1. .NET Application Developer** — Panasonic AVC Networks Kuala Lumpur Malaysia Sdn. Bhd. — Jun 2022 – Oct 2026 — Shah Alam, Selangor
1. Designed and built enterprise web and desktop applications in **C#, VB.NET, ASP.NET and MS SQL Server**, supporting business-critical manufacturing operations.
2. Built an **inventory transfer ticketing system with workflow approval**, cutting a **2-day** manual processing cycle to about **20 minutes**.
3. Developed a **real-time internal bidding application using Entity Framework Core and SignalR**, so staff could bid on company items without manual coordination.
4. Built **REST APIs** integrating legacy systems with a modern workflow engine for system-to-system integration.
5. Delivered a **workflow engine** that modernised legacy applications and standardised approval processes across the organisation.
6. Built a **Visitor Management System** handling **100+ daily visitors** plus logistics vehicles and scrap lorries.
7. Built a **weighbridge system** recording lorry weight before and after scrap loading to satisfy **Customs compliance**.
8. Managed **MS SQL databases and IIS-hosted applications** across the full SDLC, including testing, deployment and post-release support.
9. Provided production application support, investigating and resolving incidents for operational teams.
10. Applied **AI-assisted engineering** (GitHub Copilot, prompt engineering), reviewing generated code for maintainability, security and compliance with internal standards.

**2. IT Support** — Barisan Mahamega Sdn. Bhd. — Jan 2022 – May 2022
- IT infrastructure and application support; software installation and upgrades; network and hardware troubleshooting.
- Delivered user training on internally developed applications.

**3. IT & Operations Support** — UV Kool Tint, Seremban — Feb 2020 – Dec 2021
- Installed and configured IT hardware and software, provided application troubleshooting and supported day-to-day business operations.

**4. Senior Training & Development Officer** — Institute of Leadership Excellence & Development, Ministry of Youth & Sports — Jan 2019 – Dec 2019
- Managed leadership development programmes; coordinated trainers and logistics; facilitated workshops and prepared reports.

**5. Training & Development Officer** — Biro Tatanegara, Prime Minister's Department — Feb 2008 – Dec 2018
- Planned and managed nationwide training programmes; coordinated government and private-sector engagement; facilitated organisational development programmes.

**6. .NET Application Developer** — Trilevel Sdn. Bhd. — Dec 2006 – Jan 2008
- Designed and developed web applications on the **.NET Framework**; gathered client requirements and delivered user training.
- Conducted testing, debugging and deployment across the software delivery lifecycle.

**Career note (rendered under the timeline, verbatim intent):** 2008–2021 delivered IT operations, application support and programme-management work across government and private sectors, including the Prime Minister's Department and the Ministry of Youth & Sports. Returned to full-time .NET development in 2022 and has since designed and shipped five production enterprise systems at Panasonic.

### Education
Bachelor of Computer Science (Computer Networking) — **Universiti Putra Malaysia**, 2006.

### Skills (labels per PRD §2)
| Group | Items |
|---|---|
| Languages | C# `strong` · VB.NET `strong` · SQL / T-SQL `strong` · JavaScript `proficient` · **TypeScript `learning`** · **Go `learning`** |
| .NET & Backend | ASP.NET `strong` · .NET Framework `strong` · Web Services `proficient` · REST APIs `proficient` · Entity Framework / EF Core `proficient` · .NET Core `proficient` · .NET 8+ `working` · .NET Minimal API `working` · SignalR `working` |
| Data & ORM | MS SQL Server schema design `strong` · T-SQL & stored procedures `strong` · Query optimisation `proficient` · Data integrity `proficient` · EF / EF Core code-first, migrations, LINQ `proficient` |
| Frontend | JavaScript `proficient` · jQuery `proficient` · HTML5 & CSS `proficient` · Bootstrap `proficient` |
| Cloud & Infrastructure | **AWS (hands-on) `learning`** · IIS `proficient` · Git `proficient` · Docker `working` · Windows Server & IT infrastructure `strong` |
| Ways of working | Production troubleshooting & incident resolution `strong` · End-user training `strong` · SDLC `proficient` · Application deployment & release support `proficient` · AI-assisted engineering (Copilot, prompt engineering) `working` |

Note: AWS and TypeScript sit at `learning` because neither has production mileage yet — this deployment and this Angular build are the first real practice. State that plainly; it is the point of the site.

### Projects (`projects.ts`) — 7 cards
| # | Title | Period | Domain | Key content | Links |
|---|-------|--------|--------|-------------|-------|
| 1 | Portfolio site on AWS (this site) | 2026 | `aws` | Private S3 + CloudFront + OAC, least-privilege IAM deploy role, GitHub Actions OIDC (no stored keys), prerendered Angular 22 build, CI budget and content gates | repo |
| 2 | Inventory Transfer Ticketing & Workflow Approval | Panasonic · 2022–2026 | `dotnet` | C#/ASP.NET + SQL Server; workflow approval replaced a manual 2-day cycle with ~20 minutes | none (internal) |
| 3 | Real-Time Internal Bidding Application | Panasonic · 2022–2026 | `dotnet` | Entity Framework Core + **SignalR**; live bid updates removed manual coordination between staff | none (internal) |
| 4 | Visitor Management System | Panasonic · 2022–2026 | `dotnet` | 100+ daily visitors plus logistics vehicles and scrap lorries; check-in/out records for site access control | none (internal) |
| 5 | Scrap Weighbridge Compliance System | Panasonic · 2022–2026 | `dotnet` | Captures lorry weight before and after scrap loading and produces Customs-compliance records | none (internal) |
| 6 | Workflow Engine Rollout / Legacy Modernisation | Panasonic · 2022–2026 | `dotnet` | REST APIs bridging legacy systems to a modern workflow engine; standardised approvals organisation-wide | none (internal) |
| 7 | cloud-lab | ongoing | `aws` | Public learning repo — the hands-on path toward AWS certification: notes, labs and small experiments | https://github.com/mdaizal/cloud-lab |

`featured: true` for 1, 2 and 3 if a featured row is used.

### Certifications
| Cert | Issuer | Status | Target |
|---|---|---|---|
| AWS Certified Solutions Architect – Associate | Amazon Web Services | `in-progress` | January 2027 |

## 9. Analytics

None in v1. If wanted later, choose a cookieless, consent-free option and record the decision in the PRD first. No Google Analytics, no ad pixels.

## 10. Acceptance criteria

- [ ] The single page loads with all 7 sections; every nav anchor scrolls correctly.
- [ ] Hero states name, "Software Engineer", "5+ years .NET", the AWS direction and availability without scrolling.
- [ ] All six experience entries render with date ranges; the timeline is the evidence for both "5+ years .NET" and "19 years".
- [ ] The résumé PDF downloads from the header button.
- [ ] No phone number anywhere in the rendered page.
- [ ] Every FR-* in §6 satisfied, verified by manual checklist on the live URL.
- [ ] Every NFR-* in §7 verified with named evidence (Lighthouse report, axe run, `curl -I` output).
- [ ] Zero `{{...}}` placeholders and zero `TODO` markers in the deployed build.
- [ ] A recruiter can reach the email in one click; a hiring manager can reach this site's repo in one click.
- [ ] This site's own AWS card describes the real architecture, not marketing language.
- [ ] React appears nowhere in skills.
- [ ] Go labelled `learning`, AWS labelled `learning`, no production-AWS claim anywhere.
- [ ] `https://mdaizal.github.io` is retired (PLAN Phase 9.4).

## 11. Open questions

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Phone number on the public page? | **No** — it stays in the downloadable PDF only |
| Q2 | ~~Confirm the Panasonic end date~~ **RESOLVED 2026-11-13:** the owner confirmed the role ended **Oct 2026** and he is **available immediately**. The hero, `Currently` and Contact availability lines are correct as written. | Closed |
| Q3 | Project periods — the résumé doesn't date the internal systems | Show "Panasonic · 2022–2026" for all five; never invent year ranges |
| Q4 | TypeScript label | `learning` until this site ships, then upgrade to `working` |
| Q5 | React is on LinkedIn but not on the résumé — dropped from skills. Confirm | Dropped |
| Q6 | Display name: "Mohd Aizal Baharuddin" (matches LinkedIn) vs résumé's "Mohd Aizal Bin Baharuddin" | Without "Bin", matching LinkedIn |
| Q7 | Gap Dec 2019 – Jan 2020 and Dec 2021 – Jan 2022 between roles | Leave unremarked — the timeline shows ranges only |

## 12. Deferred to v2 (each a genuine AWS/Go learning project)

1. **Contact form** → API Gateway + **Lambda in Go** + SES, with a honeypot/Turnstile. *The planned first Go artifact* (PRD §2).
2. **Live status widget** → a scheduled Go job writing a small JSON file the site fetches (e.g. SAA study progress, repo activity).
3. **Infrastructure as Code** → re-implement Phases 5–7 in AWS CDK (TypeScript) or Terraform and document the before/after. Directly reusable SAA knowledge and strong portfolio material.
4. **Blog / notes** → markdown-driven, prerendered at build time (e.g. write-ups of the SAA study path).
5. **Custom domain + Route 53 + ACM** → whenever a hosted zone is worth paying for.
