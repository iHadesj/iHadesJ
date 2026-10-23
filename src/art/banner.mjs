// Big terminal lettering in the style of figlet's "ANSI Shadow" font:
// solid blocks with a box-drawing drop shadow. Only the letters this
// profile needs are defined; add more rows here if the name changes.

const FONT = {
  A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
  D: ['██████╗ ', '██╔══██╗', '██║  ██║', '██║  ██║', '██████╔╝', '╚═════╝ '],
  E: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
  F: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '██║     ', '╚═╝     '],
  I: ['██╗', '██║', '██║', '██║', '██║', '╚═╝'],
  R: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██║  ██║', '╚═╝  ╚═╝'],
  U: ['██╗   ██╗', '██║   ██║', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
  ' ': ['   ', '   ', '   ', '   ', '   ', '   '],
};

/** Text → 6 rows of block art. */
export function banner(text) {
  const letters = [...text.toUpperCase()].map((ch) => {
    if (!FONT[ch]) throw new Error(`banner: no glyph for "${ch}" (add it to src/art/banner.mjs)`);
    return FONT[ch];
  });
  return Array.from({ length: 6 }, (_, r) => letters.map((l) => l[r]).join(''));
}

/** Split banner rows into the solid face (█) and its shadow (box drawing). */
export function bannerLayers(rows) {
  return {
    face: rows.map((row) => row.replace(/[^█ ]/g, ' ')),
    shadow: rows.map((row) => row.replace(/█/g, ' ')),
  };
}
