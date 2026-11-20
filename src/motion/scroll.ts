// Pure scroll and motion maths. Components measure the page, call these and
// write styles; nothing here touches the DOM. No imports: tests load it directly.

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const range = (v: number, start: number, end: number) => clamp((v - start) / (end - start));

/** With reduced motion, any in-between state jumps to its nearer end. */
export const snap = (t: number, reduced: boolean) => (reduced ? (t < 0.5 ? 0 : 1) : t);

/** How far a tall track has scrolled: 0 when its top meets the viewport top, 1 when its bottom meets the viewport bottom. Not clamped. */
export const trackProgress = (top: number, height: number, viewport: number) => -top / Math.max(1, height - viewport);

/** How much of chapter `index` has wiped in. The first chapter opens as the section arrives. */
export function chapterWipe(raw: number, index: number, count: number) {
  if (index === 0) return range(raw, -0.07, 0.02);
  const start = index / count;
  return range(clamp(raw), start - 0.03, start + 0.05);
}

/** Progress through chapter `index`'s own share of the track. */
export const chapterLocal = (raw: number, index: number, count: number) => range(clamp(raw), index / count, (index + 1) / count);

/** The giant name stretches from condensed to its fitted width during the first half of its chapter. */
export function giantAxes(local: number, fit: number, first: boolean) {
  const t = easeInOutCubic(range(local, first ? 0 : 0.08, 0.55));
  return { wdth: lerp(50, fit, t), wght: lerp(300, 820, t) };
}

/** Font size that makes the giant word span 96% of the viewport, capped by height. `widthAt100` is its width at 100px. */
export const fitFontSize = (widthAt100: number, viewportW: number, viewportH: number, mobile: boolean) =>
  Math.min((100 * viewportW * 0.96) / widthAt100, viewportH * (mobile ? 0.2 : 0.34));

export const WALL_PATTERN = ["d", "p", "d", "d", "p", "d", "p", "d", "d", "p", "d"] as const;

/** Neighbouring columns drift in opposite directions at slightly different speeds. */
export function wallColumn(index: number): { dir: 1 | -1; speed: number; duration: number } {
  return { dir: index % 2 ? 1 : -1, speed: 0.08 + (index % 3) * 0.045, duration: 64 + (index % 4) * 16 };
}

type ScreenLists = { desktop: string[]; phone: string[] };

/** Which project's screen a tile shows: a mix of all projects, or only the one being pointed at. */
export function wallSource(which: "all" | number, type: "desktop" | "phone", col: number, i: number, lists: ScreenLists[]) {
  const project = which === "all" ? (col * 3 + i) % lists.length : which;
  const list = lists[project][type];
  const index = which === "all" ? (col + i) % list.length : (col * 2 + i) % list.length;
  return { project, name: list[index] };
}

/** Darkness of the wall's right edge: light behind the hero, darker behind the list, a little lighter while pointing. */
export const shadeEdge = (scrollY: number, viewport: number, pointing: boolean) =>
  0.42 + 0.3 * range(scrollY, viewport * 0.3, viewport * 0.9) - (pointing ? 0.14 : 0);
