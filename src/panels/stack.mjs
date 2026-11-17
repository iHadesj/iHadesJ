// Stack as tiles with the real (coloured) logos, so it reads at a glance.
// Under each name: the numbers of the projects where that tool shows up.
// Ends with the heading for the project cards that follow.

import { C, n, text, rect, label, sectionHead, svgDoc, wrap } from '../lib/svg.mjs';
import { ICONS } from '../data/icons.mjs';

const W = 1000;
const M = 40;
const INNER = W - 2 * M;

// brand colours, nudged lighter where the official one disappears on dark water
export const BRAND = {
  react: '#61dafb',
  nextdotjs: '#ffffff',
  typescript: '#3178c6',
  javascript: '#f7df1e',
  tailwindcss: '#38bdf8',
  threedotjs: '#ffffff',
  java: '#f89820',
  postgresql: '#5b8def',
  mysql: '#5d9bd0',
  vitest: '#8fc31f',
  zod: '#6d8fd6',
  git: '#f05032',
};

// project tag → icon
export const TAG_ICON = {
  react: 'react',
  'next.js': 'nextdotjs',
  typescript: 'typescript',
  javascript: 'javascript',
  'tailwind v4': 'tailwindcss',
  'three.js': 'threedotjs',
  java: 'java',
  postgresql: 'postgresql',
  mysql: 'mysql',
  vitest: 'vitest',
};

/** A 24×24 Simple Icons mark scaled to `size`, top-left at (x, y). */
export const icon = (key, x, y, size, fill = BRAND[key]) =>
  `<path transform="translate(${n(x)} ${n(y)}) scale(${n(size / 24, 3)})" fill="${fill}" d="${ICONS[key].d}"/>`;

export const num = (i) => String(i + 1).padStart(2, '0');

function usedIn(item, projects) {
  if (!item.match) return [];
  // exact tag, or a mention in the description ("java" must not hit "javascript")
  const hit = (p, m) => p.tags.includes(m) || new RegExp(`\\b${m.replace('.', '\\.')}\\b`, 'i').test(p.description);
  return projects.flatMap((p, i) => (item.match.some((m) => hit(p, m)) ? [num(i)] : []));
}

export function stack({ stack: groups, more, projects }) {
  const out = [sectionHead(M, 28, INNER, '02', 'stack', 'nº = projeto onde aparece')];
  const perRow = 6;
  const gap = 12;
  const tw = (INNER - gap * (perRow - 1)) / perRow;
  const th = 150;
  let y = 86;
  let k = 0;
  const tiles = groups.reduce((s, g) => s + g.items.length, 0);

  for (const g of groups) {
    out.push(label(M, y, g.name, { fill: C.gray }));
    y += 14;
    g.items.forEach((item, i) => {
      const x = M + (i % perRow) * (tw + gap);
      const ty = y + Math.floor(i / perRow) * (th + gap);
      const refs = usedIn(item, projects);
      const color = BRAND[item.icon];
      out.push(
        rect(x, ty, tw, th, C.card, { stroke: C.line, rx: 6 }),
        `<rect class="hl" style="animation-delay:${n(k * 0.35, 2)}s" x="${n(x)}" y="${ty}" width="${n(tw)}" height="${th}" rx="6" fill="none" stroke="${color}" stroke-width="1.5"/>`,
        icon(item.icon, x + tw / 2 - 24, ty + 24, 48),
        text(x + tw / 2, ty + 104, ICONS[item.icon].label, { size: 17, bold: true, anchor: 'middle', fill: C.fg }),
        label(x + tw / 2, ty + 128, refs.length ? refs.join(' ') : item.note ?? '', { anchor: 'middle', size: 12, fill: refs.length ? C.red : C.gray }),
      );
      k++;
    });
    y += Math.ceil(g.items.length / perRow) * (th + gap) + 24;
  }

  out.push(label(M, y, 'também', { fill: C.gray }));
  for (const line of wrap(more.join(' · '), INNER - 100, 16)) {
    out.push(text(M + 100, y, line, { size: 16, fill: C.fg }));
    y += 24;
  }

  y += 30;
  out.push(sectionHead(M, y, INNER, '03', 'projetos', 'clique num cartão pra abrir o repo'));

  // each tile's outline lights up in its brand colour, one after another
  const loop = tiles * 0.35 + 2;
  return svgDoc({
    width: W,
    height: y + 44,
    title: 'Stack',
    desc: groups.map((g) => `${g.name}: ${g.items.map((i) => ICONS[i.icon].label).join(', ')}`).join('. ') + `. Também: ${more.join(', ')}.`,
    style: [
      `.hl{opacity:0;animation:hl ${n(loop, 2)}s ease-in-out infinite}`,
      `@keyframes hl{0%,${n((100 * 1.4) / loop, 1)}%,100%{opacity:0}${n((100 * 0.5) / loop, 1)}%{opacity:1}}`,
      `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
    ].join(''),
    body: out.join('\n'),
  });
}
