/**
 * Content model (TRD §5).
 *
 * No phone field exists by design — the number stays in the downloadable résumé
 * PDF and must never be rendered into the page (TRD A11, PRD §11 Q1).
 */

export type Level = 'learning' | 'working' | 'proficient' | 'strong';
export type ProjectDomain = 'dotnet' | 'aws' | 'go';
export type CertStatus = 'earned' | 'in-progress' | 'planned';
export type SkillCategory =
  | 'Languages'
  | '.NET & Backend'
  | 'Data & ORM'
  | 'Frontend'
  | 'Cloud & Infrastructure'
  | 'Ways of working';

export interface Profile {
  fullName: string;
  shortName: string;
  role: string;
  subtitle: string;
  /** Max 25 words (PRD FR-1.3). */
  pitch: string;
  location: string;
  workMode: string;
  availability: string;
  yearsNet: string;
  yearsTotal: string;
  /**
   * Stored as user + domain rather than one string, so the contiguous address
   * never appears in the source or the built bundle. Friction against naive
   * scrapers only — the résumé PDF exposes the address anyway (TRD §14).
   */
  emailUser: string;
  emailDomain: string;
  github: string;
  linkedin: string;
  /** null hides the résumé button entirely — never render a dead link. */
  resumeUrl: string | null;
  /** Exactly 3 items (PRD FR-2.1). */
  currently: string[];
  openTo: string;
  responseExpectation: string;
}

export interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  location?: string;
  /** PRD FR-4.3: every bullet carries a number, a system name, or a scope. */
  achievements: string[];
  tags: string[];
}

export interface SkillItem {
  name: string;
  level: Level;
}

export interface SkillGroup {
  category: SkillCategory;
  items: SkillItem[];
}

export interface Project {
  slug: string;
  title: string;
  period: string;
  summary: string;
  bullets: string[];
  tags: string[];
  domain: ProjectDomain;
  featured?: boolean;
  repoUrl?: string;
  liveUrl?: string;
  writeUpUrl?: string;
}

export interface Cert {
  name: string;
  issuer: string;
  status: CertStatus;
  target?: string;
  url?: string;
}
