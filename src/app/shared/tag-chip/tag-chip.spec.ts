import { TestBed } from '@angular/core/testing';
import { TagChip } from './tag-chip';

describe('TagChip', () => {
  it('renders the label inside an li so the parent list carries the semantics', async () => {
    const fixture = TestBed.createComponent(TagChip);
    fixture.componentRef.setInput('label', 'CloudFront');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const li = el.querySelector('li');
    expect(li?.textContent?.trim()).toBe('CloudFront');
  });
});
