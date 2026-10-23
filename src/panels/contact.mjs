// Panel 6 — contact: the session says goodbye, and small console buttons
// (separate images, so each one can be a link) sit right under it.

import { fontFaces, svgDoc, esc, n } from '../lib/svg.mjs';
import { BASE_CSS, windowFrame, anim, at } from '../lib/term.mjs';
import { Session } from '../lib/script.mjs';

const W = 1000;

export function goodbye({ pitch }) {
  const s = new Session({ width: W });
  s.cmd('./contato');
  s.out(`${esc(pitch)} <tspan class="b">↓</tspan>`);
  s.space(0.4);
  s.cmd('exit', { pause: 0.4 });
  s.print('logout', { cls: 'dim', gap: 0.35 });
  s.out('<tspan class="faint">[conexão com grajau encerrada]</tspan>');
  const end = s.end({ showPrompt: false }); // logged out: no prompt, just the cursor
  const H = Math.ceil(end.height);
  return svgDoc({
    width: W,
    height: H,
    title: 'contato',
    desc: pitch,
    style: fontFaces({ bold: true }) + BASE_CSS + end.css,
    body: windowFrame({ width: W, height: H, title: 'hades@grajau: ~ — contato' }) + end.svg,
  });
}

/** A console-style button: `> label ↗` with a blinking caret. */
export function button({ label, index = 0 }) {
  const size = 14;
  const cw = size * 0.6;
  const w = Math.ceil((label.length + 7) * cw + 28);
  const h = 44;
  const textW = (label.length + 4) * cw;
  const x = (w - textW - cw) / 2;
  const blink = `blink 1.06s steps(1) ${at(0.4 + index * 0.18)} infinite`;
  const body = [
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="8" fill="#000" stroke="#3a3a3a"/>`,
    `<text x="${n(x)}" y="28"><tspan class="dim">&gt;</tspan> <tspan class="b">${esc(label)}</tspan> <tspan class="dim">↗</tspan></text>`,
    `<rect x="${n(x + textW)}" y="16" width="${n(cw)}" height="16" fill="#ececec"${anim(blink)}/>`,
  ].join('');
  return svgDoc({
    width: w,
    height: h,
    title: label,
    desc: `link: ${label}`,
    style: fontFaces({ bold: true }) + BASE_CSS + `text{font-size:${size}px}`,
    body,
  });
}
