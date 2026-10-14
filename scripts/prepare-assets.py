"""Optimize project-owned source captures without altering their contents."""
from pathlib import Path
from PIL import Image
import shutil

root = Path(__file__).resolve().parents[1]
out = root / 'public' / 'media'
out.mkdir(parents=True, exist_ok=True)
space = Path('C:/Users/joshu_mnu8z3u/Documents/ChatGPT/Space-Arabica')
korte = Path('C:/Users/joshu_mnu8z3u/Downloads/Korte/Korte')
sources = {
    'space-home': space / 'planning/portfolio/polished/screenshots/home-desktop.png',
    'space-mobile': space / 'planning/portfolio/polished/screenshots/home-mobile.png',
    'space-menu': space / 'planning/portfolio/polished/screenshots/full-menu-desktop.png',
    'space-room': space / 'local-site/assets/window-seating.webp',
    'space-cup': space / 'local-site/assets/timeless-americano-cup.webp',
    'space-rose': space / 'local-site/assets/desert-rose-latte-cup.webp',
    'korte-live': korte / 'portfolio/korte-case-study-2026-10-12/reference-live-desktop.png',
    'korte-mobile': korte / 'portfolio/korte-case-study-2026-10-12/reference-live-mobile.png',
    'korte-quick': korte / 'portfolio/korte-case-study-2026-10-12/reference-quick-desktop.png',
    'korte-organizer': root / 'public/Images/Projects/Korte/organizer-dashboard.png',
    'korte-meet': root / 'public/Images/Projects/Korte/share-meet.png',
    'gallery': Path('C:/Users/joshu_mnu8z3u/.codex/generated_images/01a130a3-709e-76d2-8294-332121ad13ad/exec-4cf80f29-b0ab-4a15-a9d0-09480ac5e209.png'),
}
for name, src in sources.items():
    im = Image.open(src)
    im.thumbnail((1680, 2100), Image.Resampling.LANCZOS)
    im.save(out / f'{name}.webp', 'WEBP', quality=86, method=6)
    print(name, im.size, (out / f'{name}.webp').stat().st_size)
shutil.copy2(root / 'public/Images/Projects/Korte/korte-logo.svg', out / 'korte-logo.svg')
shutil.copy2(space / 'local-site/assets/space-arabica-logo.svg', out / 'space-logo.svg')
