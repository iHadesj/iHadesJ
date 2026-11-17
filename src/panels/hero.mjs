// Opening panel: the name set big, letter by letter rising out of the dark,
// a red rule drawing itself underneath, and the facts on the right.

import { C, n, esc, text, label, rect, svgDoc, measure, enter } from '../lib/svg.mjs';

const W = 1000;
const H = 270;
const M = 40;

export function hero(profile) {
  const out = [];
  const name = `${profile.first} ${profile.last}`;
  const size = 116;
  const track = -0.04 * size;
  const base = 172;

  out.push(
    `<g${enter(0)}>${label(M, 50, profile.login)}</g>`,
    `<g${enter(0.05)}>${label(W - M, 50, profile.facts.at(-1), { anchor: 'end', fill: C.gray })}</g>`,
  );

  // one <text> per letter so each can rise on its own
  let x = M - 5;
  [...name].forEach((ch, i) => {
    if (ch !== ' ') {
      out.push(`<text x="${n(x)}" y="${base}" font-size="${size}" font-weight="700" fill="${C.fg}"${enter(0.15 + i * 0.045)}>${esc(ch)}</text>`);
    }
    x += measure(ch, size, { bold: true, spacing: track });
  });

  const lineW = x - M + track;
  const sub = [profile.role, ...profile.facts.slice(0, -1)].join(' · ');
  out.push(
    `<g${enter(0.75, 'grow')}>${rect(M, base + 26, lineW, 4, C.red)}</g>`,
    `<g${enter(1.05)}>${text(M, base + 66, sub, { size: 22, fill: C.fg })}</g>`,
  );

  return svgDoc({
    width: W,
    height: H,
    title: name,
    desc: `${name}: ${sub}, ${profile.facts.at(-1)}.`,
    body: out.join('\n'),
  });
}
