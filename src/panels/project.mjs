// One card per project, shown two per row (each card is its own <img>
// so it can link to its repo). The first card is printed in red.

import { C, n, text, rect, rule, label, svgDoc, wrap, fit } from '../lib/svg.mjs';
import { num } from './stack.mjs';

const W = 490;
const P = 28;
const INNER = W - 2 * P;
const TAG = { size: 13, bold: true, spacing: 1.4 };

/** Text blocks of a card, wrapped. Used to give every card the same height. */
export function layout(p) {
  return {
    titleSize: fit(p.title, INNER, 30, { bold: true, spacing: -0.5 }),
    tagline: wrap(p.tagline, INNER, 18),
    description: wrap(p.description, INNER, 15),
    tags: wrap(p.tags.map((t) => t.toUpperCase()).join(' / '), INNER, TAG.size, TAG),
  };
}

export const cardHeight = (l) => 150 + l.tagline.length * 24 + 12 + l.description.length * 21 + 34 + l.tags.length * 20 + P;

export function projectCard(p, i, height) {
  const l = layout(p);
  const lead = i === 0;
  const fg = lead ? C.white : C.ink;
  const soft = lead ? C.white : C.gray;
  const accent = lead ? C.white : C.red;
  const out = [];

  out.push(
    text(P - 3, 80, num(i), { size: 64, bold: true, spacing: -3, fill: accent }),
    `<g transform="rotate(-45 ${n(W - P - 14)} 58)">${text(W - P - 14, 68, '→', { size: 30, bold: true, anchor: 'middle', fill: fg })}</g>`,
    rule(P, 102, INNER, 1.5, fg),
    text(P, 144, p.title, { size: l.titleSize, bold: true, spacing: -0.5, fill: fg }),
  );

  let y = 174;
  for (const line of l.tagline) {
    out.push(text(P, y, line, { size: 18, fill: fg }));
    y += 24;
  }
  y += 12;
  for (const line of l.description) {
    out.push(text(P, y, line, { size: 15, fill: soft }));
    y += 21;
  }

  // tags sit on the bottom edge so they line up across the row
  let ty = height - P - (l.tags.length - 1) * 20;
  out.push(rule(P, ty - 26, INNER, 1, lead ? C.white : C.dot));
  for (const line of l.tags) {
    out.push(label(P, ty, line, { fill: accent }));
    ty += 20;
  }

  return svgDoc({
    width: W,
    height,
    bg: lead ? C.red : C.paper,
    title: `${num(i)} ${p.title}`,
    desc: `${p.tagline} ${p.description} Stack: ${p.tags.join(', ')}.`,
    body: out.join('\n'),
  });
}
