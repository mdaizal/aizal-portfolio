import type { Cert } from './models';

/**
 * Certifications (PRD §8). Target date confirmed by the owner: January 2027.
 * Status must stay truthful — this is `in-progress` until the exam is passed.
 */
export const CERTS: readonly Cert[] = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    status: 'in-progress',
    target: 'January 2027',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
  },
];
