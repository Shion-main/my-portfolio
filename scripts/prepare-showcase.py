"""Encode lightweight previews; full-resolution original captures remain intact."""
from pathlib import Path
from PIL import Image

source = Path(__file__).resolve().parents[1] / "public/media/showcase"
target = source / "previews"
target.mkdir(exist_ok=True)
count = 0
for path in sorted(source.glob("*.jpg")):
    with Image.open(path) as original:
        width = min(original.width, 960 if path.stem.endswith("-cover") else 720)
        height = round(original.height * width / original.width)
        original.resize((width, height), Image.Resampling.LANCZOS).save(
            target / f"{path.stem}.webp", "WEBP", quality=82, method=6
        )
        count += 1
print(f"Encoded {count} UI previews; original full-page captures preserved.")
