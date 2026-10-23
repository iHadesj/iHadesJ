// Shared look & motion for every console panel.
//
// Rule of thumb for the animations: an element's plain CSS is its *final*
// state and the animation only plays the intro. So with motion disabled
// (prefers-reduced-motion, or a renderer without CSS animation) every panel
// still shows its finished frame.

import { esc, n } from './svg.mjs';

export const FONT = 16; // body text size, in viewBox units
export const CW = FONT * 0.6; // monospace advance
export const LH = 26; // line height of body text
export const PAD = 24; // inner padding of a window
export const BAR = 34; // title bar height

export const USER = 'hades';
export const HOST = 'grajau';

export const BASE_CSS = `
text{font-family:JBM,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:${FONT}px;fill:#ececec;white-space:pre}
.b{font-weight:700}.dim{fill:#a6a6a6}.faint{fill:#6e6e6e}
.ok{fill:#5af78e}.path{fill:#57c7ff}.key{fill:#f3c969}.dir{fill:#57c7ff;font-weight:700}
.chrome{fill:#8a8a8a;font-size:13.5px}
@keyframes on{from{opacity:0}to{opacity:1}}
@keyframes hold{from,to{opacity:1}}
@keyframes pop{0%{opacity:0}35%{opacity:1}55%{opacity:.3}75%{opacity:1}100%{opacity:1}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes type{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.typer{transform:scaleX(0)}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

/** CSS `animation` shorthand list as an inline style attribute. */
export const anim = (...parts) => ` style="animation:${parts.filter(Boolean).join(',')}"`;
export const at = (t) => `${n(t, 3)}s`;

/** Window: black body, hairline border, title bar with three hollow dots. */
export function windowFrame({ width, height, title }) {
  return [
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="10" fill="#000" stroke="#333"/>`,
    `<path d="M1 ${BAR}H${width - 1}" stroke="#1d1d1d"/>`,
    [0, 1, 2].map((k) => `<circle cx="${20 + k * 17}" cy="${BAR / 2}" r="5.2" fill="none" stroke="#4a4a4a" stroke-width="1.2"/>`).join(''),
    `<text x="${width / 2}" y="${BAR / 2 + 5}" text-anchor="middle" class="chrome">${esc(title)}</text>`,
  ].join('');
}

/**
 * Typing effect for one line: the text is drawn whole and a black occluder
 * shrinks towards its right edge in N steps, revealing one char per step.
 * A caret rides the edge while typing. Returns svg + the time typing ends.
 */
let caretId = 0;
export function typed({ x, y, text, start, cps = 32, cls = '', size = FONT, caret = true }) {
  const cw = size * 0.6;
  const chars = [...text].length;
  const dur = chars / cps;
  const w = chars * cw + 2;
  const top = y - size * 0.95;
  const h = size * 1.3;
  const id = `c${caretId++}`;
  const parts = [
    `<text x="${n(x)}" y="${n(y)}"${cls ? ` class="${cls}"` : ''}>${esc(text)}</text>`,
    `<rect class="typer" x="${n(x - 1)}" y="${n(top)}" width="${n(w)}" height="${n(h)}" fill="#000"` +
      ` style="transform-origin:${n(x + w - 1)}px 0;animation:type ${at(dur)} steps(${chars},end) ${at(start)} backwards"/>`,
  ];
  let css = '';
  if (caret) {
    css = `@keyframes ${id}{from{transform:translateX(0)}to{transform:translateX(${n(chars * cw)}px)}}`;
    parts.push(
      `<rect x="${n(x)}" y="${n(top + 1)}" width="${n(cw)}" height="${n(size * 1.15)}" fill="#ececec" opacity="0"` +
        ` style="animation:hold ${at(dur + 0.25)} linear ${at(start - 0.25)},${id} ${at(dur)} steps(${chars},end) ${at(start)} backwards"/>`,
    );
  }
  return { svg: parts.join(''), css, end: start + dur };
}

/** "user@host:~$ " prompt; returns the svg and where the command starts. */
export function prompt({ x, y, path = '~', cls = '' }) {
  const head = `${USER}@${HOST}`;
  const tail = `:${path}$ `;
  return {
    svg:
      `<text x="${n(x)}" y="${n(y)}"${cls ? ` class="${cls}"` : ''}>` +
      `<tspan class="b ok">${head}</tspan><tspan class="dim">:</tspan><tspan class="b path">${esc(path)}</tspan><tspan class="dim">$ </tspan></text>`,
    width: (head.length + tail.length) * CW,
  };
}

/** Blinking block cursor that shows up at `start`. */
export function cursor({ x, y, start = 0, size = FONT }) {
  return `<rect x="${n(x)}" y="${n(y - size * 0.95 + 1)}" width="${n(size * 0.6)}" height="${n(size * 1.15)}" fill="#ececec"` +
    anim(`on .01s ${at(start)} backwards`, `blink 1.06s steps(1) ${at(start)} infinite`) + '/>';
}
