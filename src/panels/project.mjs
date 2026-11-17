// One card per project, two per row (each card is its own <img> so it can
// link to its repo). The logos of its stack sit in the top-right corner;
// the first card is printed in koi red.

import { C, n, text, rect, rule, label, svgDoc, wrap, fit } from '../lib/svg.mjs';
import { num, icon, TAG_ICON } from './stack.mjs';

const W = 490;
const P = 28;
const INNER = W - 2 * P;
const TAG = { size: 13, bold: true, spacing: 1.4 };

export function layout(p) {
  return {
    titleSize: fit(p.title, INNER, 30, { bold: true, spacing: -0.5 }),
    tagline: wrap(p.tagline, INNER, 18),
    description: wrap(p.description, INNER, 15),
    tags: wrap(p.tags.map((t) => t.toUpperCase()).join(' / '), INNER - 80, TAG.size, TAG),
  };
}

export const cardHeight = (l) => 150 + l.tagline.length * 24 + 12 + l.description.length * 21 + 34 + l.tags.length * 20 + P;

export function projectCard(p, i, height) {
  const l = layout(p);
  const lead = i === 0;
  const fg = lead ? C.white : C.fg;
  const soft = lead ? C.white : C.gray;
  const accent = lead ? C.white : C.red;
  const out = [];

  // logos, right-aligned
  const logos = [...new Set(p.tags.map((t) => TAG_ICON[t]).filter(Boolean))].slice(0, 4);
  logos.forEach((key, k) => {
    const x = W - P - 30 - (logos.length - 1 - k) * 40;
    out.push(icon(key, x, 44, 30, lead ? C.white : undefined));
  });

  out.push(
    text(P - 3, 80, num(i), { size: 64, bold: true, spacing: -3, fill: accent }),
    rule(P, 102, INNER, 1.5, lead ? C.white : C.line),
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

  let ty = height - P - (l.tags.length - 1) * 20;
  out.push(rule(P, ty - 26, INNER, 1, lead ? C.white : C.line));
  for (const line of l.tags) {
    out.push(label(P, ty, line, { fill: accent }));
    ty += 20;
  }
  out.push(text(W - P, height - P, 'abrir →', { size: 14, bold: true, anchor: 'end', fill: fg }));

  return svgDoc({
    width: W,
    height,
    bg: lead ? '#c8391f' : C.card,
    title: `${num(i)} ${p.title}`,
    desc: `${p.tagline} ${p.description} Stack: ${p.tags.join(', ')}.`,
    body: [rect(0.75, 0.75, W - 1.5, height - 1.5, 'none', { stroke: lead ? 'none' : C.line, 'stroke-width': 1.5 }), ...out].join('\n'),
  });
}
