import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Project } from '../../content/models';
import { ButtonLink } from '../button-link/button-link';
import { TagChip } from '../tag-chip/tag-chip';

/**
 * A project card (PRD §6.6).
 * Content-driven only — nothing about a project is hardcoded here (PRD FR-6.1).
 * Links render only when a URL exists, so there is never a dead button (FR-6.6).
 */
@Component({
  selector: 'app-project-card',
  imports: [TagChip, ButtonLink],
  templateUrl: './project-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
