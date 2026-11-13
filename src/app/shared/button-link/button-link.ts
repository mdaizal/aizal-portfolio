import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * A link styled as a button.
 *
 * External links get `rel="noopener noreferrer"` plus a screen-reader-only
 * "opens in a new tab" hint (PRD NFR-4) rather than relying on an icon.
 */
@Component({
  selector: 'app-button-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [href]="href()"
      [attr.target]="external() ? '_blank' : null"
      [attr.rel]="external() ? 'noopener noreferrer' : null"
      [attr.download]="download() ? '' : null"
      [class]="classes()"
    >
      {{ label() }}@if (external()) {<span class="sr-only"> (opens in a new tab)</span>}
    </a>
  `,
})
export class ButtonLink {
  readonly href = input.required<string>();
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('primary');
  readonly external = input(false);
  /** Adds `download` so the browser saves the target instead of navigating to it. */
  readonly download = input(false);

  private static readonly BASE =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors';

  private static readonly VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-accent-ink hover:opacity-90',
    secondary: 'border border-border-strong text-ink hover:bg-surface',
    ghost: 'text-accent underline underline-offset-4 hover:no-underline',
  };

  protected readonly classes = computed(
    () => `${ButtonLink.BASE} ${ButtonLink.VARIANTS[this.variant()]}`,
  );
}
