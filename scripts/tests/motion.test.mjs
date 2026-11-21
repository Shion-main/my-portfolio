import test from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const { chapterWipe, chapterLocal, giantAxes, fitFontSize, WALL_PATTERN, wallColumn, wallSource, shadeEdge, snap, trackProgress, range,
  trackScreens, restStart, restCenter, movesEnd, momentAt, activeChapter, settleTarget, glide, arrivalT, COVER_AT, wallDive } = await loadTs("src/motion/scroll.ts");

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test("chapter timeline", () => {
  near(trackScreens(4), 6.9);
  near(restStart(0), .7); near(restStart(1), 2.25); near(restCenter(1), 2.525); near(movesEnd(4), 5.9);
  assert.deepEqual(momentAt(-.1, 4), { from: -1, to: 0, t: 0 });
  near(momentAt(.35, 4).t, .5);
  assert.deepEqual(momentAt(1, 4), { from: 0, to: 0, t: 1 });
  const m = momentAt(1.65, 4); assert.equal(m.from, 0); assert.equal(m.to, 1); near(m.t, .4);
  assert.deepEqual(momentAt(9, 4), { from: 3, to: 3, t: 1 });
  assert.equal(activeChapter({ from: -1, to: 0, t: .49 }), -1);
  assert.equal(activeChapter({ from: 0, to: 1, t: .5 }), 1);
});

test("finishing a move", () => {
  near(settleTarget(1.65, 1, 4), 2.25);   // forward, t .4
  near(settleTarget(1.45, 1, 4), 1.25);   // forward, t .2
  near(settleTarget(1.95, -1, 4), 1.25);  // back, t .7
  near(settleTarget(2.05, -1, 4), 2.25);  // back, t .8
  near(settleTarget(.3, 1, 4), .7);       // the arrival counts as a move
  near(settleTarget(.1, -1, 4), 0);
  assert.equal(settleTarget(1, 1, 4), null);      // resting
  assert.equal(settleTarget(1.252, 1, 4), null);  // within .005 of an end
  assert.equal(settleTarget(-.2, 1, 4), null);
});

test("glide", () => {
  near(glide(0, .5, 16, false), .5 * (1 - Math.exp(-16 / 130)));
  assert.equal(glide(0, 1.2, 16, false), 1.2);   // a jump is drawn at once
  assert.equal(glide(0, .5, 16, true), .5);      // reduced motion
  assert.equal(glide(.4999, .5, 16, false), .5); // converged
});

test("first arrival", () => {
  near(arrivalT(0), .48); near(arrivalT(.35), .74); near(arrivalT(.7), 1);
  near(COVER_AT, .7 * .16 / .52);
  assert.equal(wallDive(-.6), 0); near(wallDive(COVER_AT), 1);
});

test("chapter wipes", () => {
  assert.equal(chapterWipe(-.2, 0, 4), 0);
  assert.equal(chapterWipe(.02, 0, 4), 1);
  assert.equal(chapterWipe(.21, 1, 4), 0);
  assert.equal(chapterWipe(.30, 1, 4), 1);
  let prev = 0;
  for (let r = -.1; r <= 1.1; r += .001) {
    const w = chapterWipe(r, 2, 4);
    assert.ok(w >= prev - 1e-9);
    prev = w;
  }
});

test("chapter local progress spans its own quarter", () => {
  assert.equal(chapterLocal(.25, 1, 4), 0);
  assert.equal(chapterLocal(.375, 1, 4), .5);
  assert.equal(chapterLocal(2, 3, 4), 1);
});

test("giant stretch and fit", () => {
  assert.deepEqual(giantAxes(0, 122, false), { wdth: 50, wght: 300 });
  assert.deepEqual(giantAxes(.6, 122, false), { wdth: 122, wght: 820 });
  assert.equal(giantAxes(0, 122, true).wdth, 50);
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

test("track progress is raw and range is clamped", () => {
  assert.equal(trackProgress(100, 2000, 1000), -.1);
  assert.equal(trackProgress(-1000, 2000, 1000), 1);
  assert.equal(range(5, 0, 1), 1);
  assert.equal(range(-5, 0, 1), 0);
});

test("reduced motion snaps", () => {
  assert.equal(snap(.4, true), 0);
  assert.equal(snap(.6, true), 1);
  assert.equal(snap(.4, false), .4);
});
