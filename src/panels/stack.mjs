// Panel 3 — the stack. Each tool's mark is rasterized from its vector path
// into ASCII at build time, boots out of noise, and a gleam sweeps the grid.

import { fontFaces, svgDoc, textRows, esc, n } from '../lib/svg.mjs';
import { BASE_CSS, CW, PAD, windowFrame, anim, at } from '../lib/term.mjs';
import { Session } from '../lib/script.mjs';
import { iconToAscii } from '../art/raster.mjs';
import { ICONS } from '../data/icons.mjs';
import { rng } from '../lib/random.mjs';

const W = 1000;
const PER_ROW = 6;
const LOGO = { cols: 28, rows: 17, size: 8 }; // font size 8 → cell 4.8 × 8
const NOISE = '.:-=+*#%@';

function logoRow(keys, { label }) {
  const rand = rng(keys.join('').length * 97);
  const cw = LOGO.size * 0.6;
  const slot = (W - 2 * PAD) / PER_ROW;
  const artW = LOGO.cols * cw;
  const artH = LOGO.rows * LOGO.size;

  return (y, t) => {
    const parts = [`<text x="${PAD}" y="${n(y)}" class="key"${anim(`pop .3s ${at(t)} backwards`)}>${esc(label)}</text>`];
    const top = y + 10;
    keys.forEach((key, i) => {
      const icon = ICONS[key];
      const { lines, coverage } = iconToAscii(icon.d, { cols: LOGO.cols, rows: LOGO.rows, bold: icon.bold ?? 0 });
      const noise = lines.map((line, r) =>
        [...line].map((ch, c) => (coverage[r * LOGO.cols + c] > 0.06 ? NOISE[Math.floor(rand() * NOISE.length)] : ' ')).join(''));
      const x = PAD + i * slot + (slot - artW) / 2;
      const start = t + 0.15 + i * 0.13;
      const rows = (ls) => textRows(ls, { x, y: top, cellW: cw, cellH: LOGO.size, baseline: 0.8 });
      parts.push(
        // ambient: a slow opacity wave rolling across the grid (cheap to composite)
        `<g class="logo"${anim(`wave 3.2s ease-in-out ${at(start + 2 + i * 0.25)} infinite`)}>`,
        `<g class="fr"${anim(`hold .28s linear ${at(start)}`)}>${rows(noise)}</g>`,
        `<g${anim(`on .05s ${at(start + 0.28)} backwards`, `glitch ${at(8 + i * 1.3)} steps(1) ${at(start + 3 + i)} infinite`)}>${rows(lines)}</g>`,
        `</g>`,
        `<text x="${n(x + artW / 2)}" y="${n(top + artH + 22)}" text-anchor="middle" class="label"${anim(`pop .3s ${at(start + 0.35)} backwards`)}>${esc(icon.label.toLowerCase())}</text>`,
      );
    });
    return { svg: parts.join(''), height: artH + 66, duration: 0.15 + keys.length * 0.13 + 0.3 };
  };
}

export function stack({ rows, more }) {
  const s = new Session({ width: W });
  s.cmd('stack --logos');
  s.space(0.25);
  for (const row of rows) s.block(logoRow(row.icons, row));
  s.space(0.1);
  // the long tail, wrapped by hand into lines that fit the window
  const max = Math.floor((W - 2 * PAD) / CW) - 4;
  const lines = [];
  let line = '';
  for (const item of more) {
    const next = line ? `${line} · ${item}` : item;
    if (next.length > max) { lines.push(line); line = item; } else line = next;
  }
  lines.push(line);
  lines.forEach((l, i) => s.out(`<tspan class="b ok">${i ? ' ' : '+'}</tspan> <tspan class="dim">${esc(l).replace(/ · /g, '<tspan class="faint"> · </tspan>')}</tspan>`));
  s.space(0.5);
  const end = s.end();

  const H = Math.ceil(end.height);
  const style = fontFaces({ bold: true }) + BASE_CSS + `
.logo text{font-size:${LOGO.size}px;font-weight:700;fill:#e8e8e8}
.label{font-size:15px;fill:#ededed}
@keyframes wave{0%,100%{opacity:1}50%{opacity:.55}}
.fr{opacity:0}
@keyframes glitch{0%,94%{transform:none}95%{transform:translateX(-6px)}97%{transform:translateX(4px)}98%,100%{transform:none}}
${end.css}`;


  return svgDoc({
    width: W,
    height: H,
    title: 'stack',
    desc: `Stack: ${rows.flatMap((r) => r.icons.map((k) => ICONS[k].label)).join(', ')}; também ${more.join(', ')}.`,
    style,
    body: windowFrame({ width: W, height: H, title: 'hades@grajau: ~ — stack' }) + end.svg,
  });
}
