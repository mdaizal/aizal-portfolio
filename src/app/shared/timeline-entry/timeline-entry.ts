import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ExperienceEntry } from '../../content/models';
import { TagChip } from '../tag-chip/tag-chip';

/**
 * One entry on the experience timeline (PRD §6.4).
 * The date range is rendered for every entry — together they are the evidence for
 * both "5+ years of .NET" and "19 years of professional experience", so it must
 * never be dropped for compactness (PRD FR-4.2).
 */
@Component({
  selector: 'app-timeline-entry',
  imports: [TagChip],
  templateUrl: './timeline-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineEntry {
  readonly entry = input.required<ExperienceEntry>();
  /** Hides the connecting rail on the final entry. */
  readonly last = input(false);
}
