import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE } from '../../../../content/profile';
import { Monogram } from '../../../../layout/monogram/monogram';
import { ButtonLink } from '../../../../shared/button-link/button-link';

/**
 * Hero (PRD §6.1, FR-1.1 … FR-1.6).
 * Carries the page's only `<h1>`, and the availability line, which the PRD treats
 * as the single most important piece of information on the page.
 */
@Component({
  selector: 'app-hero',
  imports: [Monogram, ButtonLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="top" aria-labelledby="hero-heading" class="border-b border-border">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div class="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div class="max-w-3xl">
            <p
              class="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-available"
            >
              <span aria-hidden="true" class="h-2 w-2 rounded-full bg-available"></span>
              {{ profile.availability }}
            </p>

            <h1
              id="hero-heading"
              class="mt-5 text-4xl font-bold tracking-tight text-ink sm:text-5xl"
            >
              {{ profile.fullName }}
            </h1>
            <p class="mt-3 text-xl font-semibold text-ink">{{ profile.role }}</p>
            <p class="mt-1 text-base text-ink-muted">{{ profile.subtitle }}</p>

            <p class="mt-6 max-w-2xl text-lg text-ink-muted">{{ profile.pitch }}</p>

            <p class="mt-6 text-sm text-ink-muted">
              {{ profile.location }} &middot; {{ profile.yearsNet }} &middot;
              {{ profile.yearsTotal }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <app-button-link href="#projects" label="View projects" />
              @if (profile.resumeUrl; as resume) {
                <app-button-link
                  [href]="resume"
                  label="Download résumé"
                  variant="secondary"
                  [download]="true"
                />
              }
            </div>
          </div>

          <app-monogram [name]="profile.fullName" />
        </div>
      </div>
    </section>
  `,
})
export class Hero {
  protected readonly profile = PROFILE;
}
