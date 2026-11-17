// The contribution calendar the way GitHub draws it (green squares, same
// levels and legend), filling in week by week when the image loads.
// Rebuilt daily by the workflow.

import { C, text, label, rect, sectionHead, svgDoc, enter } from '../lib/svg.mjs';
import { stats } from '../lib/contributions.mjs';

const W = 1000;
const M = 40;
const INNER = W - 2 * M;
const GREEN = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DOW = { 1: 'seg', 3: 'qua', 5: 'sex' };

const ddmm = (iso) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

// GitHub's quartiles: level 1–4 split the non-zero days of the year
function levels(days) {
  const counts = days.map((d) => d.count).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))] ?? 1;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  return (c) => (c === 0 ? 0 : 1 + cuts.filter((cut) => c > cut).length);
}

export function contrib(profile, days) {
  const s = stats(days);
  const level = levels(days);
  const out = [sectionHead(M, 28, INNER, '01', 'contribuições', 'últimos 12 meses')];

  const left = M + 34;
  const top = 106;
  const firstDow = new Date(`${days[0].date}T12:00:00Z`).getUTCDay();
  const cols = Math.ceil((days.length + firstDow) / 7);
  const pitch = (W - M - left) / cols;
  const size = pitch - 3.5;

  const weeks = Array.from({ length: cols }, () => []);
  let lastMonthCol = -9;
  days.forEach((d, i) => {
    const col = Math.floor((i + firstDow) / 7);
    const row = (i + firstDow) % 7;
    weeks[col].push(rect(left + col * pitch, top + row * pitch, size, size, GREEN[level(d.count)], { rx: 2.5 }));
    if (d.date.endsWith('-01') && col - lastMonthCol > 2) {
      out.push(text(left + col * pitch, top - 12, MONTHS[Number(d.date.slice(5, 7)) - 1], { size: 13, fill: C.gray }));
      lastMonthCol = col;
    }
  });
  for (const [row, name] of Object.entries(DOW)) {
    out.push(text(M, top + row * pitch + size - 2, name, { size: 12, fill: C.gray }));
  }
  // the year fills in as a wave, left to right
  weeks.forEach((cells, col) => out.push(`<g${enter(0.2 + col * 0.022, 'pop')}>${cells.join('')}</g>`));

  // legend, like GitHub's
  const ly = top + 7 * pitch + 18;
  let lx = W - M - 5 * 15 - 40;
  out.push(text(lx - 8, ly + 10, 'menos', { size: 12, fill: C.gray, anchor: 'end' }));
  GREEN.forEach((g, i) => out.push(rect(lx + i * 15, ly, 11, 11, g, { rx: 2 })));
  out.push(text(lx + 5 * 15 + 4, ly + 10, 'mais', { size: 12, fill: C.gray }));
  out.push(text(M, ly + 10, 'a carpa acima é redesenhada toda noite a partir dessa atividade, com o git-koi', { size: 12, fill: C.gray }));

  // numbers
  const sy = ly + 44;
  const cells = [
    [s.total, 'contribuições', GREEN[4]],
    [s.active, 'dias com commit', C.fg],
    [s.streak, 'dias seguidos, recorde', C.fg],
    [s.best.count, `num dia só · ${ddmm(s.best.date)}`, C.fg],
  ];
  const cw = INNER / cells.length;
  cells.forEach(([num, what, fill], i) => {
    const x = M + i * cw;
    out.push(
      `<g${enter(1.1 + i * 0.12)}>` +
        (i ? rect(x - 14, sy + 10, 1.5, 62, C.line) : '') +
        text(x, sy + 54, String(num), { size: 54, bold: true, spacing: -2, fill }) +
        label(x, sy + 78, what, { fill: C.gray }) +
        '</g>',
    );
  });

  return svgDoc({
    width: W,
    height: sy + 104,
    title: 'Contribuições',
    desc: `${s.total} contribuições nos últimos 12 meses, em ${s.active} dias; maior sequência de ${s.streak} dias; recorde de ${s.best.count} num dia (${ddmm(s.best.date)}).`,
    body: out.join('\n'),
  });
}
