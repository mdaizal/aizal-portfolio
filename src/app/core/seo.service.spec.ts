import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

/**
 * SEO service (TRD §7, NFR-5).
 *
 * The service must go through Angular's `Title` / `Meta` services so the values
 * are serialised into each prerendered route; the assertions below read the same
 * services rather than `document` so they hold under prerender and in the SPA.
 */
describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);

    meta.removeTag('name="description"');
    meta.removeTag('name="robots"');
    meta.removeTag('property="og:title"');
    meta.removeTag('property="og:description"');
  });

  it('sets the document title', () => {
    service.apply({ title: 'A title', description: 'A description' });
    expect(title.getTitle()).toBe('A title');
  });

  it('sets description, og:title and og:description', () => {
    service.apply({ title: 'A title', description: 'A description' });
    expect(meta.getTag('name="description"')?.content).toBe('A description');
    expect(meta.getTag('property="og:title"')?.content).toBe('A title');
    expect(meta.getTag('property="og:description"')?.content).toBe('A description');
  });

  it('does not add a robots meta by default', () => {
    service.apply({ title: 'A title', description: 'A description' });
    expect(meta.getTag('name="robots"')).toBeNull();
  });

  it('adds robots noindex only when requested', () => {
    service.apply({ title: 'A title', description: 'A description', noindex: true });
    expect(meta.getTag('name="robots"')?.content).toBe('noindex');
  });

  it('clears a previously applied noindex on a later indexable page', () => {
    service.apply({ title: 'A title', description: 'A description', noindex: true });
    service.apply({ title: 'Another title', description: 'Another description' });
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
