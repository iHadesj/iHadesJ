// Shape-aware glyph picking: every glyph is described by how its ink fills a
// 2×3 grid over the cell (measured from the embedded font by
// scripts/glyph-shapes.py). A cell picks the glyph whose ink layout is
// closest to its own light layout, so edges get drawn with / \ ( ) _ etc.

import { readFileSync } from 'node:fs';
import { clamp } from './sdf.mjs';

const TABLE = JSON.parse(readFileSync(new URL('./glyphs.json', import.meta.url), 'utf8'));

// symbols plus a few round letters: whole words of letters read as text
export const SYMBOLS = " .,:;'`\"^~-_=+*<>!|/\\()[]{}ilcrvxzsoO0#%&@$";
const MAX_INK = Math.max(...Object.values(TABLE).flat());

export function glyphSet(chars = SYMBOLS) {
  return Object.entries(TABLE).filter(([ch]) => chars.includes(ch));
}

/**
 * shape: 6 values in 0..1 (top-left, top-right, mid-left, mid-right,
 * bottom-left, bottom-right). `sharpen` > 1 exaggerates differences inside
 * the cell so edges snap to edge glyphs.
 */
export function matchGlyph(shape, set, { sharpen = 1.6 } = {}) {
  const peak = Math.max(...shape);
  if (peak < 0.04) return ' ';
  const v = shape.map((x) => clamp(peak * Math.pow(x / peak, sharpen)) * MAX_INK);
  let best = ' ';
  let bestD = Infinity;
  for (const [ch, g] of set) {
    let d = 0;
    for (let k = 0; k < 6; k++) d += (v[k] - g[k]) ** 2;
    if (d < bestD) { bestD = d; best = ch; }
  }
  return best;
}
