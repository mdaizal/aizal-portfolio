import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROJECTS } from '../../../../content/projects';
import { ProjectCard } from '../../../../shared/project-card/project-card';
import { SectionHeading } from '../../../../shared/section-heading/section-heading';

/**
 * Projects (PRD §6.6, FR-6.1 … FR-6.7).
 * Seven cards from content only. The first is this site itself — the primary,
 * verifiable AWS evidence; the five internal systems carry no links because they
 * are proprietary, and a dead button is worse than none.
 */
@Component({
  selector: 'app-projects',
  imports: [SectionHeading, ProjectCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="projects" aria-labelledby="projects-heading" class="border-b border-border bg-surface">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <app-section-heading
          title="Projects"
          headingId="projects-heading"
          eyebrow="Selected work"
          lead="Production systems I built and supported at Panasonic, the AWS work I am doing now, and this site itself."
        />

        <div class="grid gap-6 lg:grid-cols-2">
          @for (project of projects; track project.slug) {
            <app-project-card [project]="project" />
          }
        </div>
      </div>
    </section>
  `,
})
export class Projects {
  protected readonly projects = PROJECTS;
}
