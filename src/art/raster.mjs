// A small SVG path rasterizer: tokenize → flatten (lines, béziers, arcs) →
// nonzero scanline fill. Enough to turn brand icons into ASCII at build time.

import { glyphSet, matchGlyph } from './glyphs.mjs';

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;

function tokenize(d) {
  const tokens = [];
  let cmd = '';
  let arg = 0;
  for (let i = 0; i < d.length; ) {
    const ch = d[i];
    if (ch === ' ' || ch === ',' || ch === '\n' || ch === '\t') { i++; continue; }
    if (/[MmLlHhVvCcSsQqTtAaZz]/.test(ch)) { tokens.push(ch); cmd = ch; arg = 0; i++; continue; }
    // arc flags are single digits and may be written without separators ("011")
    if ((cmd === 'a' || cmd === 'A') && (arg % 7 === 3 || arg % 7 === 4)) {
      tokens.push(ch === '1' ? 1 : 0); arg++; i++; continue;
    }
    const m = NUMBER.exec(d.slice(i, i + 32));
    if (!m) throw new Error(`bad path data near "${d.slice(i, i + 12)}"`);
    tokens.push(parseFloat(m[0]));
    arg++;
    i += m[0].length;
  }
  return tokens;
}

// SVG arc (endpoint form) → points, following the SVG spec's appendix F.6.
function arc(x1, y1, rx, ry, deg, large, sweep, x2, y2, steps) {
  if (!rx || !ry) return [[x2, y2]];
  rx = Math.abs(rx); ry = Math.abs(ry);
  const phi = (deg * Math.PI) / 180;
  const cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const xp = cos * dx + sin * dy;
  const yp = -sin * dx + cos * dy;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lambda > 1) { rx *= Math.sqrt(lambda); ry *= Math.sqrt(lambda); }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const coef = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * yp) / ry;
  const cyp = (-coef * ry * xp) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const angle = (ux, uy, vx, vy) => {
    const a = Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)))));
    return ux * vy - uy * vx < 0 ? -a : a;
  };
  const t1 = angle(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let dt = angle((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry) % (2 * Math.PI);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(2, Math.ceil((Math.abs(dt) / Math.PI) * steps));
  const pts = [];
  for (let k = 1; k <= n; k++) {
    const t = t1 + (dt * k) / n;
    pts.push([cos * rx * Math.cos(t) - sin * ry * Math.sin(t) + cx, sin * rx * Math.cos(t) + cos * ry * Math.sin(t) + cy]);
  }
  return pts;
}

const bezier = (p0, p1, p2, p3, steps) =>
  Array.from({ length: steps }, (_, k) => {
    const t = (k + 1) / steps, u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  });

/** Path data → list of polygons (each an array of [x, y]). */
export function pathToPolygons(d, steps = 14) {
  const t = tokenize(d);
  const polys = [];
  let poly = null;
  let x = 0, y = 0, sx = 0, sy = 0; // pen, subpath start
  let ctrl = null; // last control point + curve family ('C' or 'Q'), for S/T
  let cmd = '';
  let i = 0;
  const num = () => t[i++];
  const ensure = () => { if (!poly) polys.push((poly = [[x, y]])); };
  const to = (pts) => { ensure(); poly.push(...pts); [x, y] = pts.at(-1); };

  while (i < t.length) {
    if (typeof t[i] === 'string') cmd = t[i++];
    else if (cmd === 'M') cmd = 'L';
    else if (cmd === 'm') cmd = 'l';
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    const C = cmd.toUpperCase();
    let next = null;
    switch (C) {
      case 'M':
        x = sx = ox + num(); y = sy = oy + num();
        polys.push((poly = [[x, y]]));
        break;
      case 'L': to([[ox + num(), oy + num()]]); break;
      case 'H': to([[ox + num(), y]]); break;
      case 'V': to([[x, oy + num()]]); break;
      case 'C': {
        const c1 = [ox + num(), oy + num()], c2 = [ox + num(), oy + num()], p = [ox + num(), oy + num()];
        to(bezier([x, y], c1, c2, p, steps)); next = c2; break;
      }
      case 'S': {
        const c1 = ctrl?.family === 'C' ? [2 * x - ctrl.at[0], 2 * y - ctrl.at[1]] : [x, y];
        const c2 = [ox + num(), oy + num()], p = [ox + num(), oy + num()];
        to(bezier([x, y], c1, c2, p, steps)); next = c2; break;
      }
      case 'Q': {
        const q = [ox + num(), oy + num()], p = [ox + num(), oy + num()];
        const c1 = [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y)];
        const c2 = [p[0] + (2 / 3) * (q[0] - p[0]), p[1] + (2 / 3) * (q[1] - p[1])];
        to(bezier([x, y], c1, c2, p, steps)); next = q; break;
      }
      case 'T': {
        const q = ctrl?.family === 'Q' ? [2 * x - ctrl.at[0], 2 * y - ctrl.at[1]] : [x, y];
        const p = [ox + num(), oy + num()];
        const c1 = [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y)];
        const c2 = [p[0] + (2 / 3) * (q[0] - p[0]), p[1] + (2 / 3) * (q[1] - p[1])];
        to(bezier([x, y], c1, c2, p, steps)); next = q; break;
      }
      case 'A': {
        const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
        to(arc(x, y, rx, ry, rot, large, sweep, ox + num(), oy + num(), steps));
        break;
      }
      case 'Z':
        x = sx; y = sy; poly = null;
        break;
      default:
        throw new Error(`unsupported path command ${cmd}`);
    }
    // S reflects only after C/S, T only after Q/T
    ctrl = next ? { family: 'CS'.includes(C) ? 'C' : 'Q', at: next } : null;
  }
  return polys;
}

/** Nonzero fill of polygons into a width×height 0/1 grid, sampling pixel centres. */
export function fill(polys, width, height, { sx = 1, sy = 1, ox = 0, oy = 0 } = {}) {
  const edges = [];
  for (const p of polys) {
    for (let k = 0; k < p.length; k++) {
      const a = p[k], b = p[(k + 1) % p.length];
      if (a[1] !== b[1]) edges.push([a[0] * sx + ox, a[1] * sy + oy, b[0] * sx + ox, b[1] * sy + oy]);
    }
  }
  const out = new Uint8Array(width * height);
  for (let j = 0; j < height; j++) {
    const yy = j + 0.5;
    const hits = [];
    for (const [x0, y0, x1, y1] of edges) {
      if ((y0 <= yy && y1 > yy) || (y1 <= yy && y0 > yy)) {
        hits.push([x0 + ((yy - y0) / (y1 - y0)) * (x1 - x0), y1 > y0 ? 1 : -1]);
      }
    }
    hits.sort((a, b) => a[0] - b[0]);
    let winding = 0;
    let h = 0;
    for (let i = 0; i < width; i++) {
      while (h < hits.length && hits[h][0] <= i + 0.5) winding += hits[h++][1];
      if (winding !== 0) out[j * width + i] = 1;
    }
  }
  return out;
}

/**
 * A 24×24 icon as ASCII inside cols×rows cells (cell = 0.6em × 1em).
 * Returns the rows as strings plus a per-cell coverage map.
 */
/** Grow a 0/1 grid by `r` samples (thin strokes survive the downsampling). */
function dilate(grid, w, h, r) {
  if (!r) return grid;
  const out = new Uint8Array(grid.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!grid[y * w + x]) continue;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < w && yy < h && dx * dx + dy * dy <= r * r + r) out[yy * w + xx] = 1;
        }
      }
    }
  }
  return out;
}

export function iconToAscii(d, { cols, rows, sub = [4, 6], margin = 0.04, sharpen = 1.8, bold = 0, chars } = {}) {
  const [px, py] = sub; // samples per cell
  const W = cols * px, H = rows * py;
  // physical size of the icon in em, kept square on screen
  const size = Math.min(cols * 0.6, rows) * (1 - 2 * margin);
  const sx = (size / 24) * (px / 0.6); // samples per icon unit, horizontally
  const sy = (size / 24) * py; // and vertically
  const ox = (W - 24 * sx) / 2, oy = (H - 24 * sy) / 2;
  const grid = dilate(fill(pathToPolygons(d), W, H, { sx, sy, ox, oy }), W, H, bold);

  const set = glyphSet(chars);
  const lines = [];
  const coverage = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      const shape = [0, 0, 0, 0, 0, 0];
      for (let y = 0; y < py; y++) {
        for (let x = 0; x < px; x++) {
          if (grid[(r * py + y) * W + c * px + x]) shape[Math.floor((y * 3) / py) * 2 + Math.floor((x * 2) / px)]++;
        }
      }
      const area = (px / 2) * (py / 3);
      const s = shape.map((v) => v / area);
      coverage.push(s.reduce((a, b) => a + b, 0) / 6);
      line += matchGlyph(s, set, { sharpen });
    }
    lines.push(line);
  }
  return { lines, coverage };
}
