import type { Project } from './models';

/**
 * Projects (PRD §6.6 / §8).
 *
 * Periods are deliberately "Panasonic · 2022–2026" rather than invented year
 * ranges — the résumé does not date the individual internal systems (PRD §11 Q3).
 * The five internal systems carry no links: they are proprietary, and a dead
 * button is worse than none (PRD FR-6.6).
 */
export const PROJECTS: readonly Project[] = [
  {
    slug: 'portfolio-site-aws',
    title: 'Portfolio site on AWS (this site)',
    period: '2026',
    summary:
      'A prerendered Angular site deployed to a private S3 bucket behind CloudFront, with keyless CI — built to be the first real AWS artifact.',
    bullets: [
      'Private S3 bucket with all public access blocked; CloudFront reads it through an Origin Access Control, so nothing is publicly listable.',
      'Least-privilege deploy role scoped to one bucket and one distribution — no s3:*, no bucket deletion, no IAM rights.',
      'GitHub Actions deploys over OIDC, so no AWS access keys exist in the repository or in CI.',
      'Prerendered at build time, so every route ships real HTML with no server to run or patch.',
      'CI enforces lint, unit tests, content validation and bundle budgets before anything is published.',
    ],
    tags: ['AWS', 'S3', 'CloudFront', 'IAM', 'OIDC', 'Angular', 'GitHub Actions'],
    domain: 'aws',
    featured: true,
    repoUrl: 'https://github.com/mdaizal/aizal-portfolio',
  },
  {
    slug: 'inventory-transfer-ticketing',
    title: 'Inventory Transfer Ticketing & Workflow Approval',
    period: 'Panasonic · 2022–2026',
    summary:
      'Replaced a manual, paper-driven transfer process with a ticketing system whose approval flow runs itself.',
    bullets: [
      'Reduced a manual processing cycle from 2 days to about 20 minutes.',
      'Modelled the approval chain as a workflow so sign-off order and audit history were automatic.',
      'Built on C#, ASP.NET and MS SQL Server, hosted on IIS alongside the other plant systems.',
      'Used daily by production and logistics staff as part of normal material movement.',
    ],
    tags: ['C#', 'ASP.NET', 'SQL Server', 'Workflow', 'IIS'],
    domain: 'dotnet',
    featured: true,
  },
  {
    slug: 'real-time-bidding-application',
    title: 'Real-Time Internal Bidding Application',
    period: 'Panasonic · 2022–2026',
    summary:
      'An internal bidding tool where bids appear live for every participant, removing the manual coordination the process used to need.',
    bullets: [
      'Used Entity Framework Core for the data layer and SignalR for live bid updates.',
      'Removed the need for staff to coordinate bids manually or check with each other for the current state.',
      'Real-time updates meant no refresh loop and no stale views during an active bidding window.',
    ],
    tags: ['C#', 'EF Core', 'SignalR', 'Real-time', 'SQL Server'],
    domain: 'dotnet',
    featured: true,
  },
  {
    slug: 'visitor-management-system',
    title: 'Visitor Management System',
    period: 'Panasonic · 2022–2026',
    summary:
      'Site access records for everyone entering a working manufacturing plant, including commercial traffic.',
    bullets: [
      'Handles 100+ daily visitors alongside logistics vehicles and scrap lorries.',
      'Records check-in and check-out so site access can be accounted for and audited.',
      'Covered non-employee traffic that a visitor-only system would have missed.',
    ],
    tags: ['C#', 'ASP.NET', 'SQL Server', 'Access control'],
    domain: 'dotnet',
  },
  {
    slug: 'scrap-weighbridge-compliance',
    title: 'Scrap Weighbridge Compliance System',
    period: 'Panasonic · 2022–2026',
    summary: 'Weight capture for scrap movements, producing the records Customs compliance requires.',
    bullets: [
      'Records lorry weight before and after scrap loading.',
      'Produces the weight records needed to satisfy Customs compliance requirements.',
      'Removed manual weight reconciliation from the scrap disposal process.',
    ],
    tags: ['C#', 'ASP.NET', 'SQL Server', 'Compliance'],
    domain: 'dotnet',
  },
  {
    slug: 'workflow-engine-rollout',
    title: 'Workflow Engine Rollout / Legacy Modernisation',
    period: 'Panasonic · 2022–2026',
    summary:
      'Bridged legacy systems into a modern workflow engine so approvals stopped depending on manual handoffs.',
    bullets: [
      'Built REST APIs that let legacy applications participate in the new workflow engine.',
      'Standardised business approval processes across the organisation rather than one team at a time.',
      'Modernised legacy applications without a full rewrite of systems still in daily use.',
    ],
    tags: ['C#', 'REST APIs', 'ASP.NET', 'Integration', 'Legacy modernisation'],
    domain: 'dotnet',
  },
  {
    slug: 'cloud-lab',
    title: 'cloud-lab',
    period: 'ongoing',
    summary:
      'The public working notebook for the AWS learning path — labs, notes and small experiments, built toward the SAA certification.',
    bullets: [
      'Hands-on AWS practice rather than course-following alone.',
      'Feeds directly into the Solutions Architect – Associate study plan, targeted for January 2027.',
      'Deliberately public so the learning path is verifiable, not just claimed.',
    ],
    tags: ['AWS', 'Learning in public', 'Notes', 'Labs'],
    domain: 'aws',
    repoUrl: 'https://github.com/mdaizal/cloud-lab',
  },
];
