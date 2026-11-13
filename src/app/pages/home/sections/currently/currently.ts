import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE } from '../../../../content/profile';
import { SectionHeading } from '../../../../shared/section-heading/section-heading';

/**
 * "Currently" (PRD §6.2, FR-2.1/FR-2.2).
 * Exactly three honest status items — the content gate fails the build if the
 * count changes. No progress bars or invented completion dates.
 */
@Component({
  selector: 'app-currently',
  imports: [SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="currently" aria-labelledby="currently-heading" class="border-b border-border bg-surface">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <app-section-heading
          title="Currently"
          headingId="currently-heading"
          eyebrow="Right now"
        />

        <ol class="grid gap-4 sm:grid-cols-3">
          @for (item of profile.currently; track item; let index = $index) {
            <li class="rounded-lg border border-border bg-canvas p-5">
              <span aria-hidden="true" class="font-mono text-xs font-semibold text-ink-muted">
                0{{ index + 1 }}
              </span>
              <p class="mt-2 text-sm text-ink">{{ item }}</p>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
})
export class Currently {
  protected readonly profile = PROFILE;
}
