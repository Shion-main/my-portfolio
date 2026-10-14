# Browser feedback fixes — 15 October 2026

- Removed the two decorative project previews from the hero.
- Replaced lilac accents with sky blue `#91c9ed`. Links and focus on paper use the darker blue `#286b9b`.
- Service numbers, headings, and descriptions now reveal through a mask as each row enters. A CSS view timeline maps the reveal directly to scrolling; it stops when scrolling stops and reverses with the page. Reduced/simple motion and unsupported browsers show the text normally.
- Fixed the missing project stack at the user's **1158 × 668** viewport. The old `min-height: 760px` condition disabled sticky positioning there. Desktop stacking now depends on width only; the showcase height fits the space left by both title rails, details, and a 24px bottom margin. At this viewport the cards hold at 96px and 172px, and Korte ends at 644px.

Verified at 1158×668, 1158×600, 1280×720, 1440×900, and 390×844. Collage reversal, device bounds, contact covering the stack, fragment navigation, keyboard recovery, service reveal progression, and reduced motion pass. Native PageDown scrolling also produces the card overlap. Mobile keeps readable cards in normal flow.

Typecheck, lint, existing motion tests, and production build pass. Production browser checks at 1158×668 pass, with no console errors. No new dependencies.

The 14 October comparison is a historical before/after record. Its images still show the prior lilac hero and earlier services treatment; the live portfolio includes these newer corrections.

Evidence: [hero](hero.jpg), [project overlap after native scrolling](stack-scroll.jpg), [services mid-reveal](services-partial.jpg), and the `*.json` measurements in this folder.
