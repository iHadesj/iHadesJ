// Stack as a typeset table: three columns, one tool per row, and on the
// right of each row the numbers of the projects where that tool shows up.
// Ends with the heading for the project cards that follow it.

import { C, text, rule, label, sectionHead, svgDoc, wrap } from '../lib/svg.mjs';

const W = 1000;
const M = 40;
const INNER = W - 2 * M;
const GAP = 40;
const ROW = 48;

export const num = (i) => String(i + 1).padStart(2, '0');

/** Which projects (as "01", "03"…) mention any of the item's words. */
function usedIn(item, projects) {
  if (!item.match) return [];
  return projects
    .map((p, i) => [`${p.tags.join(' ')} ${p.description}`.toLowerCase(), i])
    .filter(([hay]) => item.match.some((m) => hay.includes(m)))
    .map(([, i]) => num(i));
}

export function stack({ stack: groups, more, projects }) {
  const out = [sectionHead(M, 28, INNER, '02', 'stack', 'nº = projeto onde aparece')];
  const colW = (INNER - GAP * (groups.length - 1)) / groups.length;
  const top = 96;

  groups.forEach((g, gi) => {
    const x = M + gi * (colW + GAP);
    out.push(label(x, top, g.name, { fill: C.gray }));
    g.items.forEach((item, i) => {
      const y = top + 14 + i * ROW;
      const refs = usedIn(item, projects);
      out.push(
        rule(x, y, colW, 1, C.dot),
        text(x, y + 34, item.name, { size: 26, bold: true, spacing: -0.5, fill: C.ink }),
        refs.length
          ? label(x + colW, y + 30, refs.join(' '), { anchor: 'end', fill: C.red })
          : label(x + colW, y + 30, item.note ?? '', { anchor: 'end', fill: C.gray }),
      );
    });
  });

  const rows = Math.max(...groups.map((g) => g.items.length));
  let y = top + 14 + rows * ROW + 40;
  out.push(label(M, y, 'também', { fill: C.gray }));
  for (const line of wrap(more.join(' · '), INNER - 100, 16)) {
    out.push(text(M + 100, y, line, { size: 16, fill: C.ink }));
    y += 24;
  }

  y += 30;
  out.push(sectionHead(M, y, INNER, '03', 'projetos', 'clique num cartão pra abrir o repo'));

  return svgDoc({
    width: W,
    height: y + 44,
    title: 'Stack',
    desc: groups.map((g) => `${g.name}: ${g.items.map((i) => i.name).join(', ')}`).join('. ') + `. Também: ${more.join(', ')}.`,
    body: out.join('\n'),
  });
}
