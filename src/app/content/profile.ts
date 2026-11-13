import type { Profile } from './models';

/**
 * Identity, contact and availability (PRD §8).
 * Source: the owner's résumé (Nov 2026) plus owner confirmation on 2026-11-13
 * that the Panasonic role ended Oct 2026 and he is available immediately.
 */
export const PROFILE: Profile = {
  fullName: 'Mohd Aizal Baharuddin',
  shortName: 'Aizal',
  role: 'Software Engineer',
  subtitle: '.NET / C# · moving to AWS Cloud · learning Go',
  pitch:
    'Five years building and supporting enterprise software in C# and .NET, across nineteen years of professional work — now moving that engineering to AWS.',
  location: 'Salak Tinggi, Selangor, Malaysia',
  workMode: 'Remote or hybrid',
  availability: 'Available immediately',
  yearsNet: '5+ years of .NET development',
  yearsTotal: '19 years of professional experience',
  emailUser: 'mohdaizal',
  emailDomain: 'gmail.com',
  github: 'https://github.com/mdaizal',
  linkedin: 'https://www.linkedin.com/in/mohd-aizal-baharuddin-0b0b0519b/',
  resumeUrl: '/assets/aizal-resume.pdf',
  currently: [
    'Studying for the AWS Certified Solutions Architect – Associate, targeting January 2027, while building hands-on AWS projects rather than only reading about them.',
    'Learning Go through self-study. No proficiency claim yet — the first real artifact will be a Lambda-backed contact endpoint on this site.',
    'Available immediately for remote or hybrid software engineering roles, .NET-adjacent or cloud-focused.',
  ],
  openTo:
    'Software engineering roles — .NET-adjacent or cloud/AWS-oriented. Remote or hybrid, Malaysia (UTC+8).',
  responseExpectation: 'I usually reply within 2 business days.',
};
