#!/usr/bin/env python3
"""Measure how each glyph of the embedded font fills its cell.

Every character becomes a 6-number "shape vector": ink coverage of a 2x3 grid
over the cell, exactly as the SVGs lay text out (cell = 0.6em x 1em,
baseline at 0.8em). The ASCII renderer matches image patches against these
vectors, so edges get drawn with glyphs that actually follow them.

Usage: python3 scripts/glyph-shapes.py > src/art/glyphs.json
Needs Pillow and the JetBrains Mono TTF installed on the system.
"""
import json
import sys

from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf'
EM = 240  # render size in px; the cell is 144 x 240
CHARS = " .,:;'`\"^~-_=+*<>!?|/\\()[]{}ilIjJtfrxvczsuonmwXYZUCLQ0OKVAHTNMWB8#%&@$"


def shape(font, ch):
    w, h = int(EM * 0.6), EM
    img = Image.new('L', (w, h), 0)
    # Pillow's anchor 'ls' = left/baseline, placed at 0.8em like the SVG rows
    ImageDraw.Draw(img).text((0, EM * 0.8), ch, font=font, fill=255, anchor='ls')
    px = img.load()
    vec = []
    for gy in range(3):
        for gx in range(2):
            x0, x1 = gx * w // 2, (gx + 1) * w // 2
            y0, y1 = gy * h // 3, (gy + 1) * h // 3
            ink = sum(px[x, y] for x in range(x0, x1) for y in range(y0, y1))
            vec.append(round(ink / (255 * (x1 - x0) * (y1 - y0)), 4))
    return vec


def main():
    font = ImageFont.truetype(FONT, EM)
    table = {ch: shape(font, ch) for ch in CHARS}
    json.dump(table, sys.stdout, ensure_ascii=False, separators=(',', ':'))
    sys.stdout.write('\n')


if __name__ == '__main__':
    main()
