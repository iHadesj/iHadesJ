// Helpers for the hand-built SVG panels.
// GitHub shows README images through <img>: no scripts, no external files,
// no links inside the SVG. Text uses the viewer's own Helvetica/Arial, so
// nothing is embedded and every panel stays a few KB.

export const FONT = `'Helvetica Neue',Helvetica,Arial,'Liberation Sans',sans-serif`;

export const MONO = `ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace`;

// night pond: deep water, paper-white type, koi red
export const C = {
  bg: '#0b1215',
  card: '#101a1e',
  line: '#22323a',
  fg: '#eee8dc',
  gray: '#8e979b',
  red: '#ec5233',
  white: '#fbf7ef',
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// numbers in SVG output: short, stable, no "-0"
export const n = (x, digits = 2) => {
  const v = Number(x.toFixed(digits));
  return Object.is(v, -0) ? '0' : String(v);
};

// ── text measuring ──────────────────────────────────────────────────────────
// Advance widths (per 1000 em) of Arial / Arial Bold. Helvetica and Liberation
// Sans share these metrics, so layout holds on Mac, Windows and Linux alike.
const table = (lower, upper, extra) => {
  const w = {};
  [...'abcdefghijklmnopqrstuvwxyz'].forEach((ch, i) => (w[ch] = lower[i]));
  [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].forEach((ch, i) => (w[ch] = upper[i]));
  for (const d of '0123456789') w[d] = 556;
  return Object.assign(w, extra);
};
const REG = table(
  [556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500],
  [667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611],
  { ' ': 278, '.': 278, ',': 278, '-': 333, '/': 278, _: 556, '(': 333, ')': 333, '+': 584, '·': 278, '→': 1000, '—': 1000, '–': 556, '&': 667, ':': 278, '?': 556, "'": 191, '!': 278, '%': 889, '#': 556, '@': 1015 },
);
const BOLD = table(
  [556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500],
  [722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611],
  { ' ': 278, '.': 278, ',': 278, '-': 333, '/': 278, _: 556, '(': 333, ')': 333, '+': 584, '·': 278, '→': 1000, '—': 1000, '–': 556, '&': 722, ':': 333, '?': 611, "'": 238, '!': 333, '%': 889, '#': 556, '@': 975 },
);

/** Width in px of `text` at `size`, with optional letter-spacing (px). */
export function measure(text, size, { bold = false, spacing = 0 } = {}) {
  const t = bold ? BOLD : REG;
  let em = 0;
  for (const ch of String(text)) em += t[ch] ?? t[ch.normalize('NFD')[0]] ?? 556;
  return (em / 1000) * size + spacing * [...String(text)].length;
}

/** Greedy word wrap to `width` px. */
export function wrap(text, width, size, opts) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size, opts) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest size (≤ max) at which `text` fits in `width`. */
export const fit = (text, width, max, opts) => Math.min(max, Math.floor((max * width) / measure(text, max, opts)));

// ── elements ────────────────────────────────────────────────────────────────
const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? n(v) : esc(v)}"`)
    .join('');

/**
 * <text>. Options: size, bold, fill, anchor ('end'|'middle'), spacing
 * (letter-spacing px), cls, plus any raw SVG attribute in `extra`.
 */
export function text(x, y, content, { size = 16, bold = false, fill, anchor, spacing, cls, extra = {} } = {}) {
  return `<text${attrs({
    x,
    y,
    'font-size': size,
    'font-weight': bold ? 700 : undefined,
    fill,
    'text-anchor': anchor,
    'letter-spacing': spacing,
    class: cls,
    ...extra,
  })}>${esc(content)}</text>`;
}

export const rect = (x, y, w, h, fill, extra = {}) => `<rect${attrs({ x, y, width: w, height: h, fill, ...extra })}/>`;

/** Horizontal rule. */
export const rule = (x, y, w, weight = 2, fill = C.fg) => rect(x, y, w, weight, fill);

/** Small uppercase label, the "caption" voice of the whole profile. */
export const label = (x, y, content, opts = {}) =>
  text(x, y, String(content).toUpperCase(), { size: 13, bold: true, spacing: 1.4, fill: C.fg, ...opts });

/**
 * Character-grid text: `cells` maps "row,col" → [char, color]. Emits one
 * <text> per run of same-colored cells on a row (short gaps are filled with
 * spaces), each pinned with textLength so any monospace font lines up.
 */
export function gridText(cells, { x0 = 0, y0 = 0, cw, lh, cls = (c) => c, gap = 6 }) {
  const rows = new Map();
  for (const [key, [ch, color]] of cells) {
    const [r, c] = key.split(',').map(Number);
    const k = `${r}|${color}`;
    if (!rows.has(k)) rows.set(k, []);
    rows.get(k).push([c, ch]);
  }
  const out = [];
  for (const [k, items] of rows) {
    const [r, color] = k.split('|');
    items.sort((a, b) => a[0] - b[0]);
    let run = [items[0]];
    const flush = () => {
      const start = run[0][0];
      const line = Array(run.at(-1)[0] - start + 1).fill(' ');
      for (const [c, ch] of run) line[c - start] = ch;
      const len = line.length > 1 ? ` textLength="${n(line.length * cw)}"` : '';
      out.push(`<text x="${n(x0 + start * cw)}" y="${n(y0 + (Number(r) + 0.8) * lh)}" class="${cls(color)}"${len}>${esc(line.join(''))}</text>`);
    };
    for (const it of items.slice(1)) {
      if (it[0] - run.at(-1)[0] <= gap) run.push(it);
      else {
        flush();
        run = [it];
      }
    }
    flush();
  }
  return out.join('');
}

/** Section head: number in red, name, full-width rule underneath. */
export function sectionHead(x, y, w, num, name, aside) {
  return [
    rule(x, y, w, 3),
    label(x, y + 24, num, { fill: C.red }),
    label(x + 34, y + 24, name),
    aside && label(x + w, y + 24, aside, { anchor: 'end', fill: C.gray }),
  ].filter(Boolean).join('');
}

export function svgDoc({ width, height, title, desc, style = '', body, bg = C.bg }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="t d">`,
    `<title id="t">${esc(title)}</title>`,
    `<desc id="d">${esc(desc)}</desc>`,
    `<style>text{font-family:${FONT}}${style}</style>`,
    rect(0, 0, width, height, bg),
    body,
    '</svg>',
  ].join('\n');
}
