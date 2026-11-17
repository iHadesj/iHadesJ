// The back of the poster: work experience on a month scale, the "why"
// paragraph, the contact pitch, and the link buttons under it.

import { C, n, text, rect, rule, label, sectionHead, svgDoc, measure } from '../lib/svg.mjs';

const W = 1000;
const M = 40;
const INNER = W - 2 * M;

const months = (ym) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
const dot = (ym) => ym.replace('-', '.');

export function closing({ job, why, contact }) {
  const out = [];
  const span = months(job.to) - months(job.from);

  // ── 04 experiência ──
  out.push(sectionHead(M, 28, INNER, '04', 'experiência', `${dot(job.from)} → ${dot(job.to)}`));
  out.push(text(M - 6, 196, job.short, { size: 130, bold: true, spacing: -6, fill: C.fg }));
  const cx = M + measure(job.short, 130, { bold: true, spacing: -6 }) + 40;
  out.push(
    text(cx, 116, job.company, { size: 28, bold: true, spacing: -0.5, fill: C.fg }),
    text(cx, 146, job.role, { size: 19, fill: C.fg }),
    text(cx, 172, job.what, { size: 19, fill: C.gray }),
  );

  // month scale: whole years, the job as a red bar
  const y0 = Number(job.from.slice(0, 4));
  const y1 = Number(job.to.slice(0, 4));
  const total = (y1 - y0 + 1) * 12;
  const sx = (m) => M + (INNER * m) / total;
  const ty = 250;
  out.push(rule(M, ty, INNER, 1.5));
  for (let m = 0; m <= total; m++) {
    const year = m % 12 === 0;
    out.push(rect(sx(m) - 0.5, ty - (year ? 14 : 6), 1, year ? 14 : 6, year ? C.fg : C.gray));
    if (year && m < total) out.push(label(sx(m) + 6, ty - 18, String(y0 + m / 12)));
  }
  const a = sx(months(job.from) - y0 * 12);
  const b = sx(months(job.to) - y0 * 12 + 1);
  out.push(
    rect(a, ty + 8, b - a, 16, C.red),
    label(b, ty + 48, `${span} meses`, { anchor: 'end', fill: C.red }),
  );

  const half = INNER / 2;
  out.push(
    label(M, ty + 88, 'entrei com', { fill: C.gray }),
    text(M, ty + 116, job.before.join(' · '), { size: 19, fill: C.fg }),
    label(M + half, ty + 88, 'saí com', { fill: C.gray }),
    text(M + half, ty + 116, `+ ${job.after.join(' · ')}`, { size: 19, bold: true, fill: C.red }),
  );

  // ── 05 por quê ──
  let y = ty + 160;
  out.push(sectionHead(M, y, INNER, '05', 'por quê'));
  y += 84;
  const [headline, ...rest] = why;
  out.push(text(M - 2, y, headline, { size: 40, bold: true, spacing: -1.5, fill: C.fg }));
  y += 22;
  for (const line of rest) {
    y += 30;
    out.push(text(M, y, line, { size: 20, fill: C.fg }));
  }

  // ── 06 contato ──
  y += 50;
  out.push(sectionHead(M, y, INNER, '06', 'contato'));
  y += 80;
  for (const line of contact.pitch) {
    out.push(text(M - 3, y, line, { size: 54, bold: true, spacing: -2.5, fill: C.fg }));
    y += 58;
  }
  out.push(text(M, y + 4, '→ escolhe um aí embaixo', { size: 19, fill: C.red, extra: { class: 'hint' } }));

  return svgDoc({
    width: W,
    height: y + 36,
    title: 'Experiência, por quê e contato',
    desc: `${job.company} (${job.short}), ${job.role}, ${dot(job.from)} a ${dot(job.to)}: ${job.what}. Entrei com ${job.before.join(', ')}; saí com ${job.after.join(', ')}. ${why.join(' ')} ${contact.pitch.join(' ')}`,
    style: [
      `.hint{animation:nudge 1.8s ease-in-out infinite}`,
      `@keyframes nudge{50%{transform:translateX(6px)}}`,
      `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
    ].join(''),
    body: out.join('\n'),
  });
}

/** Link button (its own <img> so it can be a link). */
export function button({ label: name }, i) {
  const w = 326;
  const h = 84;
  const bg = i === 0 ? '#c8391f' : C.card;
  return svgDoc({
    width: w,
    height: h,
    bg,
    title: name,
    desc: `abrir ${name}`,
    body: [
      text(24, 52, name, { size: 26, bold: true, spacing: -0.5, fill: C.white }),
      `<g transform="rotate(-45 ${w - 36} 42)">${text(w - 36, 52, '→', { size: 28, bold: true, anchor: 'middle', fill: C.white })}</g>`,
    ].join(''),
  });
}
