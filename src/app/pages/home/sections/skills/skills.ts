import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CERTS } from '../../../../content/certs';
import { SKILL_GROUPS } from '../../../../content/skills';
import { SectionHeading } from '../../../../shared/section-heading/section-heading';
import { SkillGroupComponent } from '../../../../shared/skill-group/skill-group';

/**
 * Skills (PRD §6.5) plus certifications.
 * Every skill carries an ordinal label, and `learning` items are visually distinct
 * so the AWS/Go gap reads as deliberate progress rather than padding.
 */
@Component({
  selector: 'app-skills',
  imports: [SectionHeading, SkillGroupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="skills" aria-labelledby="skills-heading" class="border-b border-border">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <app-section-heading
          title="Skills"
          headingId="skills-heading"
          lead="Labelled honestly rather than inflated. Items marked learning are exactly that."
        />

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          @for (group of skillGroups; track group.category) {
            <app-skill-group [group]="group" />
          }
        </div>

        <div class="mt-12">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Certifications
          </h3>
          <ul class="mt-4 space-y-3">
            @for (cert of certs; track cert.name) {
              <li class="rounded-lg border border-border bg-surface p-5">
                <p class="text-sm font-semibold text-ink">
                  @if (cert.url; as url) {
                    <a
                      [href]="url"
                      [attr.target]="'_blank'"
                      rel="noopener noreferrer"
                      class="text-accent underline underline-offset-4"
                    >
                      {{ cert.name }}<span class="sr-only"> (opens in a new tab)</span>
                    </a>
                  } @else {
                    {{ cert.name }}
                  }
                </p>
                <p class="mt-1 text-sm text-ink-muted">
                  {{ cert.issuer }} &middot; <span class="text-learning">{{ cert.status }}</span>
                  @if (cert.target; as target) {
                    <span>, target {{ target }}</span>
                  }
                </p>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class Skills {
  protected readonly skillGroups = SKILL_GROUPS;
  protected readonly certs = CERTS;
}
