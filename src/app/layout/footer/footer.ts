import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { PROFILE } from '../../content/profile';
import { emailAddress, mailtoHref } from '../../core/obfuscate';

/**
 * Footer. Repeats the contact affordances so they are reachable from the bottom
 * of a long single page (PRD G4), and states plainly how the site is built.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-border bg-surface">
      <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-sm font-semibold text-ink">{{ profile.fullName }}</p>
            <p class="mt-1 text-sm text-ink-muted">
              {{ profile.role }} · {{ profile.location }}
            </p>
            <p class="mt-3 text-sm">
              <a [href]="mailto()" class="text-accent underline underline-offset-4">
                {{ email() }}
              </a>
            </p>
          </div>

          <nav aria-label="Elsewhere" class="text-sm">
            <ul class="flex flex-col gap-2">
              <li>
                <a
                  [href]="profile.github"
                  [attr.target]="'_blank'"
                  rel="noopener noreferrer"
                  class="text-ink-muted hover:text-ink"
                >
                  GitHub<span class="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  [href]="profile.linkedin"
                  [attr.target]="'_blank'"
                  rel="noopener noreferrer"
                  class="text-ink-muted hover:text-ink"
                >
                  LinkedIn<span class="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              @if (profile.resumeUrl; as resume) {
                <li>
                  <a [href]="resume" download class="text-ink-muted hover:text-ink">
                    Résumé<span class="sr-only"> (PDF download)</span>
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>

        <p class="mt-8 border-t border-border pt-6 text-xs text-ink-muted">
          Angular 22, prerendered at build time, served from a private S3 bucket behind CloudFront with
          least-privilege, keyless CI.
        </p>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly profile = PROFILE;

  protected readonly email = computed(() => emailAddress(PROFILE));
  protected readonly mailto = computed(() => mailtoHref(PROFILE));
}
