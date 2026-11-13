import type { Profile } from '../content/models';

/**
 * Contact address assembly (TRD §14, PRD FR-7.1).
 *
 * The address is stored split (`emailUser` + `emailDomain`) and joined at render
 * time, so the contiguous string never appears in the source or the built bundle.
 * A naive `[\w.]+@[\w.]+` scrape over the page will not match.
 *
 * This is friction, NOT a security control: the résumé PDF is public and contains
 * the same address. Do not describe it to users as protection.
 */
const AT = String.fromCharCode(64);

export function emailAddress(profile: Pick<Profile, 'emailUser' | 'emailDomain'>): string {
  return `${profile.emailUser}${AT}${profile.emailDomain}`;
}

export function mailtoHref(profile: Pick<Profile, 'emailUser' | 'emailDomain'>): string {
  return `mailto:${emailAddress(profile)}`;
}
