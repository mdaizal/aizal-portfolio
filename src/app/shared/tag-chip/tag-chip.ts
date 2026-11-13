import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A single technology tag.
 *
 * Renders a `<span>`, not an `<li>`: Angular inserts this component's host element
 * between a parent `<ul>` and its content, so an `<li>` here would sit at
 * `ul > app-tag-chip > li` and break list semantics. Every parent tag container
 * emits the `<li>` itself and wraps this component in it.
 */
@Component({
  selector: 'app-tag-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink-muted"
    >
      {{ label() }}
    </span>
  `,
})
export class TagChip {
  readonly label = input.required<string>();
}
