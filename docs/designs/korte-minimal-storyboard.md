# Korte — all-in-one app storyboard

Implemented direction · 15 October 2026 · Motion-design applied

**Later polish:** the user requested a closer frame comparison with the video. The implemented motion refinements are documented in [the 15 October comparison](korte-motion-polish-2026-10-15/AUDIT.md); that record supersedes the initial motion table below while preserving this four-section content plan.

## Positioning

**Korte is an all-in-one pickleball app for players, organizers and venues in the Philippines.**

Tell one connected product story: find people and games, arrange a place to play, run the session and stay connected. Open-play management supplies a concrete example of product depth within that wider experience.

Keep four sections and approximately 200–250 words of main copy. Target roughly 3–4 desktop viewport heights, with natural vertical flow on mobile. The gallery changes on selection; additional product scope does not add more page sections.

## Content storyboard

### Frame 1 — The whole product

**Headline**

> Pickleball, all in one place.

**Introduction**

> I designed and built Korte, an all-in-one pickleball app for the Philippines, bringing discovery, clubs, court bookings and open-play management into one experience.

**Role:** Product design + development

**Visual:** one composed product showcase pairing the actual Explore interface on a phone with the actual organizer interface on desktop. Use two separate, complete image elements with quiet framing and full-size access. Give each enough room to read; stack them on mobile. Keep this opening composition compact and avoid a separate explanation beneath each device.

**Caption:** “Player discovery and organizer tools. Local app captures with synthetic data.”

### Frame 2 — Who it brings together

**Headline**

> One app. Three perspectives.

**Three short rows**

> **Players** — Find open play, join clubs and book a court.
>
> **Organizers** — Create sessions, check players in, manage rotations and record results.
>
> **Venue partners** — Manage venues, court availability and bookings.

**Design rationale, one sentence:**

> I organized each experience around its next action, connecting discovery, participation and operations through clear navigation and status.

**Visual:** typography and spacing only. These are product roles, not research personas. No additional journey diagram or three separate feature sections.

### Frame 3 — Show the connected experience

**Headline**

> Find a game. Make it happen.

**Visual:** one gallery with four selectable areas. Show one area at a time. Each selection changes the actual product screen and one short design caption.

| Selection | Screen to show | Proposed caption / design point |
|---|---|---|
| Discover | Meet detail, reached from Explore | “Give players the place, time and participation details before they join.” |
| Book | Venue availability and booking; a separate partner workspace view is available within this selection | “Make court availability and reservation status clear for players and venue partners.” |
| Organize | Check-in or score entry, following the live-courts preview in the hero | “Keep arrivals, court operation and results connected, with a clear next action.” |
| Connect | Club detail with upcoming open play | “Connect the community to its next session.” |

Default to **Discover**. Use different states from the hero, so the page does not repeat the same screenshots. For Book, present the player and partner views with explicit labels; they are different interfaces. Mobile shows one readable figure at a time.

Every image opens at its original size. All captures must be real local app UI with synthetic or permissioned data. The gallery should feel like a curated product presentation, with consistent framing and generous space.

### Frame 4 — Contribution and next step

**Headline**

> One product, from discovery to play.

**Copy**

> My work connected product design and development across player, organizer and venue experiences. Next, I want to test how clearly people move between finding, arranging and running play.

**Links:** View wireframes ↗ · Product source ↗ · Next project: Space Arabica →

Label the wireframe link “Reconstructed after implementation.” Keep the close to one paragraph and one link row.

## Content and visual boundaries

- Use Korte's light mineral, navy and restrained lime palette; Exo display and Geist body.
- Keep detailed matchmaking, recovery explanations and the full wireframe collection in the linked workbook.
- Keep unverified dates, team and release-status placeholders in a small Project details disclosure. “All-in-one” describes the designed product scope; it does not certify hosted availability of every feature.
- Lead community coverage with clubs and participation. Do not promote local-only feed work, configuration-gated messaging or unverified cross-device behavior as released functionality.
- Preserve screenshot proportions. No clipped screens, tiny phone montages, mandatory scroll animation or mascot-led cover.
- Use evidence labels next to the relevant media, without repeating long disclaimers throughout the page.

## Asset plan and implementation order

See the motion storyboard below when implementing these four frames. Motion must fit the existing page length.

1. Use this four-frame structure and copy as the editorial direction.
2. Before implementation, capture the actual Explore, meet detail, venue/booking, partner workspace and club interfaces from the local product in representative, non-sensitive states. Existing organizer captures can be reused. The supplied grayscale frames explain these areas but must not stand in for finished UI.
3. Build one hero composition, the three role rows, one gallery and the brief close. Keep detailed material behind the workbook link.
4. Apply the motion storyboard below with CSS and native browser interactions. No additional animation library is needed for this scope.
5. Check the page at 1440px and 390px for reading length, complete screens, gallery controls and image enlargement. Test keyboard use, rapid gallery changes and reduced motion. Verify the production route after final edits.

## Motion storyboard

Applied from `.agents/skills/motion-design/SKILL.md`, including its choreography, context-adaptation and quality guidance.

**Intent:** calm, capable and connected. Use the skill's Corporate archetype with no overshoot. Product screens remain the focal point.

**Constants:** quick feedback 120ms; standard transitions 240ms; hero/enlargement entrance 360ms. Signature easing `cubic-bezier(0.2, 0, 0, 1)`; exits use `cubic-bezier(0.3, 0, 1, 1)`. Hover/touch feedback begins within 80ms.

| Frame / trigger | Motion | Reading state |
|---|---|---|
| 1. Hero first enters view | The screen composition rises 12px and fades in over 360ms. Treat the two screens as one visual group. Its soft shadow settles through opacity; a restrained lime accent completes a single short reveal within the same interval. | Title and introduction are immediately readable. Screens settle fully, remain still and do not replay on reverse scroll. |
| 2. Three perspectives | Keep the three role rows static. Normal scrolling introduces the content. | All three roles remain readable together; no serial reveal delays. |
| 3. Gallery selection | Update selection feedback immediately. After the next image is decoded, the old view exits 8px over 120ms; the new view enters from the opposite side over 240ms with opacity. Direction follows tab order. Caption changes with the screen. | One selected view stays fully visible until the next selection. No automatic cycling. |
| 4. Closing links | On hover, move the arrow 2px toward its destination; keep the label fixed. Use a quick color response for keyboard focus. | Closing copy stays still. |
| Open a full-size image | A native dialog scales from 0.985 to 1 with opacity over 360ms; the backdrop fades and the close control appears within the same interval. Close over 240ms. | The original image is fully inspectable. Escape closes; focus returns to the triggering image. A direct original-image link remains available. |

**Depth without distraction:** the primary layer is the product screen; secondary feedback comes from its shadow and the selected gallery indicator; ambient context is the restrained accent or enlargement backdrop. These settle after each event. No continuous background animation, floating devices or cursor tracking.

**Mobile and accessibility:** halve movement to 6px for the hero and 4px for gallery changes; use about 80% of desktop durations. With reduced motion, remove movement and scale, show content immediately, and use at most an 80ms fade. Focus and selected states remain visible without animation.

**Implementation limits:** animate transform and opacity, including opacity on pre-rendered shadow layers. Keep normal document scrolling and the four-section length. Reserve image space using its real proportions; capture consistent viewport sizes instead of cropping images. Do not animate page height. Keep the current image visible while another loads; if loading fails, retain the current selection and offer retry. Rapid selections cancel pending transitions and show the latest requested view. Content remains available if entrance enhancement fails.

**Acceptance:** whole screens before and after motion; no clipped UI during translation; no scroll pinning or extra spacer sections; no queued transitions; keyboard-operable gallery and enlargement; reduced-motion behavior verified. Browser checks passed on desktop and phone, including the production route. See the implementation record for evidence and limits; device-level frame-rate benchmarking was not performed.

Source basis: Korte's `docs/product/role-journeys.md` and `portfolio/korte-case-study-2026-10-12/` package. These describe the local product and its boundaries, not measured adoption or universal hosted rollout.

Implemented on 2026-10-15 after user approval. See `korte-case-study-2026-10-15.md` for the implementation and validation record. Final captures use realistic fictional records in signed-in product states, replacing generic Demo/UAT placeholders.
