import { defineConfig } from 'vitest/config';

/**
 * Vitest base configuration for the Angular unit-test builder (TRD §10).
 *
 * The builder has no per-glob threshold option, so the ≥80% lines requirement
 * for `content/` and `core/` is expressed here as Vitest coverage thresholds and
 * loaded through the `runnerConfig` option in `angular.json`. The builder merges
 * these thresholds into the coverage options it hands to Vitest, so an unmet
 * threshold fails `npm run test:ci` — and therefore `npm run build:prod`.
 *
 * `reportsDirectory` sits under `/coverage`, which `.gitignore` already ignores.
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage/portfolio',
      thresholds: {
        'src/app/content/**': { lines: 80 },
        'src/app/core/**': { lines: 80 },
      },
    },
  },
});
