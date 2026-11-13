import { TestBed } from '@angular/core/testing';
import type { Project } from '../../content/models';
import { ProjectCard } from './project-card';

const INTERNAL_PROJECT: Project = {
  slug: 'internal-system',
  title: 'Visitor Management System',
  period: 'Panasonic · 2022–2026',
  summary: 'Site access records for a working plant.',
  bullets: ['Handles 100+ daily visitors.', 'Records check-in and check-out.'],
  tags: ['C#', 'SQL Server'],
  domain: 'dotnet',
};

describe('ProjectCard', () => {
  async function render(project: Project) {
    const fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('project', project);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders title, period, summary and every bullet', async () => {
    const el = await render(INTERNAL_PROJECT);
    expect(el.querySelector('h3')?.textContent).toContain('Visitor Management System');
    expect(el.textContent).toContain('Panasonic · 2022–2026');
    expect(el.textContent).toContain('Site access records for a working plant.');
    expect(el.querySelectorAll('li').length).toBeGreaterThanOrEqual(2);
    expect(el.textContent).toContain('Handles 100+ daily visitors.');
  });

  it('shows no links for a project without URLs — never a dead button', async () => {
    const el = await render(INTERNAL_PROJECT);
    expect(el.querySelectorAll('a').length).toBe(0);
  });

  it('shows a repository link when one exists, marked external', async () => {
    const el = await render({
      ...INTERNAL_PROJECT,
      slug: 'portfolio-site-aws',
      repoUrl: 'https://github.com/mdaizal/aizal-portfolio',
    });
    const links = el.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('https://github.com/mdaizal/aizal-portfolio');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
  });
});
