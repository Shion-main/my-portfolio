import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

for (const [file, name] of [
  ["dist/index.html", "Joshua"],
  ["dist/work/korte/index.html", "Korte"],
  ["dist/work/space-arabica/index.html", "Space Arabica"],
]) {
  const html = await readFile(file, "utf8");
  assert.ok(html.includes(name));
  assert.ok(html.includes("<h1"));
  assert.ok(
    html.includes("mailto:create@by-shion.dev"),
  );
  assert.ok(!html.includes("Spacely") && !html.includes("AWS Certified"));
  const sources = [
    ...html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g),
  ].map((m) => m[1]);
  for (const src of sources) {
    const path = "dist/" + src.replace(process.env.VITE_BASE_PATH || "/", "");
    await stat(path);
  }
}

// Home: hero and project list, with Joshua's confirmed credits and no personal location.
const homeHtml = await readFile("dist/index.html", "utf8");
for (const text of ["I design how an idea", "Space Arabica", "Korte", "FluxTrack", "Atlas Treasury", "Design + build · team of 3", "UI/UX · Treasury module", "Independent designer &amp; developer"])
  assert.ok(homeHtml.includes(text), `home is missing: ${text}`);
const withoutClientLocation = homeHtml.replaceAll("Café website, Davao City", "").replaceAll("Café website · Davao City", "");
assert.ok(!withoutClientLocation.includes("Davao City"), "no personal location on the home page");

const spaceCaseHtml = await readFile("dist/work/space-arabica/index.html", "utf8");
assert.ok(spaceCaseHtml.includes("View demo"));
assert.ok(!spaceCaseHtml.includes("vercel.app"));

for (const page of [
  "index.html",
  "menu.html",
  "full-menu.html",
  "space.html",
  "story.html",
  "contact.html",
]) {
  const demoHtml = await readFile(`dist/work/space-arabica/demo/${page}`, "utf8");
  assert.ok(demoHtml.includes("Work in progress"));
  assert.ok(demoHtml.includes('class="wip-banner"'));
  for (const match of demoHtml.matchAll(/<(?:input|textarea)\b[^>]*>/g)) {
    assert.ok(match[0].includes("disabled") && match[0].includes("readonly"));
  }
}

console.log(
  "Static checks passed: three complete pages, Space Arabica demo attached with WIP banner and disabled inputs, official email, all local referenced assets exist.",
);
