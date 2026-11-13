import type { ExperienceEntry } from './models';

/**
 * Full career history, newest first (PRD §6.4 / §8).
 *
 * All six entries are required: together they are the evidence for both
 * "5+ years of .NET development" (roles 1 and 6) and "19 years of professional
 * experience". The content validator fails the build if any are missing.
 * Source: the owner's résumé, Nov 2026.
 */
export const EXPERIENCE: readonly ExperienceEntry[] = [
  {
    role: '.NET Application Developer',
    org: 'Panasonic AVC Networks Kuala Lumpur Malaysia Sdn. Bhd.',
    period: 'Jun 2022 – Oct 2026',
    location: 'Shah Alam, Selangor',
    achievements: [
      'Designed and built enterprise web and desktop applications in C#, VB.NET, ASP.NET and MS SQL Server, supporting business-critical manufacturing operations.',
      'Built an inventory transfer ticketing system with workflow approval, cutting a manual processing cycle from 2 days to about 20 minutes.',
      'Developed a real-time internal bidding application using Entity Framework Core and SignalR, so staff could bid on company items without manual coordination.',
      'Built REST APIs integrating legacy systems with a modern workflow engine for system-to-system integration.',
      'Delivered a workflow engine that modernised legacy applications and standardised approval processes across the organisation.',
      'Built a Visitor Management System handling 100+ daily visitors plus logistics vehicles and scrap lorries.',
      'Built a weighbridge system recording lorry weight before and after scrap loading to satisfy Customs compliance.',
      'Managed MS SQL databases and IIS-hosted applications across the full SDLC, including testing, deployment and post-release support.',
      'Provided production application support, investigating and resolving incidents for operational teams.',
      'Applied AI-assisted engineering (GitHub Copilot, prompt engineering), reviewing generated code for maintainability, security and compliance with internal standards.',
    ],
    tags: ['C#', 'ASP.NET', 'EF Core', 'SignalR', 'SQL Server', 'IIS', 'REST APIs'],
  },
  {
    role: 'IT Support',
    org: 'Barisan Mahamega Sdn. Bhd.',
    period: 'Jan 2022 – May 2022',
    achievements: [
      'Provided IT infrastructure and application support, managed software installation and upgrades, and resolved network and hardware issues.',
      'Delivered user training on internally developed applications and supported end users with technical issues.',
    ],
    tags: ['IT support', 'Hardware', 'User training'],
  },
  {
    role: 'IT & Operations Support',
    org: 'UV Kool Tint, Seremban',
    period: 'Feb 2020 – Dec 2021',
    achievements: [
      'Installed and configured IT hardware and software, provided application troubleshooting, and supported day-to-day business operations.',
    ],
    tags: ['IT support', 'Operations'],
  },
  {
    role: 'Senior Training & Development Officer',
    org: 'Institute of Leadership Excellence & Development, Ministry of Youth & Sports',
    period: 'Jan 2019 – Dec 2019',
    achievements: [
      'Managed leadership development programmes, coordinated trainers and logistics, facilitated workshops and prepared reports.',
    ],
    tags: ['Programme management', 'Training'],
  },
  {
    role: 'Training & Development Officer',
    org: "Biro Tatanegara, Prime Minister's Department",
    period: 'Feb 2008 – Dec 2018',
    achievements: [
      'Planned and managed nationwide training programmes, coordinated government and private-sector engagement, and facilitated organisational development programmes.',
    ],
    tags: ['Programme management', 'Public sector'],
  },
  {
    role: '.NET Application Developer',
    org: 'Trilevel Sdn. Bhd.',
    period: 'Dec 2006 – Jan 2008',
    achievements: [
      'Designed and developed web applications on the .NET Framework, gathered client requirements and delivered user training.',
      'Conducted testing, debugging and deployment activities throughout the software delivery lifecycle.',
    ],
    tags: ['.NET Framework', 'Web apps'],
  },
];

/** Rendered under the timeline (PRD §8). */
export const CAREER_NOTE =
  '2008–2021 was spent in IT operations, application support and programme management across government and private sectors, including the Prime Minister\u2019s Department and the Ministry of Youth & Sports. Returned to full-time .NET development in 2022 and has since designed and shipped five production enterprise systems at Panasonic.';

export const EDUCATION = {
  degree: 'Bachelor of Computer Science (Computer Networking)',
  institution: 'Universiti Putra Malaysia',
  year: '2006',
} as const;
