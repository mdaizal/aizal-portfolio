import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Skip link (PRD NFR-4). First focusable element on the page; off-screen until
 * focused, then jumps to the main landmark. Must work with JavaScript disabled,
 * which is why it is a plain anchor and not a click handler.
 */
@Component({
  selector: 'app-skip-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
    >
      Skip to main content
    </a>
  `,
})
export class SkipLink {}
