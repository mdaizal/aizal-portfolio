import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'aizal.theme';

/**
 * Theme state (TRD §6.1).
 *
 * The effective theme is resolved *before first paint* by the inline script in
 * index.html, which sets `data-theme` on <html> from localStorage or the OS
 * preference. This service reads that value rather than re-deriving it, so the
 * server-prerendered markup and the client agree and there is no flash.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly current = signal<Theme>(readInitialTheme());

  readonly theme = this.current.asReadonly();

  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.current.set(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset['theme'] = theme;
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing or storage disabled — the in-memory signal still works.
    }
  }
}

function readInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.dataset['theme'];
    if (attr === 'light' || attr === 'dark') {
      return attr;
    }
  }
  // No explicit choice stored: the CSS `light-dark()` tokens are already following
  // the OS preference, so report the same thing the user is actually seeing.
  if (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}
