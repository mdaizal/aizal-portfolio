import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/** Per-route metadata handed to {@link SeoService.apply}. */
export interface SeoMetadata {
  title: string;
  description: string;
  /** When true, emits `<meta name="robots" content="noindex">`. */
  noindex?: boolean;
}

/**
 * Per-route SEO metadata (TRD §7, NFR-5).
 *
 * Uses Angular's `Title` and `Meta` services rather than touching `document`, so
 * the values are set during prerender and serialised into each route's HTML —
 * and stay in sync when the router navigates client-side.
 *
 * No canonical URL or `og:url` is set here: the site origin does not exist until
 * the CloudFront distribution is created in Phase 6. Inventing one would be a
 * false claim.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  apply({ title, description, noindex = false }: SeoMetadata): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });

    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      // A client-side navigation away from /404/ must not inherit its noindex.
      this.meta.removeTag('name="robots"');
    }
  }
}
