"""Shrink the icon and badge PNGs in place (lossless-looking palette quantisation).

    python3 scripts/optimize-icons.py

The icon packs were exported as 32-bit RGBA PNGs (~15 KB each); a page shows
40+ of them, so they cost more than the photos. Quantising to a 256-colour
palette keeps the flat artwork visually identical (mean colour error < 5/255)
and cuts each file to ~4 KB. Idempotent: already-palettised files are skipped.
Requires Pillow.
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")


EXTRA_DIRS = {"icons", "badges"}


def optimise():
    before = after = count = skipped = 0
    for root, dirs, files in os.walk(PUB):
        if os.path.basename(root) not in EXTRA_DIRS:
            continue
        for name in files:
            if not name.lower().endswith(".png"):
                continue
            path = os.path.join(root, name)
            image = Image.open(path)
            if image.mode == "P":
                skipped += 1
                continue
            size = os.path.getsize(path)
            quantised = image.convert("RGBA").quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
            quantised.save(path, "PNG", optimize=True)
            before += size
            after += os.path.getsize(path)
            count += 1
    print(f"{count} icons quantised ({skipped} already done): {before // 1024} KB -> {after // 1024} KB")


if __name__ == "__main__":
    optimise()
