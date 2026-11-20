import test from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const { chapterWipe, chapterLocal, giantAxes, fitFontSize, WALL_PATTERN, wallColumn, wallSource, shadeEdge, snap, trackProgress, range } = await loadTs("src/motion/scroll.ts");

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
