import type { SkillGroup } from './models';

/**
 * Skills with honest ordinal labels (PRD §6.5, §2).
 *
 * Rules the validator enforces:
 *  - `React` must not appear (it is on LinkedIn but not on the résumé).
 *  - No numeric, percentage, star or bar representation of proficiency.
 *  - AWS and Go stay at `learning` — this site's own deployment and self-study
 *    are the first real practice, and saying so is the point of the site.
 */
export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    category: 'Languages',
    items: [
      { name: 'C#', level: 'strong' },
      { name: 'SQL / T-SQL', level: 'strong' },
      { name: 'VB.NET', level: 'strong' },
      { name: 'JavaScript', level: 'proficient' },
      { name: 'TypeScript', level: 'learning' },
      { name: 'Go', level: 'learning' },
    ],
  },
  {
    category: '.NET & Backend',
    items: [
      { name: 'ASP.NET', level: 'strong' },
      { name: '.NET Framework', level: 'strong' },
      { name: 'Web Services', level: 'proficient' },
      { name: 'REST APIs', level: 'proficient' },
      { name: 'Entity Framework / EF Core', level: 'proficient' },
      { name: '.NET Core', level: 'proficient' },
      { name: '.NET 8 and later', level: 'working' },
      { name: '.NET Minimal API', level: 'working' },
      { name: 'SignalR', level: 'working' },
    ],
  },
  {
    category: 'Data & ORM',
    items: [
      { name: 'MS SQL Server schema design', level: 'strong' },
      { name: 'T-SQL and stored procedures', level: 'strong' },
      { name: 'Query optimisation', level: 'proficient' },
      { name: 'Data integrity', level: 'proficient' },
      { name: 'EF Core code-first, migrations, LINQ', level: 'proficient' },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'JavaScript', level: 'proficient' },
      { name: 'jQuery', level: 'proficient' },
      { name: 'HTML5 and CSS', level: 'proficient' },
      { name: 'Bootstrap', level: 'proficient' },
    ],
  },
  {
    category: 'Cloud & Infrastructure',
    items: [
      { name: 'AWS (hands-on)', level: 'learning' },
      { name: 'IIS', level: 'proficient' },
      { name: 'Git', level: 'proficient' },
      { name: 'Docker', level: 'working' },
      { name: 'Windows Server and IT infrastructure', level: 'strong' },
    ],
  },
  {
    category: 'Ways of working',
    items: [
      { name: 'Production troubleshooting and incident resolution', level: 'strong' },
      { name: 'End-user training', level: 'strong' },
      { name: 'SDLC', level: 'proficient' },
      { name: 'Application deployment and release support', level: 'proficient' },
      { name: 'AI-assisted engineering (Copilot, prompt engineering)', level: 'working' },
    ],
  },
];
