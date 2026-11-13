import { TestBed } from '@angular/core/testing';
import { TagChip } from './tag-chip';

describe('TagChip', () => {
  it('renders the label in a span, leaving list semantics to the parent', async () => {
    const fixture = TestBed.createComponent(TagChip);
    fixture.componentRef.setInput('label', 'CloudFront');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const span = el.querySelector('span');
    expect(span?.textContent?.trim()).toBe('CloudFront');
  });
});
