import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { SkillGroup } from '../../content/models';

/**
 * One skills category with ordinal proficiency labels (PRD §6.5).
 *
 * Every item shows its label, and `learning` items are visually distinct, so the
 * AWS/Go gap reads as deliberate progress rather than padding. Labels are ordinal
 * words only — never a percentage, star or bar (PRD FR-5.2, enforced by the
 * content validator).
 */
@Component({
  selector: 'app-skill-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">
        {{ group().category }}
      </h3>
      <ul class="mt-3 flex flex-wrap gap-2">
        @for (item of group().items; track item.name) {
          <li
            class="inline-flex items-baseline gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            [class]="
              item.level === 'learning'
                ? 'border-learning text-learning'
                : 'border-border text-ink-muted'
            "
          >
            <span>{{ item.name }}</span>
            <span class="text-[0.65rem] uppercase tracking-wide">
              <span class="sr-only">level: </span>{{ item.level }}
            </span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class SkillGroupComponent {
  readonly group = input.required<SkillGroup>();
}
