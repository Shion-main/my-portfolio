"""Encode full-resolution UI captures for delivery; preserve original pixels/files."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
media = root / "public/media"
manifest = json.loads((media / "bento/provenance.json").read_text(encoding="utf-8"))
output = media / "bento/previews"
output.mkdir(exist_ok=True)
before = after = 0
for screen in manifest["screens"]:
    source = root / "public" / screen["file"]
    target = output / (screen["id"] + ".webp")
    with Image.open(source) as image:
        image.save(target, "WEBP", quality=90, method=6)
    before += source.stat().st_size
    after += target.stat().st_size
for source in (media / "korte-case").glob("*.png"):
    with Image.open(source) as image:
        image.save(source.with_suffix(".webp"), "WEBP", quality=90, method=6)
print(f"20 bento images: {before:,} to {after:,} bytes ({(1-after/before)*100:.1f}% smaller); native dimensions preserved.")
