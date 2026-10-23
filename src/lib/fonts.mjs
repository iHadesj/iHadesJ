// Per-file font subsetting. Panels embed placeholders (see fontFaces in
// svg.mjs); the build swaps each one for a subset holding only the glyphs
// that file draws, so a small button doesn't carry the whole font.
//
// Uses fontTools (pip install fonttools brotli). Without it the build still
// works and falls back to the committed subsets, just with bigger files.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drawnText } from './guard.mjs';

const FILES = { 400: 'JetBrainsMono-Regular.subset.woff2', 700: 'JetBrainsMono-Bold.subset.woff2' };
const source = (weight) => fileURLToPath(new URL(`../fonts/${FILES[weight]}`, import.meta.url));

let fonttools;
function hasFonttools() {
  if (fonttools === undefined) {
    try {
      execFileSync('python3', ['-c', 'import fontTools, brotli'], { stdio: 'ignore' });
      fonttools = true;
    } catch {
      fonttools = false;
      console.warn('! fonttools not found: embedding full font subsets (pip install fonttools brotli)');
    }
  }
  return fonttools;
}

function subset(weight, chars) {
  if (!hasFonttools()) return readFileSync(source(weight));
  const dir = mkdtempSync(join(tmpdir(), 'jbm-'));
  const out = join(dir, 'f.woff2');
  try {
    execFileSync('python3', ['-m', 'fontTools.subset', source(weight), `--text=${chars}`, '--flavor=woff2',
      '--layout-features=', '--no-hinting', '--desubroutinize', `--output-file=${out}`], { stdio: 'ignore' });
    return readFileSync(out);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Replace every __JBM<weight>__ placeholder with a subset of what `svg` draws. */
export function embedFonts(svg) {
  const chars = [...new Set(drawnText(svg) + ' ')].join('');
  return svg.replace(/__JBM(400|700)__/g, (_, weight) => subset(weight, chars).toString('base64'));
}
