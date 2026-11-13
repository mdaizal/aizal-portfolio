import { TestBed } from '@angular/core/testing';
import type { ExperienceEntry } from '../../content/models';
import { TimelineEntry } from './timeline-entry';

const ENTRY: ExperienceEntry = {
  role: '.NET Application Developer',
  org: 'Panasonic AVC Networks Kuala Lumpur Malaysia Sdn. Bhd.',
  period: 'Jun 2022 – Oct 2026',
  location: 'Shah Alam, Selangor',
  achievements: ['Cut a 2-day cycle to 20 minutes.', 'Built a weighbridge system.'],
  tags: ['C#', 'ASP.NET'],
};

describe('TimelineEntry', () => {
  async function render(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(TimelineEntry);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders role, org, period and location', async () => {
    const el = await render({ entry: ENTRY });
    expect(el.querySelector('h3')?.textContent).toContain('.NET Application Developer');
    expect(el.textContent).toContain('Panasonic AVC Networks');
    expect(el.textContent).toContain('Jun 2022 – Oct 2026');
    expect(el.textContent).toContain('Shah Alam, Selangor');
  });

  it('always renders the period, since the timeline evidences the experience claims', async () => {
    const el = await render({ entry: ENTRY });
    expect(el.querySelector('.sr-only')?.textContent).toContain('Period:');
  });

  it('renders one bullet per achievement', async () => {
    const el = await render({ entry: ENTRY });
    const bulletItems = el.querySelectorAll('ul:first-of-type li');
    expect(bulletItems.length).toBe(2);
  });

  it('hides the connecting rail on the final entry', async () => {
    const withRail = await render({ entry: ENTRY });
    const withoutRail = await render({ entry: ENTRY, last: true });
    const rails = (el: HTMLElement) =>
      Array.from(el.querySelectorAll('span[aria-hidden="true"]')).filter((s) =>
        s.className.includes('bottom-0'),
      ).length;
    expect(rails(withRail)).toBe(1);
    expect(rails(withoutRail)).toBe(0);
  });
});
