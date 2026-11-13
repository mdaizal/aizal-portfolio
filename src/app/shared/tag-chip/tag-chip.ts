import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A single technology tag.
 *
 * Renders an `<li>` so the surrounding list carries the semantics — every usage
 * must therefore sit inside a `<ul>`. Keeping the list on the parent means screen
 * readers announce "list, N items" once rather than per tag.
 */
@Component({
  selector: 'app-tag-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li
      class="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink-muted"
    >
      {{ label() }}
    </li>
  `,
})
export class TagChip {
  readonly label = input.required<string>();
}
