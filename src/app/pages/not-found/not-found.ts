import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo.service';
import { ButtonLink } from '../../shared/button-link/button-link';

/**
 * Not found (PRD §6.8) — prerendered to /404/index.html and wired to CloudFront
 * custom error responses for origin 403 and 404. Must return HTTP 404, never 200.
 *
 * No `<main>` here: the app shell already provides `<main id="main">`.
 * Metadata, including `noindex`, is applied by the SEO service.
 */
@Component({
  selector: 'app-not-found',
  imports: [ButtonLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p class="font-mono text-sm font-semibold text-ink-muted">404</p>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-ink">Page not found</h1>
      <p class="mt-4 text-ink-muted">
        That page does not exist. It may have been moved, or the link that brought you here may be
        out of date.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <app-button-link href="/" label="Go to the homepage" />
        <app-button-link href="/#projects" label="See projects" variant="secondary" />
      </div>
    </section>
  `,
})
export class NotFound {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'Page not found — Mohd Aizal Baharuddin',
      description: 'That page does not exist.',
      noindex: true,
    });
  }
}
