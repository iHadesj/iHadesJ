#!/usr/bin/env sh
# Rebuilds the embedded font subsets (needs: pip install fonttools brotli).
# The SVGs embed these files as base64, so keep the character set small:
# printable ASCII, Latin-1 (Portuguese accents), box drawing + block
# elements, and the handful of symbols the panels use.
set -e
SRC=${1:-/usr/share/fonts/truetype/jetbrains-mono}
OUT=$(dirname "$0")/../src/fonts
CHARS=$(python3 -c "
import sys
s = ''.join(chr(c) for c in range(0x20, 0x7f))
s += ''.join(chr(c) for c in range(0xa0, 0x100))
s += ''.join(chr(c) for c in range(0x2500, 0x25a0))
s += '■□▪▫●○◆◇•·∙▲△▶▷►▸▹◀◁◂←↑→↓↗↘✓✗×≈≠≤≥λ∞…—–“”‘’°±'
sys.stdout.write(s)")
for weight in Regular Bold; do
  python3 -m fontTools.subset "$SRC/JetBrainsMono-$weight.ttf" \
    --text="$CHARS" --flavor=woff2 --layout-features='' --no-hinting --desubroutinize \
    --output-file="$OUT/JetBrainsMono-$weight.subset.woff2"
done
# what actually made it into both subsets; the build checks every panel
# against this list so no glyph silently falls back to a system font
python3 -c "
import sys
from fontTools.ttLib import TTFont
maps = [set(TTFont(f'$OUT/JetBrainsMono-{w}.subset.woff2').getBestCmap()) for w in ('Regular', 'Bold')]
sys.stdout.write(''.join(chr(c) for c in sorted(maps[0] & maps[1])))" > "$OUT/charset.txt"
ls -l "$OUT"/*.woff2 "$OUT/charset.txt"
