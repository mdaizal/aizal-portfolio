import { CERTS } from './certs';
import { CAREER_NOTE, EXPERIENCE } from './experience';
import type { Level } from './models';
import { PROFILE } from './profile';
import { PROJECTS } from './projects';
import { SKILL_GROUPS } from './skills';

/**
 * Content gate (TRD §5).
 *
 * The spec fails the build rather than the prose: a written instruction not to
 * ship a placeholder does not survive an implementer under time pressure, but a
 * red test does. `npm run build:prod` runs this suite before `ng build`.
 */

const LEVELS: readonly Level[] = ['learning', 'working', 'proficient', 'strong'];

/** Every string reachable from a content value, with a path for the error message. */
function allStrings(value: unknown, path = 'root'): { path: string; value: string }[] {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => allStrings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => allStrings(v, `${path}.${k}`));
  }
  return [];
}

const CONTENT = { PROFILE, EXPERIENCE, PROJECTS, SKILL_GROUPS, CERTS };

describe('content', () => {
  describe('rule 1 — no unresolved placeholders', () => {
    it('contains no {{...}} placeholder', () => {
      const offenders = allStrings(CONTENT).filter((s) => s.value.includes('{{'));
      expect(offenders.map((o) => o.path)).toEqual([]);
    });

    it('contains no TODO marker', () => {
      const offenders = allStrings(CONTENT).filter((s) => /TODO/i.test(s.value));
      expect(offenders.map((o) => o.path)).toEqual([]);
    });
  });

  describe('rule 2 — the experience timeline evidences the summary numbers', () => {
    it('has at least 6 roles', () => {
      expect(EXPERIENCE.length).toBeGreaterThanOrEqual(6);
    });

    it('includes the 2006–2008 .NET role that reconciles "5+ years" with LinkedIn', () => {
      const trilevel = EXPERIENCE.find((e) => e.org.includes('Trilevel'));
      expect(trilevel).toBeDefined();
      expect(trilevel?.period).toContain('2006');
      expect(trilevel?.period).toContain('2008');
    });

    it('ends the Panasonic role in Oct 2026, matching the confirmed availability', () => {
      const panasonic = EXPERIENCE.find((e) => e.org.includes('Panasonic'));
      expect(panasonic?.period).toBe('Jun 2022 – Oct 2026');
    });

    it('gives every role a period and at least one bullet', () => {
      for (const entry of EXPERIENCE) {
        expect(entry.period, entry.role).toBeTruthy();
        expect(entry.achievements.length, entry.role).toBeGreaterThan(0);
      }
    });
  });

  describe('rule 3/4 — projects', () => {
    it('has at least 7 projects', () => {
      expect(PROJECTS.length).toBeGreaterThanOrEqual(7);
    });

    it('includes this site as an AWS project with a repo link', () => {
      const site = PROJECTS.find((p) => p.slug === 'portfolio-site-aws');
      expect(site?.domain).toBe('aws');
      expect(site?.repoUrl).toContain('github.com');
    });

    it('has at least one aws-domain project', () => {
      expect(PROJECTS.some((p) => p.domain === 'aws')).toBe(true);
    });

    it('uses unique slugs', () => {
      expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
    });

    it('never links to an empty URL', () => {
      for (const p of PROJECTS) {
        for (const url of [p.repoUrl, p.liveUrl, p.writeUpUrl]) {
          if (url !== undefined) expect(url, p.slug).toMatch(/^https:\/\//);
        }
      }
    });
  });

  describe('rule 5 — availability is present and exact', () => {
    it('has exactly 3 currently items', () => {
      expect(PROFILE.currently).toHaveLength(3);
    });

    it('states availability', () => {
      expect(PROFILE.availability).toBe('Available immediately');
    });
  });

  describe('rule 6/7 — skills use ordinal labels only', () => {
    it('has 6 skill groups', () => {
      expect(SKILL_GROUPS).toHaveLength(6);
    });

    it('labels every skill with an allowed ordinal level', () => {
      for (const group of SKILL_GROUPS) {
        for (const item of group.items) {
          expect(LEVELS, `${item.name} has level "${item.level}"`).toContain(item.level);
        }
      }
    });

    it('uses no numeric, percentage or star representation of proficiency', () => {
      const offenders = SKILL_GROUPS.flatMap((g) => g.items)
        .map((i) => i.name)
        .filter((n) => /\d+\s*%|\b\d\/\d\b|★|☆/.test(n));
      expect(offenders).toEqual([]);
    });

    it('keeps AWS and Go at learning level — no proficiency overclaim', () => {
      const flat = SKILL_GROUPS.flatMap((g) => g.items);
      expect(flat.find((i) => i.name.includes('AWS'))?.level).toBe('learning');
      expect(flat.find((i) => i.name === 'Go')?.level).toBe('learning');
    });
  });

  describe('rule 8 — React is not claimed', () => {
    it('does not list React anywhere in skills', () => {
      const offenders = SKILL_GROUPS.flatMap((g) => g.items).filter((i) =>
        /react/i.test(i.name),
      );
      expect(offenders).toEqual([]);
    });
  });

  describe('rule 9 — no phone number reaches the page', () => {
    it('contains no phone-like digit run in any content value', () => {
      const offenders = allStrings(CONTENT).filter((s) => /\+?\d[\d\s-]{8,}/.test(s.value));
      expect(offenders.map((o) => o.path)).toEqual([]);
    });

    it('contains no Malaysian country code', () => {
      const offenders = allStrings(CONTENT).filter((s) => s.value.includes('+60'));
      expect(offenders.map((o) => o.path)).toEqual([]);
    });
  });

  describe('rule 10 — Go stays out of projects until a Go artifact exists', () => {
    it('has no go-domain project while Go is still tutorial-level', () => {
      expect(PROJECTS.filter((p) => p.domain === 'go')).toEqual([]);
    });

    it('describes Go as learning in the currently section', () => {
      expect(PROFILE.currently.some((c) => /learning go/i.test(c))).toBe(true);
    });
  });

  describe('supporting content', () => {
    it('has a résumé available to link', () => {
      expect(PROFILE.resumeUrl).toBe('/assets/aizal-resume.pdf');
    });

    it('splits the contact address so the contiguous form is not stored', () => {
      expect(PROFILE.emailUser).toBeTruthy();
      expect(PROFILE.emailDomain).toBeTruthy();
      expect(`${PROFILE.emailUser}${PROFILE.emailDomain}`).not.toContain('@');
    });

    it('lists the SAA certification as in progress with the confirmed target', () => {
      const saa = CERTS.find((c) => c.name.includes('Solutions Architect'));
      expect(saa?.status).toBe('in-progress');
      expect(saa?.target).toBe('January 2027');
    });

    it('has a career note explaining the non-development years', () => {
      expect(CAREER_NOTE).toContain('2008');
    });

    it('keeps the pitch within 25 words', () => {
      expect(PROFILE.pitch.split(/\s+/).length).toBeLessThanOrEqual(25);
    });
  });
});
