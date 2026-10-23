// Panel 2 — `whoami`: the name in big block letters, then the short version
// of who I am, then what I care about, listed like directories.

import { fontFaces, svgDoc, textRows, rectsPath, esc, n } from '../lib/svg.mjs';
import { BASE_CSS, PAD, windowFrame, anim, at } from '../lib/term.mjs';
import { Session } from '../lib/script.mjs';
import { banner, bannerLayers } from '../art/banner.mjs';

const W = 1000;
const BANNER_SIZE = 15; // font size of the block letters
const PITCH = BANNER_SIZE * 1.32; // JetBrains Mono's block glyphs tile at 1.32em

function bannerBlock(text) {
  const rows = banner(text);
  const { face, shadow } = bannerLayers(rows);
  const cw = BANNER_SIZE * 0.6;
  const width = rows[0].length * cw;
  return (y, t) => {
    const top = y - 6;
    // solid blocks as one path of rectangles (glyphs side by side leave seams)
    const blocks = (from, to) => rectsPath(face.slice(from, to).flatMap((line, i) =>
      [...line.matchAll(/█+/g)].map((m) => ({ x: PAD + m.index * cw, y: top + (from + i) * PITCH, w: m[0].length * cw, h: PITCH }))));
    const shadowText = textRows(shadow, { x: PAD, y: top, cellW: cw, cellH: PITCH, baseline: 1.02 / 1.32, attrs: ' class="bn-shadow"' });
    const dur = 0.85;
    const svg = [
      `<g class="bn">`,
      shadowText,
      `<path d="${blocks(0, 3)}" fill="url(#shine)"${anim(`glitch 6.5s steps(1) ${at(t + 2)} infinite`)}/>`,
      `<path d="${blocks(3, 6)}" fill="url(#shine)"${anim(`glitch 6.5s steps(1) ${at(t + 2.12)} infinite`)}/>`,
      `</g>`,
      // reveal: an occluder shrinks to the right while a beam sweeps across
      `<rect class="typer" x="${PAD - 2}" y="${n(top)}" width="${n(width + 8)}" height="${n(PITCH * 6 + 4)}" fill="#000"` +
        ` style="transform-origin:${n(PAD + width + 6)}px 0;animation:type ${at(dur)} cubic-bezier(.6,0,.4,1) ${at(t)} backwards"/>`,
      `<rect x="${PAD - 2}" y="${n(top)}" width="3" height="${n(PITCH * 6 + 4)}" fill="#fff" opacity="0"` +
        ` style="animation:hold ${at(dur)} linear ${at(t)},beam ${at(dur)} cubic-bezier(.6,0,.4,1) ${at(t)}"/>`,
    ].join('');
    const css = `@keyframes beam{from{transform:translateX(0)}to{transform:translateX(${n(width + 6)}px)}}`;
    return { svg, css, height: PITCH * 6 + 14, duration: dur + 0.15 };
  };
}

export function whoami({ name, tagline, about, focus }) {
  const s = new Session({ width: W });
  s.cmd('whoami');
  s.block(bannerBlock(name));
  s.out(tagline.map((part, i) => `${i ? '<tspan class="faint"> · </tspan>' : ''}${esc(part)}`).join(''), { cls: 'dim' });
  s.space(0.7);

  s.cmd('cat sobre.txt');
  s.table(about);
  s.space(0.5);

  s.cmd('ls ~/foco');
  const colW = Math.max(...focus.map((f) => f.length)) + 4;
  for (let i = 0; i < focus.length; i += 2) {
    const cell = (f) => (f ? `${esc(f)}<tspan class="faint">/</tspan>${' '.repeat(colW - f.length - 1)}` : '');
    s.out(cell(focus[i]) + cell(focus[i + 1]), { indent: 2 });
  }
  s.space(0.5);
  const end = s.end();

  const H = Math.ceil(end.height);
  const style = fontFaces({ bold: true }) + BASE_CSS + `
.bn text{font-size:${BANNER_SIZE}px}
.bn-shadow{fill:#5c5c5c}
@keyframes glitch{0%,93%{transform:none}94%{transform:translateX(-9px)}96%{transform:translateX(5px)}97.5%,100%{transform:none}}
${end.css}`;
  const defs = `<linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
<stop offset="0" stop-color="#d4d4d4"/><stop offset=".44" stop-color="#d4d4d4"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".56" stop-color="#d4d4d4"/><stop offset="1" stop-color="#d4d4d4"/>
<animateTransform attributeName="gradientTransform" type="translate" values="-${W};-${W};${W}" keyTimes="0;.55;1" dur="6s" begin="2.5s" repeatCount="indefinite"/>
</linearGradient>`;

  return svgDoc({
    width: W,
    height: H,
    title: 'whoami',
    desc: `${name}: ${tagline.join(', ')}. ${about.map(([k, v]) => `${k}: ${v}`).join('; ')}.`,
    style,
    defs,
    body: windowFrame({ width: W, height: H, title: 'hades@grajau: ~ — whoami' }) + end.svg,
  });
}
