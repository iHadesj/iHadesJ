// Opening poster: the name set huge, a red block with role + status, and
// the last 12 months of contributions as a dot matrix (one dot per day,
// size = how much happened). Rebuilt daily by the workflow.

import { C, n, text, rect, rule, label, sectionHead, svgDoc, measure } from '../lib/svg.mjs';
import { stats } from '../lib/contributions.mjs';

const W = 1000;
const M = 40;
const INNER = W - 2 * M;
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const ddmm = (iso) => iso.slice(8, 10) + '.' + iso.slice(5, 7);

export function poster(profile, days) {
  const s = stats(days);
  const last = days.at(-1).date;
  const out = [];

  // ── masthead ──
  out.push(
    label(M, 46, `${profile.login} · perfil`),
    label(W - M, 46, `atualizado ${ddmm(last)}.${last.slice(0, 4)}`, { anchor: 'end', fill: C.gray }),
    rule(M, 58, INNER, 3),
  );

  // ── name: two lines, tight tracking, cap tops aligned with the red block ──
  const size = 160;
  const track = -0.045 * size;
  const capTop = 100;
  const base1 = capTop + 0.716 * size;
  const base2 = base1 + 140;
  out.push(
    text(M - 6, base1, profile.first, { size, bold: true, spacing: track, fill: C.ink }),
    text(M - 6, base2, profile.last, { size, bold: true, spacing: track, fill: C.ink }),
  );
  const nameRight = M + measure(profile.last, size, { bold: true, spacing: track });

  // ── red block ──
  const bx = Math.max(nameRight + 40, 640);
  const bw = W - M - bx;
  const by = capTop;
  const bh = base2 - capTop;
  // "full stack dev" → "full stack" / "dev"
  const cut = profile.role.lastIndexOf(' ');
  out.push(
    rect(bx, by, bw, bh, C.red),
    text(bx + 20, by + 44, profile.role.slice(0, cut), { size: 38, bold: true, spacing: -1, fill: C.white }),
    text(bx + 20, by + 84, profile.role.slice(cut + 1), { size: 38, bold: true, spacing: -1, fill: C.white }),
    ...profile.facts.map((f, i) => text(bx + 20, by + 132 + i * 24, f, { size: 17, fill: C.white })),
    rule(bx + 20, by + bh - 74, bw - 40, 1.5, C.white),
    `<circle class="live" cx="${n(bx + 26)}" cy="${n(by + bh - 47)}" r="6" fill="${C.white}"/>`,
    text(bx + 42, by + bh - 41, profile.status[0], { size: 18, bold: true, fill: C.white }),
    text(bx + 20, by + bh - 18, profile.status[1], { size: 16, fill: C.white }),
  );

  // ── contributions ──
  const headY = base2 + 42;
  out.push(sectionHead(M, headY, INNER, '01', 'contribuições', 'últimos 12 meses · 1 ponto = 1 dia'));

  const top = headY + 52;
  const firstDow = new Date(`${days[0].date}T12:00:00Z`).getUTCDay();
  const cols = Math.ceil((days.length + firstDow) / 7);
  const pitch = INNER / cols;
  const max = Math.max(1, ...days.map((d) => d.count));
  const week = Array.from({ length: cols }, () => []);
  const monthMarks = [];
  let lastMarkCol = -9;

  days.forEach((d, i) => {
    const col = Math.floor((i + firstDow) / 7);
    const row = (i + firstDow) % 7;
    const cx = M + pitch * (col + 0.5);
    const cy = top + pitch * (row + 0.5);
    const r = d.count ? 3.2 + (pitch * 0.46 - 3.2) * Math.sqrt(d.count / max) : 2.2;
    week[col].push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"${d.count ? ` fill="${C.red}"` : ''}/>`);
    if (d.date.endsWith('-01') && col - lastMarkCol > 2) {
      monthMarks.push(label(M + pitch * col + 2, top + pitch * 7 + 22, MONTHS[Number(d.date.slice(5, 7)) - 1], { size: 12, fill: C.gray }));
      lastMarkCol = col;
    }
  });

  // columns fade in behind a red playhead sweeping left → right
  const SWEEP = 2.4;
  const DELAY = 0.3;
  const LOOP = 9;
  out.push(
    `<g fill="${C.dot}">`,
    ...week.map((dots, col) => `<g class="w" style="animation-delay:${n(DELAY + (SWEEP * col) / cols, 2)}s">${dots.join('')}</g>`),
    '</g>',
    ...monthMarks,
  );
  const lastIdx = days.length - 1 + firstDow;
  const tx = M + pitch * (Math.floor(lastIdx / 7) + 0.5);
  const ty = top + pitch * ((lastIdx % 7) + 0.5);
  out.push(
    `<circle class="today" cx="${n(tx)}" cy="${n(ty)}" r="${n(pitch * 0.48)}" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`,
    rect(M, top - 6, 2, pitch * 7 + 12, C.red, { class: 'ph' }),
  );

  // ── the numbers ──
  const statsY = top + pitch * 7 + 46;
  out.push(rule(M, statsY, INNER, 1.5));
  const cells = [
    [s.total, 'contribuições', C.red],
    [s.active, 'dias com commit', C.ink],
    [s.streak, s.streak === 1 ? 'dia seguido, no máximo' : 'dias seguidos, recorde', C.ink],
    [s.best.count, `num dia só · ${ddmm(s.best.date)}`, C.ink],
  ];
  const cw = INNER / cells.length;
  cells.forEach(([num, what, fill], i) => {
    const x = M + i * cw;
    if (i) out.push(rect(x - 12, statsY + 18, 1.5, 70, C.dot));
    out.push(
      text(x, statsY + 70, String(num), { size: 58, bold: true, spacing: -2, fill }),
      label(x, statsY + 94, what, { fill: C.gray }),
    );
  });

  const height = statsY + 124;
  // Everything is fully drawn without animation (static previews, reduced
  // motion); motion only adds emphasis: every LOOP seconds the playhead
  // sweeps and each week column hops as it passes.
  const pct = (t) => n((100 * t) / LOOP, 2);
  const style = [
    `.w{animation:hop ${LOOP}s ease-out infinite}`,
    `@keyframes hop{0%,${pct(0.5)}%{transform:none}${pct(0.15)}%{transform:translateY(-6px)}}`,
    `.ph{opacity:0;animation:sweep ${LOOP}s linear ${DELAY}s infinite}`,
    `@keyframes sweep{0%{opacity:1;transform:translateX(0)}${pct(SWEEP)}%{opacity:1;transform:translateX(${n(INNER)}px)}${pct(SWEEP + 0.01)}%,100%{opacity:0;transform:translateX(${n(INNER)}px)}}`,
    `.today{transform-box:fill-box;transform-origin:center;animation:pulse 2s ease-in-out ${n(DELAY + SWEEP)}s infinite}`,
    `@keyframes pulse{50%{transform:scale(1.35);opacity:.35}}`,
    `.live{animation:blink 1.6s steps(1) infinite}`,
    `@keyframes blink{50%{opacity:0}}`,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
  ].join('');

  return svgDoc({
    width: W,
    height,
    title: `${profile.first} ${profile.last} — ${profile.role}`,
    desc: `${profile.role}, ${profile.facts.join(', ')}. ${profile.status.join(': ')}. ${s.total} contribuições nos últimos 12 meses, em ${s.active} dias; recorde de ${s.best.count} num dia.`,
    style,
    body: out.join('\n'),
  });
}
