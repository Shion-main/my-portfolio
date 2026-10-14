# Homepage particle field · 15 October 2026

User reference: `Downloads/download.jpg`. Placement confirmed as the portfolio homepage background.

Implemented in `src/components/ParticleField.tsx`, mounted only by `Home.tsx`. A fixed, decorative Canvas 2D layer sits behind the existing page. No extra rendering library or external asset is required. Light sections, the collage, and project surfaces keep their opaque backgrounds.

The original grid uses a procedural halftone pattern: small blue-white squares vary in size and opacity along broad curved bands. The center is quieter for typography. Each particle stores its home coordinate. A pointer within 120–190px pulls nearby particles inward, with a slight tangential bend. Particles shrink and fade within the central 52px. Damped springs restore them after the pointer moves or leaves.

The field is static on narrow screens (700px and below), coarse pointers, simple motion, and system reduced motion. It never replaces the native cursor, blocks clicks, handles scroll gestures, or enters the accessibility tree. Pointer movement wakes the simulation; settling, hidden documents, and unmounting stop it. Device pixel ratio is capped at 2, and density is capped at approximately 9,500 points.

Browser verification checks deformation, disappearance at the core, exact restoration of the resting pixel field, no idle repaint loop, simple/reduced/mobile behavior, pointer-event pass-through, and horizontal overflow. In the checked desktop sample, core alpha fell to about 3% of its resting value and returned exactly after pointer exit. This is an interaction check, not a performance claim for all devices.
