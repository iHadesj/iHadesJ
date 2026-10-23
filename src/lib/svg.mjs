// Tiny helpers for hand-built, animated SVGs.
// GitHub renders README images through <img>, so: no scripts, no external
// resources. Everything (fonts included) has to live inside the file.

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @font-face rules for JetBrains Mono. The data is a placeholder: the build
 * (lib/fonts.mjs) fills in a subset with just the glyphs each file uses.
 */
export function fontFaces({ bold = false } = {}) {
  const face = (weight) =>
    `@font-face{font-family:'JBM';font-weight:${weight};src:url(data:font/woff2;base64,__JBM${weight}__) format('woff2')}`;
  return [face(400), bold && face(700)].filter(Boolean).join('');
}

// numbers in SVG output: short, stable, no "-0"
export const n = (x, digits = 2) => {
  const v = Number(x.toFixed(digits));
  return Object.is(v, -0) ? '0' : String(v);
};

/**
 * One <text> per row of a character grid; leading spaces become an x offset.
 * textLength pins every row to the grid even if a viewer ends up with a
 * fallback font whose advance isn't exactly 0.6em.
 */
export function textRows(rows, { x = 0, y = 0, cellW, cellH, baseline = 0.8, attrs = '' }) {
  return rows
    .map((row, r) => {
      const chars = [...row.replace(/\s+$/, '')];
      const lead = chars.findIndex((ch) => ch !== ' ');
      if (lead < 0) return '';
      const text = chars.slice(lead);
      return `<text x="${n(x + lead * cellW)}" y="${n(y + (r + baseline) * cellH)}" textLength="${n(text.length * cellW)}"${attrs}>${esc(text.join(''))}</text>`;
    })
    .filter(Boolean)
    .join('');
}

/** Many rectangles packed into a single path (cheap to draw and to animate). */
export function rectsPath(rects) {
  return rects.map(({ x, y, w, h }) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`).join('');
}

/** Closed polygon(s) as a path. */
export function polyPath(points) {
  return `M${points.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;
}

export function svgDoc({ width, height, title, desc, style = '', defs = '', body }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="t d" xml:space="preserve">`,
    `<title id="t">${esc(title)}</title>`,
    `<desc id="d">${esc(desc)}</desc>`,
    `<style>${style}</style>`,
    defs && `<defs>${defs}</defs>`,
    body,
    '</svg>',
  ]
    .filter(Boolean)
    .join('\n');
}
