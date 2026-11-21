import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

// Case-study routes linked from the home chapters before Task 9 builds them. Task 9 empties this list.
const PENDING_ROUTES = [];

for (const [file, name] of [
  ["dist/index.html", "Joshua"],
  ["dist/work/space-arabica/index.html", "Space Arabica"],
  ["dist/work/korte/index.html", "Korte"],
  ["dist/work/fluxtrack/index.html", "FluxTrack"],
  ["dist/work/atlas-accountancy/index.html", "Atlas Accountancy"],
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
    if (PENDING_ROUTES.includes(src)) continue;
    const path = "dist/" + src.replace(process.env.VITE_BASE_PATH || "/", "");
    await stat(path);
  }
}

// Home: hero and project list, with Joshua's confirmed credits and no personal location.
const homeHtml = await readFile("dist/index.html", "utf8");
for (const text of ["I design how an idea", "Space Arabica", "Korte", "FluxTrack", "Atlas Accountancy", "Design + build · team of 3", "UI/UX · Accountancy module", "Independent designer &amp; developer"])
  assert.ok(homeHtml.includes(text), `home is missing: ${text}`);
const withoutClientLocation = homeHtml.replaceAll("Café website, Davao City", "").replaceAll("Café website · Davao City", "");
assert.ok(!withoutClientLocation.includes("Davao City"), "no personal location on the home page");

// Home: four chapters, readable in the prerendered HTML before any script runs.
const { projects } = await (await import("./tests/load-ts.mjs")).loadTs("src/work/projects.ts");
const html = text => text.replaceAll("&", "&amp;");
for (const p of projects) {
  assert.ok(homeHtml.includes(`id="work-${p.slug}"`), `missing anchor for ${p.slug}`);
  for (const text of [p.name, p.line, ...p.facts.map(f => f.detail)]) assert.ok(homeHtml.includes(html(text)), `${p.slug} chapter is missing: ${text}`);
}
const worldsHtml = homeHtml.slice(homeHtml.indexOf('class="worlds'));
assert.ok(!/visibility:\s*hidden|clip-path/.test(worldsHtml.slice(0, worldsHtml.indexOf("</section>"))), "prerendered chapters must be visible without script");

// Every route: the new contact block, no retired fonts, no personal location.
// The Korte page joins this list in Task 9, when every case study uses the shared template.
const CHROME_ROUTES = ["dist/index.html", ...projects.map(p => `dist/work/${p.slug}/index.html`)];
for (const file of CHROME_ROUTES) {
  const page = await readFile(file, "utf8");
  assert.ok(page.includes("Let’s make"), `${file} is missing the contact block`);
  assert.ok(!/Syne|DM Sans/.test(page), `${file} still references a retired font`);
  const rest = page.replaceAll("Café website, Davao City", "").replaceAll("Café website · Davao City", "").replace(/Space Arabica is a café in Ecoland, Davao City/g, "");
  assert.ok(!rest.includes("Davao City"), `${file} shows a personal location`);
}
const notFound = await readFile("public/404.html", "utf8");
assert.ok(notFound.includes("#0d0f11") && !/font-size:\s*(?:[0-9]|10)(?:\.\d+)?px/.test(notFound), "404 uses the dark base and no text under 11px");
assert.ok(homeHtml.includes('id="about"') && homeHtml.includes("both sides"), "home has the About section");

// Case studies: one template, all four projects.
for (const [i, p] of projects.entries()) {
  const page = await readFile(`dist/work/${p.slug}/index.html`, "utf8");
  const next = projects[(i + 1) % projects.length];
  assert.ok(new RegExp(`<h1[^>]*>${p.name}</h1>`).test(page), `${p.slug}: h1`);
  for (const text of [p.question, ...p.decisions.map(d => d.title), ...p.tabs.map(t => t.title)]) assert.ok(page.includes(html(text)), `${p.slug} case is missing: ${text}`);
  assert.ok(page.includes(`href="/work/${next.slug}/"`), `${p.slug}: next project link`);
  assert.ok(page.includes(`<link rel="canonical" href="https://by-shion.dev/work/${p.slug}/"`), `${p.slug}: canonical`);
  assert.ok(page.includes(`${p.name} — Joshua Sabuero</title>`), `${p.slug}: title`);
}
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, 5, "sitemap lists five routes");

// First paint: prerendered pages paint before the bundle loads, and the transition script is inline.
for (const file of CHROME_ROUTES) {
  const page = await readFile(file, "utf8");
  assert.ok(!/<script[^>]*type="module"[^>]*blocking="render"/.test(page), `${file}: the app bundle blocks rendering`);
  assert.ok(!/<script[^>]*src="[^"]*project-transitions\.js"/.test(page), `${file}: the transition script is a separate render-blocking request`);
  assert.ok(page.includes("pagereveal"), `${file}: the inline transition script is missing`);
}
// Chapter frames offer the small wall-sized image to small screens.
for (const p of projects) assert.ok(homeHtml.includes(`media/work/${p.slug}/wall/${p.desktop.src.split("/").pop()} 640w`), `${p.slug}: chapter frame has no small image`);

const spaceCaseHtml = await readFile("dist/work/space-arabica/index.html", "utf8");
assert.ok(spaceCaseHtml.includes("View demo"));
assert.ok(!spaceCaseHtml.includes("vercel.app"));

// The hosted Space Arabica demo: the current seven pages, each marked as a work in progress, with nothing that sends.
for (const page of ["index.html", "menu.html", "full-menu.html", "space.html", "order.html", "story.html", "contact.html"]) {
  const demoHtml = await readFile(`dist/work/space-arabica/demo/${page}`, "utf8");
  assert.ok(demoHtml.includes("Work in progress") && demoHtml.includes('class="wip-banner"'), `${page}: banner`);
  for (const match of demoHtml.matchAll(/<(?:input|textarea|select)[^>]*>/g))
    assert.ok(match[0].includes("disabled") && match[0].includes("readonly"), `${page}: live field ${match[0].slice(0, 60)}`);
  for (const match of demoHtml.matchAll(/<button[^>]*type="submit"[^>]*>/g))
    assert.ok(match[0].includes("disabled"), `${page}: live submit button`);
  assert.ok(!/action="http/.test(demoHtml), `${page}: a form still submits somewhere`);
  assert.ok(!/href="https:\/\/m\.me\//.test(demoHtml), `${page}: a Messenger link is still live`);
}

console.log(
  "Static checks passed: five prerendered routes, chapters and case studies complete, seven-page Space Arabica demo with the WIP banner and nothing that sends, official email, all local references resolve.",
);
