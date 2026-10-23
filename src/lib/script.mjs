// A tiny "terminal session" builder: lays lines out top to bottom and keeps
// a clock, so a panel reads like a script — type a command, print output,
// type the next one — and the timings follow automatically.

import { esc, n } from './svg.mjs';
import { CW, LH, PAD, BAR, typed, prompt, cursor, anim, at } from './term.mjs';

export class Session {
  constructor({ width, x = PAD, y = BAR + 34, t = 0.45, cps = 30 }) {
    Object.assign(this, { width, x, y, t, cps });
    this.parts = [];
    this.css = [];
  }

  /** Prompt appears, command gets typed, clock moves to the end of typing. */
  cmd(text, { pause = 0.3, path = '~' } = {}) {
    const p = prompt({ x: this.x, y: this.y, path });
    const line = typed({ x: this.x + p.width, y: this.y, text, start: this.t + 0.25, cps: this.cps });
    this.parts.push(`<g${anim(`on .01s ${at(this.t)} backwards`)}>${p.svg}</g>`, line.svg);
    this.css.push(line.css);
    this.t = line.end + pause;
    this.y += LH;
    return this;
  }

  /** One line of output. `inner` is raw SVG text content (tspans allowed). */
  out(inner, { indent = 0, gap = 0.06, cls = '' } = {}) {
    this.parts.push(
      `<text x="${n(this.x + indent * CW)}" y="${n(this.y)}"${cls ? ` class="${cls}"` : ''}${anim(`pop .32s ${at(this.t)} backwards`)}>${inner}</text>`,
    );
    this.t += gap;
    this.y += LH;
    return this;
  }

  /** Plain text output helper: escapes for you. */
  print(text, opts) {
    return this.out(esc(text), opts);
  }

  /** Key/value rows: dim key column, bright value. */
  table(rows, { keyWidth = 11, indent = 2 } = {}) {
    for (const [k, v] of rows) {
      this.out(`<tspan class="key">${esc(k.padEnd(keyWidth))}</tspan>${esc(v)}`, { indent });
    }
    return this;
  }

  space(lines = 0.6) {
    this.y += LH * lines;
    return this;
  }

  /** Free-form block: render(y, t) returns { svg, height, duration }. */
  block(render) {
    const b = render(this.y, this.t);
    this.parts.push(b.svg);
    if (b.css) this.css.push(b.css);
    this.y += b.height;
    this.t += b.duration ?? 0;
    return this;
  }

  wait(seconds) {
    this.t += seconds;
    return this;
  }

  /**
   * Final prompt with a blinking cursor (or just the cursor, after a logout);
   * returns the finished pieces.
   */
  end({ bottom = 18, showPrompt = true } = {}) {
    let x = this.x;
    if (showPrompt) {
      const p = prompt({ x: this.x, y: this.y });
      this.parts.push(`<g${anim(`on .01s ${at(this.t)} backwards`)}>${p.svg}</g>`);
      x += p.width;
    }
    this.parts.push(cursor({ x, y: this.y, start: this.t }));
    return { svg: this.parts.join('\n'), css: this.css.join(''), height: this.y + bottom, end: this.t };
  }
}
