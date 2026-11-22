// Pure scroll and motion maths. Components measure the page, call these and
// write styles; nothing here touches the DOM. No imports: tests load it directly.

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut3 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeIn3 = (t: number) => t * t * t;
export const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOut4 = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOut4 = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
export const range = (v: number, start: number, end: number) => clamp((v - start) / (end - start));

/** Font size that makes the giant word span 96% of the viewport, capped by height. `widthAt100` is its width at 100px. */
export const fitFontSize = (widthAt100: number, viewportW: number, viewportH: number, mobile: boolean) =>
  Math.min((100 * viewportW * 0.96) / widthAt100, viewportH * (mobile ? 0.2 : 0.34));

// ---- Chapter timeline, in screens of scroll from the moment the track pins ----
// The first project arrives, then each project rests and a move carries it to the next.
export const ARRIVE = 0.7;
export const REST = 0.55;
export const MOVE = 1;
/** A drawn position further than this from the real one is a jump, drawn at once. */
export const JUMP = 1;
export const GLIDE_MS = 130;
export const SETTLE_MS = 170;

/** Track height in viewport heights. */
export const trackScreens = (count: number) => ARRIVE + count * REST + (count - 1) * MOVE + 1;
export const restStart = (i: number) => ARRIVE + i * (REST + MOVE);
export const restCenter = (i: number) => restStart(i) + REST / 2;
export const movesEnd = (count: number) => restStart(count - 1) + REST;

/** Where the reader is: arriving (from -1 to 0), resting on a chapter (from === to, t 1), or t of the way through a move. */
export type Moment = { from: number; to: number; t: number };

/** Within this much of a move's ends (about 2px) the reader is at rest: offsetTop is rounded to whole pixels. */
const EDGE = 0.002;

export function momentAt(s: number, count: number): Moment {
  if (s < ARRIVE) return { from: -1, to: 0, t: range(s, 0, ARRIVE) };
  for (let i = 0; i < count - 1; i++) {
    const start = restStart(i) + REST;
    if (s < start + EDGE) return { from: i, to: i, t: 1 };
    if (s < start + MOVE - EDGE) return { from: i, to: i + 1, t: (s - start) / MOVE };
  }
  return { from: count - 1, to: count - 1, t: 1 };
}

/** The chapter that counts as on screen: the incoming one once a move is halfway, -1 before the first arrives. */
export const activeChapter = (m: Moment) => (m.t >= 0.5 ? m.to : m.from);

/** Where the wall starts to dive as the list leaves; finishing backward out of the first arrival comes back here, with the list in view. */
export const DIVE_FROM = -0.6;

/** Where to finish a move the reader stopped inside: always the way they were heading, so a single arrow key or wheel notch advances. */
export function settleTarget(s: number, dir: 1 | -1, count: number): number | null {
  const spans: [number, number][] = [[DIVE_FROM, ARRIVE]];
  for (let i = 0; i < count - 1; i++) spans.push([restStart(i) + REST, restStart(i) + REST + MOVE]);
  for (const [a, b] of spans) {
    if (s <= a + 0.005 || s >= b - 0.005) continue;
    return dir > 0 ? b : a;
  }
  return null;
}

/** The drawn position glides toward the real one; jumps and reduced motion are drawn at once. */
export function glide(cur: number, target: number, dtMs: number, reduced: boolean) {
  const gap = target - cur;
  if (reduced || Math.abs(gap) > JUMP || Math.abs(gap) < 0.0004) return target;
  return cur + gap * (1 - Math.exp(-dtMs / GLIDE_MS));
}

/** The first project's arrival reuses the incoming half of a move. */
export const arrivalT = (s: number) => lerp(0.48, 1, range(s, 0, ARRIVE));
/** From here the first project is fully opaque over the wall. */
export const COVER_AT = (ARRIVE * 0.16) / 0.52;
/** The wall of screens rushes toward the camera as the first project arrives. */
export const wallDive = (s: number) => easeIn3(range(s, DIVE_FROM, COVER_AT));

// ---- Push-through poses. t is the fraction of a move: 0 = outgoing at rest, 1 = incoming at rest ----
/** Rises from a to a peak at m, falls back to 0 by b. */
export const tri = (v: number, a: number, m: number, b: number) => (v <= m ? range(v, a, m) : 1 - range(v, m, b));
// -0 and 0 differ to deepEqual and in CSS output; keep poses clean.
const z = (v: number) => v + 0;

/** The outgoing project: the camera flies into its laptop screen. */
export function pushOut(t: number) {
  const b = range(t, 0.32, 0.58);
  return { zoom: easeIn3(range(t, 0, 0.56)), blur: b * b * 14, words: range(t, 0, 0.22), giantOpacity: 1 - range(t, 0.02, 0.25), shown: t < 0.64 };
}

/** The incoming project: it fades in over the full-screen screenshot and rushes out to meet the camera. */
export function pushIn(t: number) {
  return {
    opacity: easeOut3(range(t, 0.48, 0.64)),
    scale: lerp(0.62, 1, easeOut3(range(t, 0.48, 1))),
    blur: (1 - range(t, 0.48, 0.74)) * 12,
    land: range(t, 0.54, 1),
    flash: tri(t, 0.44, 0.56, 0.7) * 0.5,
    shown: t > 0.48,
  };
}

/** The incoming project's own arrival, staggered: giant name, laptop, phone, then the words one by one. */
export function landing(t: number, fit: number) {
  const g = easeOut4(range(t, 0, 0.75));
  const d = easeOut4(range(t, 0.1, 0.8));
  const ph = easeOut4(range(t, 0.22, 0.95));
  const w = range(t, 0.42, 1);
  return {
    giantW: lerp(50, fit, g), giantWt: lerp(300, 820, g), giantY: z((1 - g) * 22), giantO: range(t, 0, 0.2),
    deskY: z((1 - d) * 9), deskScale: lerp(0.94, 1, d), deskO: range(t, 0.1, 0.32),
    phoneY: z((1 - ph) * 18), phoneTurn: z((1 - ph) * -4), phoneO: range(t, 0.22, 0.42),
    words: [0, 1, 2, 3].map(j => easeOut4(range(w, j * 0.13, 0.55 + j * 0.13))),
  };
}

/** The outgoing words lift and fade. y[1] (the heading, inside its mask) is in %, the rest in px. */
export function leaveWords(progress: number) {
  const e = easeIn3(progress);
  return { opacity: 1 - e, y: [z(-14 * e), z(-60 * e), z(-14 * e), z(-14 * e)] };
}

/** Scale around the laptop screen's centre while moving that centre to the viewport's centre, until the screen overfills the view by 15%. */
export function dolly(rect: { x: number; y: number; w: number; h: number }, vw: number, vh: number, zoom: number) {
  const originX = rect.x + rect.w / 2, originY = rect.y + rect.h / 2;
  const end = Math.max(vw / rect.w, vh / rect.h) * 1.15;
  return { originX, originY, dx: z((vw / 2 - originX) * zoom), dy: z((vh / 2 - originY) * zoom), scale: lerp(1, end, zoom) };
}

/** Slow parallax while a project rests: the desk moves -drift × 26px, the phone -drift × 48px. */
export const restDrift = (s: number, i: number) => clamp(s - restCenter(i), -1.2, 1.2);

// ---- Case hand-off: the end of a case study carries on into the next project, as a whip pan ----
// Positions are screens of scroll from the moment the hand-off stage pins. The contact block rests, the camera whips
// sideways to the next project, it holds, then a short pull (the next project leans away) commits to one pan across to
// the next case study, which the page transition plays.
export const HANDOFF = { IN_FROM: 0.35, IN_TO: 1.35, HOLD: 1.55, OUT_FROM: 1.75, OUT_TO: 2.15 } as const;

/** Track height in viewport heights: the pull's end plus the pinned screen. */
export const handoffTrackScreens = () => HANDOFF.OUT_TO + 1;

export type HandoffPhase = { phase: "contact" | "in" | "hold" | "out" | "done"; t: number };

/** Where the reader is in the hand-off: on the contact block, whipping in, holding on the next project,
 *  pulling away from it, or done (pan to the next case). */
export function handoffPhase(s: number): HandoffPhase {
  if (s < HANDOFF.IN_FROM) return { phase: "contact", t: 0 };
  if (s < HANDOFF.IN_TO) return { phase: "in", t: (s - HANDOFF.IN_FROM) / (HANDOFF.IN_TO - HANDOFF.IN_FROM) };
  if (s < HANDOFF.OUT_FROM) return { phase: "hold", t: 1 };
  if (s < HANDOFF.OUT_TO - 0.002) return { phase: "out", t: (s - HANDOFF.OUT_FROM) / (HANDOFF.OUT_TO - HANDOFF.OUT_FROM) };
  return { phase: "done", t: 1 };
}

/** Where to finish a move the reader stopped inside, the way they were heading: the whip in ends at the hold or back
 *  on the contact block; the pull completes (panning to the next case) or returns to the hold. */
export function handoffSettle(s: number, dir: 1 | -1): number | null {
  const spans: [number, number, number, number][] = [
    [HANDOFF.IN_FROM, HANDOFF.IN_TO, HANDOFF.HOLD, 0],
    [HANDOFF.OUT_FROM, HANDOFF.OUT_TO, HANDOFF.OUT_TO, HANDOFF.HOLD],
  ];
  for (const [a, b, forward, back] of spans) {
    if (s <= a + 0.005 || s >= b - 0.005) continue;
    return dir > 0 ? forward : back;
  }
  return null;
}

/** The first whip, t 0 → 1: the contact block streaks off left as the next project races in from the right.
 *  Shots travel in vw (infoX in px); skew in degrees; blur is a fraction of the blur cap; streaks an opacity; bars in vh.
 *  Inside the incoming world its giant name runs ahead and its laptop lags behind, then both settle. */
export function whipEnter(t: number, fit: number) {
  const p = easeInOut4(range(t, 0.05, 0.85));
  return {
    contactX: z(-105 * p), worldX: z(105 * (1 - p)),
    skew: z(-8 * tri(t, 0.05, 0.45, 0.85)), blur: tri(t, 0.1, 0.45, 0.8),
    streaks: 0.9 * tri(t, 0.12, 0.45, 0.78), streakX: z(-60 * p), bars: 9 * tri(t, 0.05, 0.45, 0.9),
    giantX: z(-40 * (1 - easeOut4(range(t, 0.15, 0.95)))), giantW: lerp(150, fit, easeOut3(range(t, 0.3, 1))),
    deskX: z(26 * (1 - easeOut3(range(t, 0.25, 1)))),
    infoO: range(t, 0.7, 1), infoX: z(-30 * (1 - easeOut3(range(t, 0.7, 1)))),
  };
}

/** The pull past the hold, u 0 → 1: the next project leans away to the left (its name a little ahead), gathering a
 *  touch of blur, until the reader commits and the page transition pans the whole page across to the next case study.
 *  Small on purpose: the screen is never empty, and the pan does the travelling. Shifts in vw; blur a fraction of the cap. */
export function whipLeave(u: number) {
  const e = easeIn3(u);
  return { sceneX: z(-8 * e), giantX: z(-6 * e), blur: 0.3 * e };
}

export const WALL_PATTERN = ["d", "p", "d", "d", "p", "d", "p", "d", "d", "p", "d"] as const;

/** Neighbouring columns drift in opposite directions at slightly different speeds. */
export function wallColumn(index: number): { dir: 1 | -1; speed: number; duration: number } {
  return { dir: index % 2 ? 1 : -1, speed: 0.08 + (index % 3) * 0.045, duration: 64 + (index % 4) * 16 };
}

type ScreenLists = { desktop: string[]; phone: string[] };

/** Which project's screen a tile shows: a mix of all projects, or only the one being pointed at.
 *  Phone tiles never show a project without a phone app; pointing at one returns null (its phone columns hide). */
export function wallSource(which: "all" | number, type: "desktop" | "phone", col: number, i: number, lists: ScreenLists[]) {
  const pool = lists.map((_, k) => k).filter(k => lists[k][type].length > 0);
  if (which !== "all" && !pool.includes(which)) return null;
  const project = which === "all" ? pool[(col * 3 + i) % pool.length] : which;
  const list = lists[project][type];
  const index = which === "all" ? (col + i) % list.length : (col * 2 + i) % list.length;
  return { project, name: list[index] };
}

/** Darkness of the wall's right edge: light behind the hero, darker behind the list, a little lighter while pointing. */
export const shadeEdge = (scrollY: number, viewport: number, pointing: boolean) =>
  0.42 + 0.3 * range(scrollY, viewport * 0.3, viewport * 0.9) - (pointing ? 0.14 : 0);
