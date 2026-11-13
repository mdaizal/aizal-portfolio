import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { PROFILE } from '../../../../content/profile';
import { emailAddress, mailtoHref } from '../../../../core/obfuscate';
import { SectionHeading } from '../../../../shared/section-heading/section-heading';

/**
 * Contact (PRD §6.7, FR-7.1 … FR-7.6).
 * No phone number anywhere (TRD A11), and no form — a non-functional form reads
 * as broken, so v1 offers `mailto:` plus social links instead.
 */
@Component({
  selector: 'app-contact',
  imports: [SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" aria-labelledby="contact-heading">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <app-section-heading
          title="Contact"
          headingId="contact-heading"
          eyebrow="Get in touch"
          [lead]="profile.availability + ' — ' + profile.openTo"
        />

        <div class="grid gap-8 sm:grid-cols-2">
          <div class="rounded-lg border border-border bg-surface p-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">Email</h3>
            <p class="mt-3">
              <a [href]="mailto()" class="text-lg font-semibold text-accent underline underline-offset-4">
                {{ email() }}
              </a>
            </p>
            <p class="mt-3 text-sm text-ink-muted">{{ profile.responseExpectation }}</p>
          </div>

          <div class="rounded-lg border border-border bg-surface p-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">Elsewhere</h3>
            <ul class="mt-3 space-y-2">
              <li>
                <a
                  [href]="profile.github"
                  [attr.target]="'_blank'"
                  rel="noopener noreferrer"
                  class="text-accent underline underline-offset-4"
                >
                  GitHub<span class="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  [href]="profile.linkedin"
                  [attr.target]="'_blank'"
                  rel="noopener noreferrer"
                  class="text-accent underline underline-offset-4"
                >
                  LinkedIn<span class="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              @if (profile.resumeUrl; as resume) {
                <li>
                  <a [href]="resume" download class="text-accent underline underline-offset-4">
                    Résumé<span class="sr-only"> (PDF download)</span>
                  </a>
                </li>
              }
            </ul>
            <p class="mt-4 text-sm text-ink-muted">
              Based in {{ profile.location }} (UTC+8).
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Contact {
  protected readonly profile = PROFILE;
  protected readonly email = computed(() => emailAddress(PROFILE));
  protected readonly mailto = computed(() => mailtoHref(PROFILE));
}
