// Every glyph the panels draw must exist in the embedded font subset,
// otherwise the browser quietly swaps in a system font and the grid breaks.

import { readFileSync } from 'node:fs';

const CHARSET = new Set(readFileSync(new URL('../fonts/charset.txt', import.meta.url), 'utf8'));
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Characters drawn as text in `svg` that the embedded font cannot render. */
export function missingGlyphs(svg) {
  const drawn = svg
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/<(title|desc)[^>]*>[\s\S]*?<\/\1>/g, '');
  const missing = new Set();
  for (const [, text] of drawn.matchAll(/>([^<>]+)</g)) {
    for (const ch of decode(text)) if (ch !== '\n' && !CHARSET.has(ch)) missing.add(ch);
  }
  return [...missing];
}
