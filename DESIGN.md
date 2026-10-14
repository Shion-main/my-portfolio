# Portfolio design system

> Current direction (2026-10-15): ink and paper with sky blue accents (#91c9ed; #286b9b on paper), Syne display type, a type-only hero, an opposing-scroll collage of real project interfaces, service rows revealed by scrolling, and stacked project showcases. Desktop boards scale to the available height so the stack works in the in-app browser. See [the recording-led design](docs/designs/motion-reference-2026-10-13/REDESIGN.md) and [the latest feedback fixes](docs/designs/feedback-2026-10-15/CHANGES.md). Earlier notes below remain historical context.

## Direction

Confident, crafted, community-minded. The portfolio is a brand surface for hiring teams and clients. It puts project evidence and Joshua's contribution ahead of decoration.

## Color

The interface uses a neutral light canvas, charcoal type, and a committed vermilion accent. Values live in `src/index.css` as OKLCH tokens:

| Token | Role |
| --- | --- |
| `--surface` | Main light background |
| `--surface-strong` | White work and experience sections |
| `--ink` / `--dark` | Primary text and dark Korte feature |
| `--muted` | Supporting text |
| `--line` | Quiet structural separators |
| `--accent` | Key actions and contact section |
| `--accent-dark` | Accessible accent text on light backgrounds |

Avoid gradient text, neon glow, and decorative glass surfaces.

## Typography

Archivo is the single type family, with Arial as a fallback. Large headings use weight 800 and a tight but readable letter spacing of no less than `-0.04em`. Body copy has a comfortable line height and a bounded measure.

## Layout and components

- A 1320px maximum shell creates consistent page edges.
- The hero pairs a direct introduction with a real Spacely interface image.
- Korte receives the strongest project treatment, using its real logo and two marketing screenshots. A lime field and short product headline frame the app screens.
- School projects have their own heading; Spacely and J&H use real local screenshots with repository links, and FluxTrack appears as the capstone project.
- Experience and credentials use ruled lists for scanning.
- Contact uses a working `mailto:` link instead of a simulated form.
- The navigation becomes a labeled, keyboard-accessible menu on narrow screens.

## Motion and accessibility

The hero uses a short positional entrance, while hover and press feedback stay brief. Content remains visible without animation. Reduced-motion preference removes movement. Links and controls use visible focus outlines; text and supporting labels target WCAG AA contrast.
