// The hero: a night pond in ASCII, with the name floating on the water.
// The pond is fed by the contribution calendar (rebuilt daily):
//   · one koi per 100 contributions in the last 12 months (1 to 5)
//   · contributions in the last 7 days set the swimming pace
//   · each day with a commit in the last 14 days leaves a ripple
//   · the pond bed is the calendar itself, one character per day

import { C, MONO, n, esc, text, rect, svgDoc, gridText } from '../lib/svg.mjs';
import { koiFrames, VARIETIES, CW, LH } from '../art/koi.mjs';
import { stats } from '../lib/contributions.mjs';

const W = 1000;
const H = 540;
const M = 40;
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WATER = ['#1a2b31', '#24393f', '#2f4a53'];

// deterministic noise so the pond only changes when the data does
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function waterLayer(seed, top, bottom) {
  const rand = rng(seed);
  const cells = new Map();
  const cols = Math.floor(W / CW);
  for (let r = Math.floor(top / LH); r < bottom / LH; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * CW;
      const y = r * LH;
      const f = Math.sin(x * 0.019 + y * 0.011 + seed) + Math.sin(y * 0.05 - x * 0.007 + 1.7 * seed) + Math.sin((x + 2 * y) * 0.01);
      const g = rand();
      if (f > 2 && g < 0.35) cells.set(`${r},${c}`, [f > 2.3 ? '~' : '-', WATER[f > 2.3 ? 1 : 0]]);
      else if (g < 0.006) cells.set(`${r},${c}`, ['.', WATER[0]]);
    }
  }
  return cells;
}

/** Closed swim path (relative to its first point) and that first point. */
function swimPath(i) {
  const shapes = [
    (t) => [500 + 390 * Math.sin(t), 205 + 95 * Math.sin(2 * t)],
    (t) => [500 - 300 * Math.cos(t), 215 + 105 * Math.sin(t)],
    (t) => [470 + 260 * Math.cos(t) + 90 * Math.cos(2 * t), 210 - 90 * Math.sin(t)],
    (t) => [530 + 340 * Math.sin(t + 1), 200 + 70 * Math.sin(2 * t + 2) + 25 * Math.sin(t)],
    (t) => [700 + 170 * Math.cos(t), 220 + 80 * Math.sin(t)],
  ];
  const f = shapes[i % shapes.length];
  const pts = Array.from({ length: 97 }, (_, k) => f((2 * Math.PI * k) / 96));
  const [sx, sy] = pts[0];
  const d = `M${pts.map(([x, y]) => `${n(x - sx, 1)} ${n(y - sy, 1)}`).join('L')}`;
  return { d, sx, sy };
}

export function pond(profile, days) {
  const s = stats(days);
  const count = Math.max(1, Math.min(5, 1 + Math.floor(s.total / 100)));
  const pace = s.idle > 7 ? 48 : Math.max(12, 36 - 3 * Math.min(s.week, 8));
  const beat = s.idle > 7 ? 0.8 : s.week >= 8 ? 0.36 : 0.5;
  const mood =
    s.idle > 7 ? `com fome · ${s.idle} dias sem commit`
    : s.week >= 8 ? `agitadas · ${s.week} commits na semana`
    : s.week > 0 ? `nadando · ${s.week} commit${s.week > 1 ? 's' : ''} na semana`
    : 'calmas · semana sem commit';

  // colour classes for every character colour in the file
  const palette = new Map();
  const cls = (color) => {
    const c = color === 'eye' ? '#0a0d0e' : color;
    if (!palette.has(c)) palette.set(c, `c${palette.size}`);
    return palette.get(c);
  };

  const out = [];

  // ── water: two textures cross-fading ──
  out.push(
    `<g class="m wa">${gridText(waterLayer(3, 0, 350), { cw: CW, lh: LH, cls })}</g>`,
    `<g class="m wb">${gridText(waterLayer(11, 0, 350), { cw: CW, lh: LH, cls })}</g>`,
  );

  // ── ripples where the recent commits landed ──
  s.recent.slice(-6).forEach((d, i) => {
    const rand = rng(hash(d.date));
    const cx = 120 + rand() * 760;
    const cy = 80 + rand() * 240;
    for (let k = 0; k < 3; k++) {
      const begin = n(-(i * 1.3 + k * 0.9), 1);
      out.push(
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="2" fill="none" stroke="${WATER[2]}" stroke-width="1.2" stroke-dasharray="1.5 4">` +
          `<animate attributeName="r" values="2;46" dur="4.2s" begin="${begin}s" repeatCount="indefinite"/>` +
          `<animate attributeName="opacity" values="0.9;0" dur="4.2s" begin="${begin}s" repeatCount="indefinite"/></circle>`,
      );
    }
  });

  // ── koi ──
  const sizes = [185, 160, 140, 122, 108];
  for (let i = 0; i < count; i++) {
    const { frames, x0, y0 } = koiFrames({ length: sizes[i], variety: VARIETIES[i] });
    const { d, sx, sy } = swimPath(i);
    const lap = n(pace * (0.9 + 0.17 * i), 1);
    const sprite = frames
      .map((cells, f) => `<g class="m f${f ? '' : ' f0'}" style="animation-delay:${n(-(beat * f) / frames.length, 2)}s">${gridText(cells, { x0, y0, cw: CW, lh: LH, cls, gap: 3 })}</g>`)
      .join('');
    out.push(
      `<g transform="translate(${n(sx)} ${n(sy)})"><g>${sprite}` +
        `<animateMotion path="${d}" dur="${lap}s" begin="${n(-i * 3.7, 1)}s" rotate="auto" repeatCount="indefinite"/></g></g>`,
    );
  }

  // ── name on the water ──
  out.push(
    text(M - 4, 118, `${profile.first} ${profile.last}`, { size: 88, bold: true, spacing: -3.5, fill: C.fg, cls: 'halo' }),
    text(M, 154, `${profile.role} · ${profile.facts.join(' · ')}`, { size: 19, fill: C.fg, cls: 'halo' }),
  );
  const pillW = 300;
  const px = W - M - pillW;
  out.push(
    rect(px, 30, pillW, 58, C.bg, { stroke: C.red, 'stroke-width': 1.5, rx: 29 }),
    `<circle class="live" cx="${n(px + 28)}" cy="52" r="6" fill="${C.red}"/>`,
    text(px + 44, 57, profile.status[0], { size: 17, bold: true, fill: C.fg }),
    text(px + 44, 77, profile.status[1], { size: 14, fill: C.gray }),
  );

  // ── pond bed: the calendar, one character per day ──
  const bedTop = 372;
  const firstDow = new Date(`${days[0].date}T12:00:00Z`).getUTCDay();
  const weeks = Math.ceil((days.length + firstDow) / 7);
  const max = Math.max(1, ...days.map((d) => d.count));
  const rows = Array.from({ length: 7 }, () => ({ dim: Array(weeks * 3).fill(' '), hot: Array(weeks * 3).fill(' ') }));
  const monthAt = [];
  days.forEach((d, i) => {
    const col = Math.floor((i + firstDow) / 7);
    const row = (i + firstDow) % 7;
    const lvl = d.count ? Math.min(3, Math.ceil((d.count / max) * 3)) : 0;
    if (lvl) rows[row].hot[col * 3 + 1] = ['o', 'O', '@'][lvl - 1];
    else rows[row].dim[col * 3 + 1] = '·';
    if (d.date.endsWith('-01')) monthAt.push([col, MONTHS[Number(d.date.slice(5, 7)) - 1]]);
  });
  const bedW = W - 2 * M;
  const rowH = 11;
  out.push(
    `<text x="${M}" y="${bedTop - 14}" class="mono lab">o fundo do lago são os commits dos últimos 12 meses: ${s.total} contribuições em ${s.active} dias</text>`,
  );
  rows.forEach((r, i) => {
    const y = n(bedTop + (i + 1) * rowH);
    out.push(
      `<text x="${M}" y="${y}" class="mono bed" fill="${WATER[2]}" textLength="${bedW}">${r.dim.join('')}</text>`,
      `<text x="${M}" y="${y}" class="mono bed" fill="${C.red}" textLength="${bedW}">${r.hot.join('')}</text>`,
    );
  });
  monthAt.forEach(([col, m], i) => {
    if (i && col - monthAt[i - 1][0] < 3) return;
    out.push(`<text x="${n(M + (bedW * col) / weeks)}" y="${bedTop + 7 * rowH + 18}" class="mono lab">${m}</text>`);
  });

  // ── status line ──
  const last = days.at(-1).date;
  out.push(
    rect(M, H - 52, W - 2 * M, 1, C.line),
    `<text x="${M}" y="${H - 24}" class="mono st"><tspan fill="${C.red}">●</tspan> ${count} carpa${count > 1 ? 's' : ''} <tspan class="dim">(1 a cada 100 commits)</tspan>  ·  ${esc(mood)}  ·  ${s.recent.length} onda${s.recent.length === 1 ? '' : 's'} <tspan class="dim">(dias com commit em 2 semanas)</tspan></text>`,
    `<text x="${W - M}" y="${H - 24}" class="mono st dim" text-anchor="end">${last.slice(8, 10)}.${last.slice(5, 7)}</text>`,
  );

  const style = [
    `.mono,.m text{font-family:${MONO};white-space:pre}`,
    `.m text{font-size:9px}`,
    [...palette].map(([c, k]) => `.${k}{fill:${c}}`).join(''),
    `.bed{font-size:9px}.lab{font-size:13px;fill:${C.gray}}.st{font-size:14px;fill:${C.fg}}.dim{fill:${C.gray}}`,
    `.halo{paint-order:stroke;stroke:${C.bg};stroke-width:7px;stroke-linejoin:round}`,
    `.f{opacity:0;animation:flip ${beat}s steps(1,end) infinite}.f0{opacity:1}`,
    `@keyframes flip{0%{opacity:1}${n(100 / 4)}%,100%{opacity:0}}`,
    `.wb{opacity:0;animation:fade 7s ease-in-out infinite alternate}`,
    `@keyframes fade{to{opacity:1}}`,
    `.live{animation:blink 1.6s steps(1) infinite}@keyframes blink{50%{opacity:.15}}`,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
  ].join('');

  return svgDoc({
    width: W,
    height: H,
    title: `${profile.first} ${profile.last} — ${profile.role}`,
    desc: `Um lago noturno em ASCII com ${count} carpas koi nadando, alimentado pelos commits: ${s.total} contribuições nos últimos 12 meses. ${profile.role}, ${profile.facts.join(', ')}. ${profile.status.join(': ')}.`,
    style,
    body: out.join('\n'),
  });
}
