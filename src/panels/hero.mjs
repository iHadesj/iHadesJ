// Panel 1 — the hero. A terminal runs `./psycho --train`: the face converges
// epoch by epoch out of noise while the mirrored log climbs the pixel stream,
// then the eyes light up and the head keeps quietly dissolving to the left.

import { portrait, trainingFrames } from '../art/portrait.mjs';
import { fontFaces, svgDoc, textRows, rectsPath, polyPath, esc, n } from '../lib/svg.mjs';
import { BASE_CSS, PAD, BAR, windowFrame, typed, prompt, cursor, anim, at } from '../lib/term.mjs';
import { rng } from '../lib/random.mjs';

const CELL_W = 6; // art cell, in viewBox units (font-size 10 → 0.6em advance)
const CELL_H = 10;
const EPOCH = 0.62; // seconds per training epoch
const GLITCH_BANDS = [[13, 16], [31, 33], [49, 52]];

// Debris kinds → little white squares and bars (see portrait.mjs)
function debrisRect(d) {
  const x = d.c * CELL_W, y = d.r * CELL_H;
  if (d.kind === 3) return { x: x + 0.5, y: y + 3.2, w: d.len * CELL_W - 1, h: 3.6 };
  const s = [1.6, 3, 5][d.kind];
  return { x: x + (CELL_W - s) / 2, y: y + (CELL_H - s) / 2, w: s, h: s };
}

export function hero({ title, command, result, session, status, art: artOptions = {} }) {
  const art = portrait(artOptions);
  const frames = trainingFrames(art);
  const rand = rng(404);

  const W = art.cols * CELL_W + 40;
  const ax = 20; // art origin
  const ay = BAR + 46;
  const artH = art.rows * CELL_H;
  const outY = ay + artH + 26; // first line after the art
  const H = outY + 2 * 21 + 34;
  const statusY = H - 26;

  // --- timeline ---------------------------------------------------------------
  const p1 = prompt({ x: PAD, y: BAR + 28 });
  const cmd = typed({ x: PAD + p1.width, y: BAR + 28, text: command, start: 0.6 });
  const t0 = cmd.end + 0.35; // TRAINING STARTED
  const tOf = (epoch) => (epoch >= 6 ? t0 + 5.5 * EPOCH + 0.5 : t0 + epoch * EPOCH);
  const tDone = tOf(6);
  const tOut = tDone + 0.55;
  const tPrompt = tOut + 0.6;

  // --- the face, epoch by epoch -------------------------------------------------
  const rows = (lines) => textRows(lines, { cellW: CELL_W, cellH: CELL_H, baseline: 0.8 });
  const early = frames.slice(0, -1).map((f) =>
    `<g class="fr"${anim(`hold ${at(EPOCH)} linear ${at(tOf(f.epoch))}`)}>${rows(f.face)}</g>`).join('');

  const finalFace = frames.at(-1).face;
  const inBand = (r) => GLITCH_BANDS.findIndex(([a, b]) => r >= a && r <= b);
  const plain = finalFace.map((line, r) => (inBand(r) < 0 ? line : ''));
  const bands = GLITCH_BANDS.map(([a, b], k) => {
    const lines = finalFace.map((line, r) => (r >= a && r <= b ? line : ''));
    return `<g${anim(`glitch ${at(7 + k * 1.7)} steps(1) ${at(tDone + 2 + k * 2.3)} infinite`)}>${rows(lines)}</g>`;
  }).join('');
  const final = `<g${anim(`on .3s ${at(tOf(5))} backwards`)}>${rows(plain)}${bands}</g>`;

  // --- debris: split each layer into groups that move out of phase -------------
  const layerGroups = { edge: 3, stream: 4, wake: 3, stray: 1 };
  const buckets = {};
  for (const d of art.debris) {
    const k = Math.floor(rand() * layerGroups[d.layer]);
    (buckets[`${d.layer}-${k}`] ??= []).push(debrisRect(d));
  }
  const debris = Object.entries(buckets).map(([key, rects]) => {
    const [layer, k] = key.split('-');
    const intro = `on .5s ${at(t0 + 0.15 * +k)} backwards`;
    const ambient = {
      edge: `twinkle ${at(2.6 + 0.7 * +k)} steps(1) ${at(tDone + 0.4 * +k)} infinite`,
      stream: `flow ${at(4.2)} ease-in ${at(tDone + 1.05 * +k)} infinite`,
      wake: `flow ${at(6.5)} linear ${at(tDone + 2.1 * +k)} infinite`,
      stray: `twinkle 3.1s steps(1) ${at(tDone)} infinite`,
    }[layer];
    return `<path d="${rectsPath(rects)}" fill="#f0f0f0"${anim(intro, ambient)}/>`;
  }).join('');

  // --- the mirrored log -----------------------------------------------------------
  const logSize = (CELL_W * art.logScale) / 0.6;
  const log = art.log.map((l) => {
    const x = l.right * CELL_W;
    const y = (l.r + 0.85) * CELL_H;
    const w = l.text.length * logSize * 0.6;
    const backing = `<rect x="${n(x - w - 3)}" y="${n(y - logSize * 0.8)}" width="${n(w + 6)}" height="${n(logSize * 1.05)}" fill="#000"/>`;
    const text = `<text class="log" x="${n(-x)}" y="${n(y)}" transform="scale(-1 1)">${esc(l.text)}</text>`;
    return `<g${anim(`pop .4s ${at(tOf(l.epoch))} backwards`)}>${backing}${text}</g>`;
  }).join('');

  // --- eyes: they light up when training is done ----------------------------------
  const eyes = art.eyes.map((poly) => polyPath(poly.map(([x, y]) => [x * CELL_W, y * CELL_H]))).join('');

  // --- after the run ------------------------------------------------------------------
  const out = `<text x="${PAD}" y="${outY}"${anim(`pop .4s ${at(tOut)} backwards`)}>` +
    `<tspan class="b">✓</tspan> ${esc(result[0])}<tspan class="dim">${esc(result[1])}</tspan></text>`;
  const p2 = prompt({ x: PAD, y: outY + 21 });

  // --- status bar (tmux-ish) -------------------------------------------------------------
  const barW = 120;
  const barX = W - PAD - barW - 210;
  const statusBar = [
    `<path d="M1 ${statusY - 2}H${W - 1}" stroke="#1d1d1d"/>`,
    `<text x="${PAD}" y="${statusY + 14}" class="sb"><tspan class="faint">[${esc(session)}]</tspan> <tspan class="dim">0:train*</tspan> <tspan class="faint">1:zsh</tspan></text>`,
    `<rect x="${barX}" y="${statusY + 5}" width="${barW}" height="10" fill="none" stroke="#3a3a3a"/>`,
    `<rect x="${barX + 2}" y="${statusY + 7}" width="${barW - 4}" height="6" fill="#bdbdbd" style="transform-origin:${barX + 2}px 0;animation:grow ${at(tOf(5) - t0)} steps(5,end) ${at(t0)} backwards"/>`,
    `<text x="${W - PAD}" y="${statusY + 14}" text-anchor="end" class="sb dim">${esc(status)}</text>`,
  ].join('');

  // --- CRT dressing: scanlines + a slow refresh band over the art --------------------------
  const crt =
    `<rect x="${ax}" y="${ay}" width="${art.cols * CELL_W}" height="${artH}" fill="url(#scan)" pointer-events="none"/>` +
    `<rect x="${ax}" y="${ay - 80}" width="${art.cols * CELL_W}" height="80" fill="url(#refresh)" style="animation:refresh 7s linear ${at(tDone)} infinite"/>`;

  const style = fontFaces({ bold: true }) + BASE_CSS + `
.art text{font-size:10px;font-weight:700;fill:#ededed}
.log{font-size:${n(logSize)}px;fill:#c9c9c9}
.sb{font-size:11.5px}
.fr{opacity:0}
@keyframes glitch{0%,90%{transform:none}91%{transform:translateX(-12px)}93%{transform:translateX(7px)}95%{transform:translateX(-4px)}96%,100%{transform:none}}
@keyframes twinkle{0%,100%{opacity:1}40%{opacity:.35}70%{opacity:.85}}
@keyframes flow{0%{transform:none;opacity:1}82%{transform:translateX(-46px);opacity:0}83%{transform:translateX(14px);opacity:0}100%{transform:none;opacity:1}}
@keyframes ignite{0%{opacity:0}30%{opacity:1}45%{opacity:.2}60%{opacity:1}100%{opacity:1}}
@keyframes breathe{0%,100%{opacity:1}50%{opacity:.72}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes refresh{from{transform:translateY(0)}to{transform:translateY(${artH + 80}px)}}
${cmd.css}`;

  const defs = `
<pattern id="scan" width="8" height="3" patternUnits="userSpaceOnUse"><rect width="8" height="1" fill="#000" opacity=".2"/></pattern>
<linearGradient id="refresh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity=".022"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="glow" x="-60%" y="-120%" width="220%" height="340%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="screen"><rect x="${ax}" y="${ay}" width="${art.cols * CELL_W}" height="${artH}"/></clipPath>`;

  const body = [
    windowFrame({ width: W, height: H, title }),
    p1.svg,
    cmd.svg,
    `<g clip-path="url(#screen)">`,
    `<g transform="translate(${ax} ${ay})">`,
    `<g class="art">${early}${final}</g>`,
    debris,
    log,
    `</g>`,
    crt,
    `<path transform="translate(${ax} ${ay})" d="${eyes}" fill="#fff" filter="url(#glow)"${anim(`ignite .9s ease-out ${at(tDone)} backwards`, `breathe 3.4s ease-in-out ${at(tDone + 0.9)} infinite`)}/>`,
    `</g>`,
    out,
    `<g${anim(`on .01s ${at(tPrompt)} backwards`)}>${p2.svg}</g>`,
    cursor({ x: PAD + p2.width, y: outY + 21, start: tPrompt }),
    statusBar,
  ].join('\n');

  return svgDoc({
    width: W,
    height: H,
    title: 'psycho --train',
    desc: 'Terminal preto e branco: um rosto em arte ASCII, gerado a partir de um modelo 3D feito em código, converge época por época enquanto um log de treino espelhado sobe pelo rastro de pixels que se desprende da cabeça.',
    style,
    defs,
    body,
  });
}
