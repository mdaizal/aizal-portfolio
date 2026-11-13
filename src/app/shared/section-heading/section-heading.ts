import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Section heading (PRD §7: each section opens with an <h2>, exactly one <h1>).
 * `headingId` lets the parent section reference it via aria-labelledby.
 */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      @if (eyebrow(); as kicker) {
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ kicker }}</p>
      }
      <h2 [id]="headingId()" class="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {{ title() }}
      </h2>
      @if (lead(); as intro) {
        <p class="mt-3 max-w-2xl text-ink-muted">{{ intro }}</p>
      }
    </header>
  `,
})
export class SectionHeading {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>();
  readonly lead = input<string>();
  readonly headingId = input<string>();
}
