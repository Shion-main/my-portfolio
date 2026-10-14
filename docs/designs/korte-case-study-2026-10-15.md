# Korte minimal all-in-one case study — implemented 2026-10-15

Motion polish completed later on 15 October: see [the frame comparison](korte-motion-polish-2026-10-15/AUDIT.md). This supersedes the initial motion treatment below with bounded desktop scroll depth, paired responsive screens, an opaque gallery handoff, and a moving selection indicator. The page retains four sections and is 3,512px tall at 1440×900. Production desktop/mobile verification, typecheck, lint, existing tests and build passed.

Implemented the approved four-frame direction in `korte-minimal-storyboard.md`. This replaces the long organizer-focused draft.

## Result

1. **Pickleball, all in one place.** Player Explore and organizer live courts in one composition.
2. **One app. Three perspectives.** Three compact role rows: players, organizers, venue partners.
3. **Find a game. Make it happen.** One gallery: Discover / Book / Organize / Connect. Book switches explicitly between player booking and venue-partner dashboard.
4. **One product, from discovery to play.** Short contribution/reflection, Figma workbook, product source and next-project link.

About 220 words of main editorial copy. Four sections, 3,539px at 1440×900 in the checked desktop layout, approximately four viewports. Phone layout uses readable separate figures. Dates, team and release status remain unverified in the Project details disclosure.

## Visuals and data

Light mineral, navy and restrained lime; local Exo and Geist. All images preserve their original proportions and open in a native dialog, with a direct original-file link. No marketing landing pages or reconstructed wireframes substitute for product UI. The workbook link is labeled “Reconstructed after implementation.”

The user's final correction replaces generic Demo/UAT data with realistic fictional records: Alex Santos, Isabella Cruz, Sunday Social Doubles, Baseline Pickleball Club, 18 participants, priced booking slots with reserved times, populated venue activity, and Southside Dinkers membership. The captures show signed-in player, partner and club-member states. Existing organizer captures already contain realistic player names.

Capture provenance: `public/media/korte-case/capture-provenance-2026-10-15.json`. Captures render actual Korte components with local mock data. Counts and payment totals in screenshots are illustrative, not adoption or revenue claims. Product component source was not changed for captures.

## Motion

Applied `.agents/skills/motion-design/SKILL.md`: calm Corporate personality, no overshoot, cubic-bezier(.2,0,0,1). Hero composition rises 12px once over 360ms, with finite accent and shadow fades. Roles remain static. Gallery decodes both responsive images before a 120ms exit and 240ms directional entrance; selection feedback is immediate. Rapid selections cancel stale transitions. Failed decoding retains the prior screen and offers Retry. The native viewer fades/scales in, traps keyboard focus, closes with Escape and restores the trigger's focus. Mobile halves travel and reduces durations; reduced motion removes spatial movement. No pinning, extra scroll spacers or autoplay.

## Validation

- TypeScript, ESLint, existing story/motion tests and production prerender build pass.
- Gstack browser checks at 1440×900 and 390×844: four sections, no horizontal overflow, all gallery screens load, constant page height across selections, player/partner switching, latest rapid selection wins, forced image failure retains current view, Retry recovers.
- Reduced-motion gallery checks pass. Viewer and keyboard checks include arrows/Home/End, modal focus, Tab/Shift+Tab containment, Escape and focus restoration.
- Final production-route checks and screenshot evidence are saved in `.gstack/korte-minimal-*`.

## Capture lessons

- Decode visible images only when preparing viewport captures: offscreen lazy images can leave `decode()` pending indefinitely.
- Await the real app's hydration and scroll completion before taking captures.
- Fresh fictional fixture IDs prevent old public venue caches from surfacing stale placeholder records.

Only the dedicated Korte page, its styles, route metadata and capture assets were changed. Homepage and Space Arabica components were not edited.
