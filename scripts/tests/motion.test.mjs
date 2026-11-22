import test from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const { fitFontSize, WALL_PATTERN, wallColumn, wallSource, shadeEdge, range,
  trackScreens, restStart, restCenter, movesEnd, momentAt, activeChapter, settleTarget, glide, arrivalT, COVER_AT, wallDive,
  pushOut, pushIn, landing, leaveWords, dolly, restDrift, DIVE_FROM, handoffTrackScreens, handoffPhase, handoffSettle, whipEnter, whipLeave } = await loadTs("src/motion/scroll.ts");

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test("chapter timeline", () => {
  near(trackScreens(4), 6.9);
  near(restStart(0), .7); near(restStart(1), 2.25); near(restCenter(1), 2.525); near(movesEnd(4), 5.9);
  assert.deepEqual(momentAt(-.1, 4), { from: -1, to: 0, t: 0 });
  near(momentAt(.35, 4).t, .5);
  assert.deepEqual(momentAt(1, 4), { from: 0, to: 0, t: 1 });
  const m = momentAt(1.65, 4); assert.equal(m.from, 0); assert.equal(m.to, 1); near(m.t, .4);
  assert.deepEqual(momentAt(9, 4), { from: 3, to: 3, t: 1 });
  // Within ~2px of a move's ends counts as at rest (offsetTop is rounded to whole pixels).
  assert.deepEqual(momentAt(2.2495, 4), { from: 1, to: 1, t: 1 });
  assert.deepEqual(momentAt(1.2505, 4), { from: 0, to: 0, t: 1 });
  assert.equal(activeChapter({ from: -1, to: 0, t: .49 }), -1);
  assert.equal(activeChapter({ from: 0, to: 1, t: .5 }), 1);
});

test("finishing a move", () => {
  // A finish always goes the way the reader was heading, so single steps (an arrow key, one wheel notch) advance.
  near(settleTarget(1.65, 1, 4), 2.25);
  near(settleTarget(1.27, 1, 4), 2.25);   // a small step forward out of a rest
  near(settleTarget(1.95, -1, 4), 1.25);
  near(settleTarget(2.23, -1, 4), 1.25);  // a small step back out of a rest
  // The dive from the list (-0.6) to the first project's rest (.7) is one move: back ends with the list in view.
  near(DIVE_FROM, -.6);
  near(settleTarget(.3, 1, 4), .7);
  near(settleTarget(-.3, 1, 4), .7);
  near(settleTarget(.1, -1, 4), -.6);
  near(settleTarget(-.3, -1, 4), -.6);
  assert.equal(settleTarget(-.7, 1, 4), null);    // still reading the list
  assert.equal(settleTarget(1, 1, 4), null);      // resting
  assert.equal(settleTarget(1.252, 1, 4), null);  // within .005 of an end
  assert.equal(settleTarget(9, 1, 4), null);      // below the chapters
});

test("glide", () => {
  near(glide(0, .5, 16, false), .5 * (1 - Math.exp(-16 / 130)));
  assert.equal(glide(0, 1.2, 16, false), 1.2);   // a jump is drawn at once
  assert.equal(glide(0, .5, 16, true), .5);      // reduced motion
  assert.equal(glide(.4999, .5, 16, false), .5); // converged
});

test("push-through poses", () => {
  assert.deepEqual(pushOut(0), { zoom: 0, blur: 0, words: 0, giantOpacity: 1, shown: true });
  near(pushOut(.28).zoom, .125); near(pushOut(.56).zoom, 1);
  near(pushOut(.45).blur, 3.5); near(pushOut(.58).blur, 14);
  assert.equal(pushOut(.22).words, 1); assert.equal(pushOut(.63).shown, true); assert.equal(pushOut(.64).shown, false);
  const a = pushIn(.48); near(a.opacity, 0); near(a.scale, .62); near(a.blur, 12); assert.equal(a.shown, false);
  near(pushIn(.56).flash, .5); near(pushIn(.64).opacity, 1); near(pushIn(.61).blur, 6);
  const b = pushIn(1); near(b.scale, 1); near(b.blur, 0); near(b.land, 1); near(b.flash, 0);
  assert.deepEqual(landing(0, 122), { giantW: 50, giantWt: 300, giantY: 22, giantO: 0, deskY: 9, deskScale: .94, deskO: 0, phoneY: 18, phoneTurn: -4, phoneO: 0, words: [0, 0, 0, 0] });
  assert.deepEqual(landing(1, 122), { giantW: 122, giantWt: 820, giantY: 0, giantO: 1, deskY: 0, deskScale: 1, deskO: 1, phoneY: 0, phoneTurn: 0, phoneO: 1, words: [1, 1, 1, 1] });
  near(landing(.75, 140).giantW, 140);
  const l = leaveWords(1); near(l.opacity, 0); assert.deepEqual(l.y, [-14, -60, -14, -14]);
  assert.deepEqual(leaveWords(0), { opacity: 1, y: [0, 0, 0, 0] });
  const d = dolly({ x: 500, y: 200, w: 400, h: 250 }, 1000, 800, 1);
  near(d.scale, 3.68); near(d.originX, 700); near(d.originY, 325); near(d.dx, -200); near(d.dy, 75);
  const h = dolly({ x: 500, y: 200, w: 400, h: 250 }, 1000, 800, .5); near(h.scale, 2.34); near(h.dx, -100);
  near(restDrift(restCenter(1), 1), 0); near(restDrift(10, 0), 1.2);
});

test("first arrival", () => {
  near(arrivalT(0), .48); near(arrivalT(.35), .74); near(arrivalT(.7), 1);
  near(COVER_AT, .7 * .16 / .52);
  assert.equal(wallDive(-.6), 0); near(wallDive(COVER_AT), 1);
});

test("giant fit", () => {
  assert.equal(fitFontSize(500, 1440, 900, false), Math.min(100 * 1440 * .96 / 500, 900 * .34));
  assert.equal(fitFontSize(200, 390, 844, true), 844 * .2);
});

test("wall columns alternate and stay in range", () => {
  assert.equal(WALL_PATTERN.length, 11);
  for (let c = 0; c < WALL_PATTERN.length; c++) {
    const col = wallColumn(c), next = wallColumn(c + 1);
    assert.notEqual(col.dir, next.dir);
    assert.ok(col.speed >= .08 && col.speed <= .17 && col.duration >= 64 && col.duration <= 112);
  }
});

test("phone tiles never show a project without a phone", () => {
  const lists = [0, 1, 2, 3].map(k => ({ desktop: [`d${k}a`, `d${k}b`], phone: k === 3 ? [] : [`p${k}a`] }));
  for (let col = 0; col < 11; col++) for (let i = 0; i < 8; i++) assert.notEqual(wallSource("all", "phone", col, i, lists).project, 3);
  assert.equal(wallSource(3, "phone", 0, 0, lists), null);
  assert.equal(wallSource(3, "desktop", 0, 1, lists).name, "d3b");
});

test("wall sources mix in all mode and stay on one project when pointing", () => {
  const lists = [0, 1, 2, 3].map(k => ({ desktop: [`d${k}a`, `d${k}b`], phone: [`p${k}a`] }));
  assert.deepEqual(new Set([0, 1, 2, 3].map(i => wallSource("all", "desktop", 0, i, lists).project)), new Set([0, 1, 2, 3]));
  for (let i = 0; i < 8; i++) assert.equal(wallSource(2, "phone", 5, i, lists).project, 2);
  assert.equal(wallSource(1, "desktop", 0, 1, lists).name, "d1b");
});

test("shade darkens behind the list and lightens while pointing", () => {
  assert.equal(shadeEdge(0, 900, false), .42);
  assert.ok(Math.abs(shadeEdge(900, 900, false) - .72) < 1e-9);
  assert.ok(Math.abs(shadeEdge(900, 900, true) - .58) < 1e-9);
});

test("range is clamped", () => {
  assert.equal(range(5, 0, 1), 1);
  assert.equal(range(-5, 0, 1), 0);
});

test("case hand-off timeline", () => {
  assert.deepEqual(handoffPhase(-0.3), { phase: "contact", t: 0 });
  assert.equal(handoffPhase(.2).phase, "contact");
  const w = handoffPhase(.85); assert.equal(w.phase, "in"); near(w.t, .5);
  assert.deepEqual(handoffPhase(1.55), { phase: "hold", t: 1 });
  // Past the hold is a short pull (0.4 screens): the next project leans away, then the page pans across.
  const o = handoffPhase(1.95); assert.equal(o.phase, "out"); near(o.t, .5);
  assert.equal(handoffPhase(2.149).phase, "done");
  near(handoffTrackScreens(), 3.15);
});

test("case hand-off finishing", () => {
  near(handoffSettle(.8, 1), 1.55); near(handoffSettle(.8, -1), 0);
  near(handoffSettle(2, 1), 2.15); near(handoffSettle(2, -1), 1.55);
  for (const s of [-.5, .2, .35, 1.55, 1.75, 2.148]) assert.equal(handoffSettle(s, 1), null, String(s));
});

test("whip in: the contact block out, the next project in, fastest in the middle", () => {
  const a = whipEnter(0, 122), m = whipEnter(.45, 122), b = whipEnter(1, 122);
  near(a.contactX, 0); near(a.worldX, 105); near(a.bars, 0); near(a.blur, 0); near(a.streaks, 0); near(a.infoO, 0);
  near(m.contactX, -52.5); near(m.worldX, 52.5); near(m.skew, -8); near(m.bars, 9); near(m.blur, 1); near(m.streaks, .9);
  for (const k of ["worldX", "giantX", "deskX", "infoX", "skew", "bars", "blur", "streaks"]) near(b[k], 0);
  near(b.contactX, -105); near(b.giantW, 122); near(b.infoO, 1);
  const h = whipEnter(.5, 122);
  assert.ok(h.giantX < 0 && h.deskX > 0, "the name runs ahead and the laptop lags behind");
});

test("the pull: the next project leans away before one pan carries the page across", () => {
  // Small and readable: no streaks, bars or empty screen; the page transition does the travelling.
  const a = whipLeave(0), m = whipLeave(.5), b = whipLeave(1);
  for (const k of ["sceneX", "giantX", "blur"]) near(a[k], 0);
  assert.ok(m.sceneX < 0 && m.giantX < 0, "it leans left");
  near(b.sceneX, -8); near(b.giantX, -6); near(b.blur, .3);
  assert.deepEqual(Object.keys(b).sort(), ["blur", "giantX", "sceneX"]);
});
