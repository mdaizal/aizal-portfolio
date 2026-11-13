#!/usr/bin/env node
/**
 * WCAG contrast gate for the design tokens in src/styles.css (PRD NFR-4).
 *
 * Parses the `:root` (light) and `[data-theme='dark']` blocks, computes the
 * contrast ratio for every foreground/background pair the UI actually uses, and
 * exits non-zero if any pair misses its required ratio. Re-runnable evidence that
 * the palette meets WCAG 2.2 AA, and a regression gate for future edits.
 *
 * Usage: node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, '..', 'src', 'styles.css');
const css = readFileSync(cssPath, 'utf8');

/**
 * Extract `--name: light-dark(#rrggbb, #rrggbb);` declarations from the `:root`
 * block. `light-dark()` resolves from the used `color-scheme`, so the first value
 * is the light-theme token and the second is the dark-theme token.
 * Returns `{ light: {...}, dark: {...} }`.
 */
function readTokens() {
  const match = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!match) throw new Error(`Could not find the :root block in ${cssPath}`);

  const light = {};
  const dark = {};
  const declaration =
    /--([a-z0-9-]+):\s*light-dark\(\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)\s*;/g;

  for (const [, name, lightHex, darkHex] of match[1].matchAll(declaration)) {
    light[name] = lightHex.toLowerCase();
    dark[name] = darkHex.toLowerCase();
  }

  if (Object.keys(light).length === 0) {
    throw new Error(`No light-dark() tokens parsed from ${cssPath} — has the syntax changed?`);
  }
  return { light, dark };
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex) {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255);
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255);
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground, background, minimum ratio, why] */
const PAIRS = [
  ['ink', 'canvas', 4.5, 'body text on the page'],
  ['ink', 'surface', 4.5, 'body text on cards'],
  ['ink-muted', 'canvas', 4.5, 'secondary text on the page'],
  ['ink-muted', 'surface', 4.5, 'secondary text on cards'],
  ['accent', 'canvas', 4.5, 'links on the page'],
  ['accent', 'surface', 4.5, 'links on cards'],
  ['accent-ink', 'accent', 4.5, 'text on accent buttons'],
  ['available', 'canvas', 4.5, 'availability marker'],
  ['learning', 'canvas', 4.5, 'learning skill label'],
  ['learning', 'surface', 4.5, 'learning skill label on cards'],
  ['border-strong', 'canvas', 3.0, 'interactive control boundaries (WCAG 1.4.11)'],
  ['border-strong', 'surface', 3.0, 'control boundaries on cards'],
];

const themes = readTokens();

let failures = 0;
for (const [theme, tokens] of Object.entries(themes)) {
  console.log(`\n${theme.toUpperCase()}`);
  for (const [fg, bg, min, why] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      console.log(`  FAIL  missing token: ${!tokens[fg] ? fg : bg}`);
      failures++;
      continue;
    }
    const ratio = contrast(tokens[fg], tokens[bg]);
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2)}:1  (min ${min})  ${fg} on ${bg} — ${why}`,
    );
  }
}

console.log(failures ? `\n${failures} failing pair(s).` : '\nAll contrast pairs pass WCAG 2.2 AA.');
process.exit(failures ? 1 : 0);
