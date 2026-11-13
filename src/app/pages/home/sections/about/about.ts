import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ABOUT_PARAGRAPHS, HOW_THIS_SITE_IS_BUILT } from '../../../../content/about';
import { EDUCATION } from '../../../../content/experience';
import { PROFILE } from '../../../../content/profile';
import { SectionHeading } from '../../../../shared/section-heading/section-heading';

/**
 * About (PRD §6.3): the narrative, education, and "How this site is built".
 * The site explains its own architecture here — it is part of the AWS evidence
 * (PRD G2), not decoration.
 */
@Component({
  selector: 'app-about',
  imports: [SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="about" aria-labelledby="about-heading" class="border-b border-border">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <app-section-heading title="About" headingId="about-heading" />

        <div class="grid gap-12 lg:grid-cols-3">
          <div class="space-y-4 text-ink-muted lg:col-span-2">
            @for (paragraph of paragraphs; track paragraph) {
              <p>{{ paragraph }}</p>
            }
          </div>

          <div class="space-y-8">
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">Education</h3>
              <p class="mt-3 text-ink">{{ education.degree }}</p>
              <p class="text-sm text-ink-muted">
                {{ education.institution }} &middot; {{ education.year }}
              </p>
            </div>

            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                How this site is built
              </h3>
              <ul class="mt-3 space-y-2 text-sm text-ink-muted">
                @for (line of howBuilt; track line) {
                  <li class="flex gap-2">
                    <span aria-hidden="true" class="text-accent">&ndash;</span>
                    <span>{{ line }}</span>
                  </li>
                }
              </ul>
              <p class="mt-3 text-sm">
                <a
                  [href]="profile.github + '/aizal-portfolio'"
                  [attr.target]="'_blank'"
                  rel="noopener noreferrer"
                  class="text-accent underline underline-offset-4"
                >
                  Source on GitHub<span class="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class About {
  protected readonly profile = PROFILE;
  protected readonly paragraphs = ABOUT_PARAGRAPHS;
  protected readonly howBuilt = HOW_THIS_SITE_IS_BUILT;
  protected readonly education = EDUCATION;
}
