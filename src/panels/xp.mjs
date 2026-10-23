// Panel 5 — experience log + how I take a project from idea to evolution,
// shown as a CI-style pipeline that keeps running on a loop.

import { fontFaces, svgDoc, esc, n } from '../lib/svg.mjs';
import { BASE_CSS, CW, PAD, windowFrame, anim, at } from '../lib/term.mjs';
import { Session } from '../lib/script.mjs';

const W = 1000;
const STEP = 1.1; // seconds each pipeline stage "runs"

function pipeline(stages) {
  return (y, t) => {
    const period = stages.length * STEP + 2.6; // run every stage, rest, start over
    const pct = (s) => `${n((s / period) * 100, 3)}%`;
    const css = [];
    const parts = [];
    let x = PAD + 2 * CW;
    stages.forEach((name, k) => {
      const run = k * STEP; // starts running
      const done = (k + 1) * STEP; // turns green (well, white)
      const end = stages.length * STEP + 2; // everything resets after a short rest
      // three overlaid states, each with its own keyframes on the shared clock;
      // steps(1) holds every keyframe until the next one (on/off switches)
      const frames = (changes) => changes.map(([s, o]) => `${pct(s)}{opacity:${o}}`).join('');
      css.push(
        `@keyframes p${k}{${frames(run > 0 ? [[0, 1], [run, 0]] : [[0, 0]])}}`,
        `@keyframes r${k}{${frames([[0, 0], [run, 1], [done, 0]])}}`,
        `@keyframes d${k}{${frames([[0, 0], [done, 1], [end, 0]])}}`,
      );
      const loop = (id) => anim(`${id} ${at(period)} steps(1,end) ${at(t)} infinite backwards`);
      const label = esc(name);
      parts.push(
        // final (static) state = all done; the loop plays over it
        `<text x="${n(x)}" y="${n(y)}" class="pd"${loop(`d${k}`)}>[✓] ${label}</text>`,
        `<text x="${n(x)}" y="${n(y)}" class="pp"${loop(`p${k}`)} opacity="0">[ ] ${label}</text>`,
        `<text x="${n(x)}" y="${n(y)}" class="pr"${loop(`r${k}`)} opacity="0">[<tspan class="spin">*</tspan>] ${label}</text>`,
      );
      x += (name.length + 4) * CW;
      if (k < stages.length - 1) {
        parts.push(`<text x="${n(x + CW * 0.5)}" y="${n(y)}" class="faint">→</text>`);
        x += 2.5 * CW;
      }
    });
    return { svg: parts.join(''), css: css.join(''), height: 30, duration: 0.3 };
  };
}

export function xp({ jobs, stages, notes }) {
  const s = new Session({ width: W });
  s.cmd('cat ~/xp.log');
  for (const job of jobs) {
    s.out(`<tspan class="b key">${esc(job.when)}</tspan>  <tspan class="b">${esc(job.where)}</tspan><tspan class="dim"> · ${esc(job.role)}</tspan>`);
    for (const line of job.lines) s.out(`<tspan class="faint">│</tspan>  <tspan class="${line[1] ? 'dim' : ''}">${esc(line[0])}</tspan>${esc(line[1] ?? '')}`, { indent: 1 });
  }
  s.space(0.6);
  s.cmd('./pipeline --watch');
  s.block(pipeline(stages));
  for (const note of notes) s.out(`<tspan class="faint">#</tspan> ${esc(note)}`, { cls: 'dim', gap: 0.1 });
  s.space(0.5);
  const end = s.end();

  const H = Math.ceil(end.height);
  const style = fontFaces({ bold: true }) + BASE_CSS + `
.pd{fill:#5af78e}.pp{fill:#6e6e6e}.pr{fill:#f3c969;font-weight:700}
.spin{animation:blink .5s steps(1) infinite}
${end.css}`;
  return svgDoc({
    width: W,
    height: H,
    title: 'xp.log',
    desc: `${jobs.map((j) => `${j.when}: ${j.where}, ${j.role}`).join('; ')}. Fluxo: ${stages.join(' → ')}.`,
    style,
    body: windowFrame({ width: W, height: H, title: 'hades@grajau: ~ — xp.log' }) + end.svg,
  });
}
