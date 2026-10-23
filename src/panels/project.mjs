// Panel 4 — one card per project: a small terminal that `cat`s the README.
// Cards are separate images so each one can link to its repository.

import { fontFaces, svgDoc, esc, n } from '../lib/svg.mjs';
import { BASE_CSS, CW, windowFrame, anim, at } from '../lib/term.mjs';
import { Session } from '../lib/script.mjs';

export const CARD_W = 500;
const PAD_X = 22;

/** Greedy word wrap to `width` characters. */
export function wrap(text, width) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const COLS = Math.floor((CARD_W - 2 * PAD_X) / CW);

const CHIP = 11.5; // chip font size
const chipWidth = (tag) => tag.length * CHIP * 0.6 + 12;

/** Lay chips out left to right, wrapping; returns positions and row count. */
function layoutChips(tags) {
  let x = PAD_X;
  let row = 0;
  const placed = tags.map((tag) => {
    const w = chipWidth(tag);
    if (x + w > CARD_W - PAD_X) { x = PAD_X; row++; }
    const chip = { tag, x, row, w };
    x += w + 7;
    return chip;
  });
  return { placed, rows: row + 1 };
}

/** Body lines and chip rows a card needs, so all cards can share one height. */
export const cardMetrics = (p) => ({ lines: wrap(p.description, COLS).length, chipRows: layoutChips(p.tags).rows });

export function projectCard(p, { index = 0, lines, chipRows }) {
  const s = new Session({ width: CARD_W, x: PAD_X, t: 0.5 + index * 0.35, cps: 40 });
  s.cmd('cat README.md', { pause: 0.15 });
  s.out(`<tspan class="b">${esc(p.title)}</tspan>`, { gap: 0.08 });
  s.out(esc(p.tagline), { cls: 'dim', gap: 0.08 });
  s.space(0.35);
  const body = wrap(p.description, COLS);
  for (let i = 0; i < lines; i++) s.out(esc(body[i] ?? ''), { gap: 0.05 });
  s.space(0.3);

  // tags as inverse-video chips, wrapped onto as many rows as needed
  s.block((y, t) => {
    const { placed, rows } = layoutChips(p.tags);
    const svg = placed.map(({ tag, x, row, w }, i) => {
      const yy = y - 13 + row * 24;
      return `<g${anim(`pop .3s ${at(t + i * 0.06)} backwards`)}>` +
        `<rect x="${n(x)}" y="${n(yy)}" width="${n(w)}" height="18" rx="2" fill="#e6e6e6"/>` +
        `<text x="${n(x + 6)}" y="${n(yy + 13)}" class="chip">${esc(tag)}</text></g>`;
    }).join('');
    return { svg, height: Math.max(rows, chipRows ?? rows) * 24 + 6, duration: p.tags.length * 0.06 };
  });
  s.out(`<tspan class="faint">└─ </tspan><tspan class="dim">${esc(p.link.replace(/^https:\/\//, ''))}</tspan>`, { gap: 0.1 });
  const end = s.end({ bottom: 14 });

  const H = Math.ceil(end.height);
  const style = fontFaces({ bold: true }) + BASE_CSS + `
.chip{font-size:${CHIP}px;fill:#000;font-weight:700}
${end.css}`;
  return svgDoc({
    width: CARD_W,
    height: H,
    title: p.title,
    desc: `${p.title} — ${p.tagline} ${p.description} (${p.tags.join(', ')})`,
    style,
    body: windowFrame({ width: CARD_W, height: H, title: `~/projects/${p.slug}` }) + end.svg,
  });
}
