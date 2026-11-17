// ASCII koi, seen from above. A koi is a curved spine with a body profile,
// pectoral fins and a forked tail; every character cell is supersampled,
// shaded with a light from the upper left and coloured by the koi's pattern.
// `koiFrames` returns a few frames of the tail beat, drawn facing +x and
// centred on (0, 0) so the pond can move and rotate them along a path.

export const CW = 5.4; // cell width at 9px monospace (0.6em)
export const LH = 9; // line height

const PROFILE_U = [0, 0.04, 0.12, 0.25, 0.42, 0.6, 0.8, 0.93, 1];
const PROFILE_R = [0.42, 0.66, 0.9, 1, 0.95, 0.72, 0.42, 0.25, 0.2];
const LIGHT = norm([-0.35, -0.55, 0.76]);

// three tones per colour: shadow, mid, highlight
export const TONES = {
  white: ['#8f897e', '#cfc7b8', '#f7f2e8'],
  red: ['#8e2c19', '#d4442a', '#f6744b'],
  gold: ['#8a5a17', '#d68f2c', '#f7c566'],
  sumi: ['#2f3539', '#4d555b', '#737c83'],
  orange: ['#8c4214', '#e0702a', '#f9a25e'],
};

// varieties: base colour + patches in (u along body, v across body) space
export const VARIETIES = [
  { name: 'kohaku', base: 'white', patches: [['red', 0.1, 0, 0.08, 0.9], ['red', 0.34, -0.3, 0.12, 1], ['red', 0.6, 0.2, 0.1, 0.8], ['red', 0.82, -0.2, 0.06, 0.7]] },
  { name: 'yamabuki', base: 'gold', patches: [['white', 0.06, 0, 0.06, 1.3], ['white', 0.5, 0.4, 0.12, 0.6]] },
  { name: 'sanke', base: 'white', patches: [['red', 0.12, 0.1, 0.09, 0.9], ['red', 0.45, -0.25, 0.13, 0.9], ['sumi', 0.3, 0.55, 0.05, 0.4], ['sumi', 0.7, -0.4, 0.05, 0.5]] },
  { name: 'tancho', base: 'white', patches: [['red', 0.1, 0, 0.055, 0.55]] },
  { name: 'chagoi', base: 'orange', patches: [['gold', 0.4, 0, 0.3, 0.5]] },
];

function norm(v) {
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
}
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
function interp(x, xs, ys) {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1]);
  }
  return ys.at(-1);
}

/** What lies at point (x, y) of a koi of length L and half-width R. */
function sample(x, y, { L, R, phase, variety }) {
  const u = (L / 2 - x) / L; // 0 at the nose, 1 where the tail starts
  if (u < -0.02 || u > 1.3) return null;
  const bend = 0.09 * R * 4 * (u + 0.12) ** 2 * Math.sin(phase - 2.4 * u);
  const v = y - bend;
  const r = R * interp(u, PROFILE_U, PROFILE_R);

  if (u >= 0 && u <= 1 && Math.abs(v) < r) {
    const vn = v / r;
    const h = Math.sqrt(1 - vn * vn);
    const light = 0.18 + 0.82 * clamp(vn * LIGHT[1] + h * LIGHT[2] + 0.15 * LIGHT[0] * (0.5 - u), 0, 1);
    if (((u - 0.075) * L) ** 2 + (Math.abs(v) - 0.55 * r) ** 2 < 2.6 ** 2) return { kind: 'eye' };
    let color = variety.base;
    for (const [c, pu, pv, ru, rv] of variety.patches) {
      const wob = 0.2 * Math.sin(u * 41 + vn * 5 + pu * 11);
      if (((u - pu) / ru) ** 2 + ((vn - pv) / rv) ** 2 < 1 + wob) color = c;
    }
    return { kind: 'body', light, color };
  }

  const flap = 0.8 + 0.2 * Math.sin(phase * 2);
  const a = (u - 0.17) / 0.2;
  if (a > 0 && a < 1 && Math.abs(v) > r * 0.5 && Math.abs(v) < r + R * 0.85 * Math.sin(Math.PI * a) ** 0.8 * flap * (1 - 0.35 * a)) {
    return { kind: 'fin', color: variety.base };
  }
  const b = (u - 0.52) / 0.12;
  if (b > 0 && b < 1 && Math.abs(v) < r + R * 0.32 * Math.sin(Math.PI * b)) return { kind: 'fin', color: variety.base };
  const c = clamp((u - 0.95) / 0.33, 0, 1);
  if (u > 0.93 && u < 1.28 && Math.abs(v) < R * (0.2 + 1.05 * c ** 0.9) && !(u > 1.14 && Math.abs(v) < R * 0.95 * ((u - 1.14) / 0.14))) {
    return { kind: 'fin', color: variety.base };
  }
  return null;
}

/**
 * Frames of one koi as Map("row,col" → [char, colour]) plus the grid
 * offset that centres it on (0, 0).
 */
export function koiFrames({ length, variety, frames = 4 }) {
  const L = length;
  const R = L * 0.2;
  const half = { x: L * 0.85, y: R * 2.2 };
  const cols = Math.ceil((2 * half.x) / CW);
  const rows = Math.ceil((2 * half.y) / LH);
  const SX = 3;
  const SY = 4;
  const out = [];

  for (let f = 0; f < frames; f++) {
    const phase = (2 * Math.PI * f) / frames;
    const cells = new Map();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let body = 0, fin = 0, eye = 0, light = 0;
        const colors = {};
        let finColor;
        for (let i = 0; i < SX; i++) {
          for (let j = 0; j < SY; j++) {
            const x = -half.x + (col + (i + 0.5) / SX) * CW;
            const y = -half.y + (row + (j + 0.5) / SY) * LH;
            const s = sample(x, y, { L, R, phase, variety });
            if (!s) continue;
            if (s.kind === 'eye') eye++, body++;
            else if (s.kind === 'body') {
              body++;
              light += s.light;
              colors[s.color] = (colors[s.color] ?? 0) + 1;
            } else fin++, (finColor = s.color);
          }
        }
        const n = SX * SY;
        const key = `${row},${col}`;
        if (eye / n > 0.12) {
          cells.set(key, ['o', 'eye']);
        } else if (body / n >= 0.3) {
          const lit = light / Math.max(1, body - eye);
          const color = Object.entries(colors).sort((p, q) => q[1] - p[1])[0][0];
          const tone = TONES[color];
          const cover = body / n;
          if (cover < 0.75) cells.set(key, ['.:-=+'[Math.min(4, Math.floor(((cover - 0.3) / 0.45) * 5))], tone[clamp(Math.floor(lit * 3), 0, 2)]]);
          else cells.set(key, ['+*#%@'[Math.min(4, Math.floor(lit * 5))], tone[clamp(Math.floor(lit * 3.3), 0, 2)]]);
        } else if (fin / n > 0.22) {
          const tone = TONES[finColor];
          cells.set(key, ['.,:;'[Math.min(3, Math.floor((fin / n) * 4))], fin / n > 0.6 ? tone[1] : tone[0]]);
        }
      }
    }
    out.push(cells);
  }
  return { frames: out, x0: -half.x, y0: -half.y };
}
