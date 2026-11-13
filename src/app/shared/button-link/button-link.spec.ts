import { TestBed } from '@angular/core/testing';
import { ButtonLink } from './button-link';

describe('ButtonLink', () => {
  async function render(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(ButtonLink);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders an internal link without target or rel', async () => {
    const el = await render({ href: '#projects', label: 'View projects' });
    const a = el.querySelector('a');
    expect(a?.getAttribute('href')).toBe('#projects');
    expect(a?.hasAttribute('target')).toBe(false);
    expect(a?.hasAttribute('rel')).toBe(false);
    expect(a?.textContent).not.toContain('opens in a new tab');
  });

  it('marks an external link as safe and announces the new tab', async () => {
    const el = await render({
      href: 'https://github.com/mdaizal',
      label: 'GitHub',
      external: true,
    });
    const a = el.querySelector('a');
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a?.textContent).toContain('opens in a new tab');
  });

  it('defaults to the primary variant and switches on request', async () => {
    const primary = await render({ href: '#a', label: 'A' });
    expect(primary.querySelector('a')?.className).toContain('bg-accent');

    const ghost = await render({ href: '#a', label: 'A', variant: 'ghost' });
    expect(ghost.querySelector('a')?.className).toContain('text-accent');
  });
});
