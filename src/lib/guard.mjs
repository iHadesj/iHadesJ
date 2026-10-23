// Every glyph the panels draw must exist in the embedded font subset,
// otherwise the browser quietly swaps in a system font and the grid breaks.

import { readFileSync } from 'node:fs';

const CHARSET = new Set(readFileSync(new URL('../fonts/charset.txt', import.meta.url), 'utf8'));
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Every character an SVG draws as text (not titles, styles or markup). */
export function drawnText(svg) {
  const body = svg
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/<(title|desc)[^>]*>[\s\S]*?<\/\1>/g, '');
  return [...body.matchAll(/>([^<>]+)</g)].map(([, t]) => decode(t)).join('').replace(/\n/g, '');
}

/** Characters drawn as text in `svg` that the embedded font cannot render. */
export function missingGlyphs(svg) {
  return [...new Set([...drawnText(svg)].filter((ch) => !CHARSET.has(ch)))];
}
