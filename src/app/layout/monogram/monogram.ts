import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Typographic monogram used in place of a headshot (PRD FR-1.6 / FR-3.x).
 * Decorative: the name is always rendered as text elsewhere, so this is hidden
 * from assistive technology rather than announced as duplicate content.
 */
@Component({
  selector: 'app-monogram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      aria-hidden="true"
      class="inline-flex h-20 w-20 shrink-0 select-none items-center justify-center rounded-lg border border-border bg-surface-2 text-2xl font-bold tracking-tight text-ink"
    >
      {{ initials() }}
    </span>
  `,
})
export class Monogram {
  readonly name = input.required<string>();

  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter((part) => /^[A-Za-z]/.test(part))
      .slice(0, 3)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
  );
}
