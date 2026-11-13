import { TestBed } from '@angular/core/testing';
import type { SkillGroup } from '../../content/models';
import { SkillGroupComponent } from './skill-group';

const GROUP: SkillGroup = {
  category: 'Cloud & Infrastructure',
  items: [
    { name: 'AWS (hands-on)', level: 'learning' },
    { name: 'IIS', level: 'proficient' },
  ],
};

describe('SkillGroupComponent', () => {
  async function render(group: SkillGroup) {
    const fixture = TestBed.createComponent(SkillGroupComponent);
    fixture.componentRef.setInput('group', group);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the category and one entry per skill', async () => {
    const el = await render(GROUP);
    expect(el.querySelector('h3')?.textContent).toContain('Cloud & Infrastructure');
    expect(el.querySelectorAll('li').length).toBe(2);
    expect(el.textContent).toContain('AWS (hands-on)');
  });

  it('shows the ordinal level for every skill rather than a bare name', async () => {
    const el = await render(GROUP);
    expect(el.textContent).toContain('learning');
    expect(el.textContent).toContain('proficient');
  });

  it('visually distinguishes learning skills from the rest', async () => {
    const el = await render(GROUP);
    const items = Array.from(el.querySelectorAll('li'));
    const learning = items.find((li) => li.textContent?.includes('AWS'));
    const settled = items.find((li) => li.textContent?.includes('IIS'));
    expect(learning?.className).toContain('border-learning');
    expect(settled?.className).not.toContain('border-learning');
  });

  it('labels the level for screen readers', async () => {
    const el = await render(GROUP);
    expect(el.querySelector('.sr-only')?.textContent).toContain('level:');
  });
});
