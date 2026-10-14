import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("src/story/choreography.ts", "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { progressAtScroll, samplePose } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);
const stops = [
  { y: 0, end: 200, progress: 0 },
  { y: 800, end: 1400, progress: 35 },
  { y: 2200, end: 2800, progress: 80 },
  { y: 3400, end: 3600, progress: 100 },
];
assert.equal(progressAtScroll(-500, stops), 0);
assert.equal(progressAtScroll(5000, stops), 100);
assert.equal(progressAtScroll(0, []), 0);
for (const y of [800, 801, 1000, 1399, 1400])
  assert.equal(
    progressAtScroll(y, stops),
    35,
    "Reading interval must be stationary",
  );
for (const y of [2200, 2400, 2800])
  assert.equal(progressAtScroll(y, stops), 80);
let previous = 0;
for (let y = -100; y <= 3800; y++) {
  const p = progressAtScroll(y, stops);
  assert.ok(p >= previous);
  assert.ok(p >= 0 && p <= 100);
  previous = p;
}
for (const mobile of [false, true])
  for (let p = 0; p <= 100; p += 0.25) {
    const pose = samplePose(p, mobile);
    assert.ok([...pose.camera, ...pose.target].every(Number.isFinite));
    assert.ok(
      Math.hypot(...pose.camera.map((v, i) => v - pose.target[i])) > 1,
      "Camera must not meet its look target",
    );
    const next = samplePose(Math.min(100, p + 0.001), mobile);
    assert.ok(
      Math.hypot(...pose.camera.map((v, i) => v - next.camera[i])) < 0.03,
      "Camera must remain continuous",
    );
  }
console.log(
  "Story checks passed: clamp, stationary reading, monotonic scroll, valid continuous desktop/mobile cameras.",
);

const collageSource = await readFile("src/story/collage.ts", "utf8");
const collageJs = ts.transpileModule(collageSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { collageLayers, collageProgress, collageScrollRange, sampleCollage } = await import(
  `data:text/javascript;base64,${Buffer.from(collageJs).toString("base64")}`
);
assert.equal(collageProgress(100, 700, 1200), 0, "Motion stays at its starting pose before the section");
assert.equal(collageProgress(1300, 700, 1200), 0.5);
assert.equal(collageProgress(3000, 700, 1200), 1, "Motion ends with the section");
assert.equal(collageProgress(700, 700, 0), 0.5, "Static layouts cannot divide by zero");
const direction = collageLayers.map(layer => Math.sign(sampleCollage(1, layer, 900).y - sampleCollage(0, layer, 900).y));
assert.ok(direction.includes(1) && direction.includes(-1), "The composition must include both upward and downward movement");
assert.ok(direction.every((value, index) => index === 0 || value !== direction[index - 1]), "Adjacent columns must move in opposite directions");
for (const [viewport, header, section] of [[900, 0, 1440], [668, 0, 2100], [844, 76, 1224]]) {
  const top = 1000;
  const { start, distance } = collageScrollRange(top, section, viewport, header);
  const progress = y => collageProgress(y, start, distance);
  assert.equal(progress(top - header), 0, "The first screens are visible when pinning begins");
  assert.equal(progress(top + section - viewport), 1, "The final screens arrive before the section releases");
  assert.ok(progress(top - header + 20) > 0, "Columns must move during the pinned interval");
  assert.ok(progress(top + section - viewport - 20) < 1, "The final screens must not arrive early");
}
for (const layer of collageLayers) {
  for (const height of [600, 900, 1440, 3000]) {
    assert.equal(Math.abs(sampleCollage(1, layer, height).y - sampleCollage(0, layer, height).y), height, "Every lane must traverse its full measured height on desktop and phones");
    for (const progress of [0, 0.2, 0.7, 1, 0.7, 0.2, 0]) {
      const pose = sampleCollage(progress, layer, height);
      assert.ok(Object.values(pose).every(Number.isFinite));
      assert.ok(pose.z < 200, "Layers stay well behind the perspective camera");
      const delta = sampleCollage(Math.min(1, progress + 0.001), layer, height);
      assert.ok(Math.abs(delta.y - pose.y) <= height * .001 + .01, "Scroll reversal cannot introduce a positional jump");
    }
    assert.deepEqual(sampleCollage(-1, layer, height), sampleCollage(0, layer, height));
    assert.deepEqual(sampleCollage(2, layer, height), sampleCollage(1, layer, height));
  }
}
console.log("Collage checks passed: bounded scroll, opposing travel, continuous reversal, complete desktop/mobile travel, safe perspective.");
