// Panel 5 — experience log, then why.txt: what I believe about writing code.

import { fontFaces, svgDoc, esc } from '../lib/svg.mjs';
import { BASE_CSS, windowFrame } from '../lib/term.mjs';
import { Session } from '../lib/script.mjs';

const W = 1000;

export function xp({ jobs, why }) {
  const s = new Session({ width: W });
  s.cmd('cat ~/xp.log');
  for (const job of jobs) {
    s.out(`<tspan class="b key">${esc(job.when)}</tspan>  <tspan class="b">${esc(job.where)}</tspan><tspan class="dim"> · ${esc(job.role)}</tspan>`);
    for (const line of job.lines) s.out(`<tspan class="faint">│</tspan>  <tspan class="${line[1] ? 'dim' : ''}">${esc(line[0])}</tspan>${esc(line[1] ?? '')}`, { indent: 1 });
  }
  s.space(0.6);
  s.cmd('cat why.txt');
  // printed line by line, slow enough to be read as it appears
  for (const line of why) s.print(line, { gap: 0.35 });
  s.space(0.5);
  const end = s.end();

  const H = Math.ceil(end.height);
  return svgDoc({
    width: W,
    height: H,
    title: 'xp.log',
    desc: `${jobs.map((j) => `${j.when}: ${j.where}, ${j.role}`).join('; ')}. ${why.join(' ')}`,
    style: fontFaces({ bold: true }) + BASE_CSS + end.css,
    body: windowFrame({ width: W, height: H, title: 'hades@grajau: ~ — xp.log' }) + end.svg,
  });
}
