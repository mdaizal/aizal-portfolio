import { TestBed } from '@angular/core/testing';
import { ABOUT_PARAGRAPHS, HOW_THIS_SITE_IS_BUILT } from '../../content/about';
import { Home } from './home';

/**
 * Integration test for the single-page acceptance criteria (PRD §10).
 *
 * These assertions are the ones a reviewer would otherwise have to check by eye
 * against the live URL, so they run in CI: one h1, every nav anchor present, all
 * six roles and all seven projects rendered, and no phone number anywhere.
 */
describe('Home — single-page acceptance', () => {
  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders exactly one h1, and it is the owner name', async () => {
    const el = await render();
    const headings = el.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent).toContain('Mohd Aizal Baharuddin');
  });

  it('exposes every anchor the header nav and scroll-spy depend on', async () => {
    const el = await render();
    for (const id of ['top', 'currently', 'about', 'experience', 'skills', 'projects', 'contact']) {
      expect(el.querySelector(`#${id}`), `missing section #${id}`).not.toBeNull();
    }
  });

  it('states availability and the headline title in the hero', async () => {
    const el = await render();
    const text = el.textContent ?? '';
    expect(text).toContain('Available immediately');
    expect(text).toContain('Software Engineer');
    expect(text).toContain('5+ years of .NET development');
  });

  it('renders all six roles, each with its date range', async () => {
    const el = await render();
    expect(el.querySelectorAll('app-timeline-entry').length).toBe(6);
    const text = el.textContent ?? '';
    expect(text).toContain('Jun 2022 – Oct 2026');
    expect(text).toContain('Dec 2006 – Jan 2008');
    expect(text).toContain('Trilevel');
  });

  it('renders all seven project cards', async () => {
    const el = await render();
    expect(el.querySelectorAll('app-project-card').length).toBe(7);
  });

  it('renders all six skill groups', async () => {
    const el = await render();
    expect(el.querySelectorAll('app-skill-group').length).toBe(6);
  });

  it('links the résumé as a download from the hero', async () => {
    const el = await render();
    const resume = Array.from(el.querySelectorAll('a')).find(
      (a) => a.hasAttribute('download'),
    );
    expect(resume?.getAttribute('href')).toBe('/assets/aizal-resume.pdf');
  });

  it('assembles the contact address from its parts', async () => {
    const el = await render();
    expect(el.textContent).toContain('mohdaizal@gmail.com');
    const mailto = Array.from(el.querySelectorAll('a')).find((a) =>
      a.getAttribute('href')?.startsWith('mailto:'),
    );
    expect(mailto?.getAttribute('href')).toBe('mailto:mohdaizal@gmail.com');
  });

  it('never renders a phone number (TRD A11)', async () => {
    const el = await render();
    const text = el.textContent ?? '';
    expect(text).not.toContain('+60');
    expect(text).not.toMatch(/\d{2,}-\d{3,}\s?\d{3,}/);
  });

  it('marks every external link safe and announces the new tab', async () => {
    const el = await render();
    const external = Array.from(el.querySelectorAll('a[target="_blank"]'));
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('gives every section a heading and no skipped levels under the h1', async () => {
    const el = await render();
    for (const id of ['about', 'experience', 'skills', 'projects', 'contact']) {
      expect(el.querySelector(`#${id} h2`), `#${id} has no h2`).not.toBeNull();
    }
  });

  it('keeps the About narrative inside the PRD length window (FR-3.1)', () => {
    const words = ABOUT_PARAGRAPHS.join(' ').split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(150);
    expect(words).toBeLessThanOrEqual(250);
  });

  it('documents how the site itself is built (FR-3.4)', () => {
    const text = HOW_THIS_SITE_IS_BUILT.join(' ');
    expect(HOW_THIS_SITE_IS_BUILT.length).toBeGreaterThanOrEqual(3);
    expect(text).toMatch(/CloudFront/);
    expect(text).toMatch(/OIDC/);
    expect(text).toMatch(/S3/);
  });
});
