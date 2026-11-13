import { TestBed } from '@angular/core/testing';
import { SectionHeading } from './section-heading';

describe('SectionHeading', () => {
  async function render(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(SectionHeading);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the title as an h2 carrying the requested anchor id', async () => {
    const el = await render({ title: 'Projects', headingId: 'projects-heading' });
    const h2 = el.querySelector('h2');
    expect(h2?.textContent?.trim()).toBe('Projects');
    expect(h2?.id).toBe('projects-heading');
  });

  it('omits the eyebrow and lead when they are not supplied', async () => {
    const el = await render({ title: 'Projects' });
    expect(el.querySelectorAll('p').length).toBe(0);
  });

  it('renders the eyebrow and lead when supplied', async () => {
    const el = await render({ title: 'Projects', eyebrow: 'Selected work', lead: 'Five systems.' });
    expect(el.textContent).toContain('Selected work');
    expect(el.textContent).toContain('Five systems.');
  });
});
