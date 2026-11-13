import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Apply an explicitly chosen theme before Angular boots, so a user whose choice
 * differs from their OS preference sees no flash of the wrong theme.
 *
 * This runs here rather than in an inline <script> in index.html because the
 * CloudFront CSP sets `script-src 'self'`, which would block an inline script.
 * With no stored choice the CSS `light-dark()` tokens already follow the OS.
 */
try {
  const stored = localStorage.getItem('aizal.theme');
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.dataset['theme'] = stored;
  }
} catch {
  // Storage unavailable (private mode) — fall back to the OS preference.
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
