import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CAREER_NOTE, EXPERIENCE } from '../../../../content/experience';
import { SectionHeading } from '../../../../shared/section-heading/section-heading';
import { TimelineEntry } from '../../../../shared/timeline-entry/timeline-entry';

/**
 * Experience (PRD §6.4, FR-4.1 … FR-4.5).
 * All six roles render, newest first, each with its date range. Dropping or
 * compressing a period would break the evidence for both "5+ years of .NET" and
 * "19 years of professional experience".
 */
@Component({
  selector: 'app-experience',
  imports: [SectionHeading, TimelineEntry],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="experience" aria-labelledby="experience-heading" class="border-b border-border bg-surface">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <app-section-heading
          title="Experience"
          headingId="experience-heading"
          eyebrow="19 years"
          lead="Six roles across software delivery, IT operations and programme management. The dates are the evidence for the numbers above."
        />

        <ol class="space-y-10">
          @for (entry of experience; track entry.period + entry.role; let last = $last) {
            <li>
              <app-timeline-entry [entry]="entry" [last]="last" />
            </li>
          }
        </ol>

        <p class="mt-10 max-w-3xl rounded-lg border border-border bg-canvas p-5 text-sm text-ink-muted">
          {{ careerNote }}
        </p>
      </div>
    </section>
  `,
})
export class Experience {
  protected readonly experience = EXPERIENCE;
  protected readonly careerNote = CAREER_NOTE;
}
