# Korte motion polish · 15 October 2026

## Reference comparison

Reviewed the previously extracted recording frames, including every frame on contact sheets 02, 05, 06 and 07. These cover the image bands, reading interval, composed project cards, their overlapping entrance and the beginning of the exit. The original recording is a filmed display; its timestamps establish sequence, not exact easing or scroll distances.

| Reference frames | Observation | Korte adjustment |
| --- | --- | --- |
| 61–120, 2.00–3.97s | Adjacent image bands move at different rates. | Two hero screens move in opposing directions during native desktop scrolling. The eased range is bounded to 36/44px, without additional scroll space. |
| 241–300, 8.00–9.97s | Calm numbered reading interval between visual sequences. | Keep the three product roles readable together. Only their heading receives a short entrance. |
| 301–348, 10.00–11.57s | Most of the project card belongs to a coordinated composition. | Present actual desktop and mobile UI together, with consistent framing, shadows and full-size access. |
| 349–402, 11.60–13.37s | The incoming card covers the previous card while that card remains present. | Keep the outgoing view behind the new view; reveal the opaque incoming composition vertically. Forward and backward choices use opposite directions. |
| 403–420, 13.40–13.97s | The composition settles before the next chapter arrives. | Each selected screen stays still. No autoplay or pinned-screen sequence. Gallery navigation stays within its own section. |

## Frame review and corrections

- Captured nine actual browser scroll positions and thirteen animation frames at 33.33ms intervals across the 400ms gallery transition.
- The first pass exposed double text from the overlapping crossfade. Replaced that with an opaque masked reveal, keeping the previous composition underneath until completion.
- Current and incoming screen proportions remain intact. The reveal mask is temporary; settled images are complete, separately inspectable screen captures.
- Reversing scroll restores the same screen positions. The page stays at 3,512px at 1440×900, slightly below the initial 3,539px.
- Mobile removes parallax and shows one readable phone screen. Reduced motion removes the spatial transitions.
- No animation library added. Native scrolling, requestAnimationFrame for bounded depth, Web Animations for the handoff, CSS for the indicator.

## Evidence

- [Frame viewer](index.html)
- [Scroll strip](scroll-strip.jpg)
- [Transition strip](transition-strip.jpg)
- [Frame measurements](frame-checks.json)

Keyboard gallery selection, rapid changes, image-load failure/retry, dialog focus/close, screen proportions, horizontal overflow, and scroll boundaries are checked in the browser. Spatial checks cover 1440, 920, 768, 701, 390 and 320px widths. Device-level frame-rate benchmarking was not performed.

The page retains four sections, the all-in-one product framing, and the existing signed-in UI captures with realistic fictional data.
