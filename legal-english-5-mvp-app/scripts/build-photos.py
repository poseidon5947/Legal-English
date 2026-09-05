"""Build responsive WebP variants for the editorial photos.

    python3 scripts/build-photos.py            # only missing variants
    python3 scripts/build-photos.py --force    # rebuild everything

For every JPG in the SOURCES folders this writes public/<dir>/w/<name>-<width>.webp
(160 / 480 / 800 / 1200 px, never upscaled) and refreshes lib/photo-manifest.json,
which components/photo.tsx uses to emit srcset/sizes. Run it after adding a photo.
Requires Pillow (pip install pillow).
"""
import json
import os
import sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
SOURCES = ["home-assets/photos", "home-assets/hero", "auth-assets/backgrounds"]
WIDTHS = [160, 480, 800, 1200]
QUALITY = {160: 70, 480: 72, 800: 72, 1200: 70}
FORCE = "--force" in sys.argv


def build():
    manifest = {}
    jpg_bytes = webp_bytes = 0
    for rel in SOURCES:
        src_dir = os.path.join(PUB, rel)
        if not os.path.isdir(src_dir):
            continue
        out_dir = os.path.join(src_dir, "w")
        os.makedirs(out_dir, exist_ok=True)
        for name_ext in sorted(os.listdir(src_dir)):
            if not name_ext.lower().endswith((".jpg", ".jpeg")):
                continue
            path = os.path.join(src_dir, name_ext)
            image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
            width, height = image.size
            name = os.path.splitext(name_ext)[0]
            widths = []
            for target in WIDTHS:
                if target > width:
                    if widths and widths[-1] == width:
                        continue
                    target = width
                out = os.path.join(out_dir, f"{name}-{target}.webp")
                if FORCE or not os.path.exists(out):
                    resized = image if target == width else image.resize((target, round(height * target / width)), Image.LANCZOS)
                    resized.save(out, "WEBP", quality=QUALITY.get(target, 72), method=6)
                widths.append(target)
                webp_bytes += os.path.getsize(out)
            jpg_bytes += os.path.getsize(path)
            manifest[f"/{rel}/{name_ext}"] = {"w": sorted(set(widths)), "ar": round(width / height, 4)}
    with open(os.path.join(ROOT, "lib", "photo-manifest.json"), "w", encoding="utf8") as handle:
        json.dump(manifest, handle, indent=1, sort_keys=True)
        handle.write("\n")
    print(f"{len(manifest)} photos · JPG {jpg_bytes // 1024} KB · all WebP variants {webp_bytes // 1024} KB")


if __name__ == "__main__":
    build()
