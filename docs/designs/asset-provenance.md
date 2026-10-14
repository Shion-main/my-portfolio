# Asset provenance

All project screens are optimized copies of existing captures. They are not generated interfaces. The source codebases and local evidence notes are the basis for the project descriptions. Sole design/development ownership was confirmed directly by Joshua on 2026-10-13.

The current personal logo, `public/media/shion-monogram.svg`, is a vector trace of Joshua's supplied `Minimal Black JS Monogram Logo.png` (15 October 2026). The PNG's alpha silhouette was traced into editable paths, preserving the JS letterforms; no raster image is embedded. The favicon uses those same paths on an ink background. Browser raster comparison measured 99.38% silhouette overlap at the source resolution.

| Portfolio asset | Source |
| --- | --- |
| `public/media/space-home.webp`, `space-mobile.webp`, `space-menu.webp` | Space-Arabica `planning/portfolio/polished/screenshots/` home desktop/mobile and full-menu desktop captures |
| `space-cup.webp`, `space-rose.webp`, `space-room.webp`, `space-logo.svg` | Space-Arabica `local-site/assets/` original photographic and logo assets |
| `korte-live.webp`, `korte-mobile.webp`, `korte-quick.webp` | Korte `portfolio/korte-case-study-2026-10-12/` reference captures from the inspected anonymous local flow; synthetic names documented in `RESEARCH-AND-EVIDENCE.md` |
| `korte-organizer.webp`, `korte-meet.webp`, `korte-logo.svg` | Existing portfolio `public/Images/Projects/Korte/` assets |
| `gallery.webp` | Original built-in image generation, 2026-10-13; imagined portfolio architecture, not a real project location |

`scripts/prepare-assets.py` records absolute source paths, preserves image content/aspect ratios, and optimizes resolution/encoding for web delivery. Originals remain in place. The built-in generated source is `C:/Users/joshu_mnu8z3u/.codex/generated_images/01a130a3-709e-76d2-8294-332121ad13ad/exec-4cf80f29-b0ab-4a15-a9d0-09480ac5e209.png`; the project consumes the saved workspace copy at `public/media/gallery.webp`.

## Exact generation prompt

Use case: stylized-concept. Asset type: original architectural background for Joshua Sabuero's dark cinematic web-design portfolio, also used as the static accessible fallback behind HTML text. Create an exceptionally refined, photoreal architectural art-direction image, widescreen landscape 16:9. A silent gallery made of charcoal black matte stone and brushed pewter. On the RIGHT HALF is one substantial tall open arch with a thin warm amber light tracing its inner reveal, and beyond it a second thinner silver rectangular doorway at a different depth. Real thickness and softly grazing light, faint floor reflections, deep perspective, elegant severe architectural minimalism. Left 45 percent is almost empty smooth near-black space for large white editorial typography that will be added in HTML. Camera at eye height with a slight three-quarter view toward the opening. Warm amber at the arch, a subtle cool blue-gray glow far behind. Main palette ink #101116, graphite, warm amber #C18B3E, muted silver #BEC6D8. Premium still from an architectural film, restrained, highly realistic materials, sculptural negative space. No people, no furniture, no plants, no products, no cups, no screens, no logos, no text, no letters, no watermark, no neon sci-fi tunnel, no purple gradients, no particles. This represents an imaginary portfolio gallery, not either project's real location.

Mode: built-in `image_gen` tool, opaque background. No CLI/API fallback was used.

## Content evidence checked

- Space-Arabica `local-site/theatre.js` includes reduced-motion, keyboard, and pointer controls. Existing website/portfolio documentation and real screenshots support the six-page structure and responsive menu story.
- Korte `src/components/meet-session/LiveSession.tsx` exposes Courts, Up next, and Roster navigation. Current-state documentation identifies local session authority as the default; the portfolio does not promise deployed cross-device synchronization.
- No invented adoption statistics, testimonials, dates of client engagement, or research findings appear in the new pages.
