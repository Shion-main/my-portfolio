// Browser checks against the production build in real Chromium.
// npm run check:browser [check names...]   (SKIP_BUILD=1 reuses dist, HEADED=1 shows the browser)
import { execSync, spawn } from "node:child_process";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const only = process.argv.slice(2);
const checks = [];
const check = (name, fn) => checks.push({ name, fn });

if (!process.env.SKIP_BUILD) execSync("npm run build", { stdio: "ignore" });
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--port", String(PORT), "--strictPort"], { stdio: "ignore" });
for (let i = 0; i < 100; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch { /* not up yet */ }
  await new Promise(r => setTimeout(r, 150));
}
const browser = await chromium.launch({ headless: !process.env.HEADED });

async function open(path, { width = 1440, height = 900, route, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, ...options });
  if (route) await context.route(route.pattern, route.handler);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  return { page, context, errors };
}
const wallReady = page => page.waitForFunction(() => {
  const tiles = document.querySelectorAll(".wall .tile");
  return tiles.length === 160 && [...document.querySelectorAll(".wall .tile img.on")].every(img => img.complete && img.naturalWidth > 0);
}, null, { timeout: 15000 });

// ---- Screen wall ----
check("wall-renders", async () => {
  const { page, context, errors } = await open("/?checks");
  await wallReady(page);
  assert.equal(await page.$eval(".wall-tilt", el => getComputedStyle(el).rotate), "-14deg");
  assert.equal(await page.$eval(".wall", el => el.getAttribute("aria-hidden")), "true");
  assert.deepEqual(errors, []);
  await context.close();
});

check("wall-swaps-after-decode", async () => {
  const slow = { pattern: "**/media/work/**/wall/**", handler: async r => { await new Promise(res => setTimeout(res, 300)); await r.continue(); } };
  const { page, context } = await open("/?checks", { route: slow });
  await wallReady(page);
  const problems = await page.evaluate(async () => {
    const bad = [];
    window.__wall.show("korte");
    const end = performance.now() + 1500;
    while (performance.now() < end) {
      for (const tile of document.querySelectorAll(".wall .tile")) {
        const on = tile.querySelector("img.on");
        if (!on || !on.complete || on.naturalWidth === 0) { bad.push("empty layer"); break; }
      }
      await new Promise(r => setTimeout(r, 50));
    }
    return bad;
  });
  assert.deepEqual(problems, [], "a tile showed an empty or unloaded layer");
  await page.waitForFunction(() => [...document.querySelectorAll(".wall .tile img.on")].every(img => img.src.includes("/korte/")), null, { timeout: 5000 });
  await context.close();
});

check("wall-reduced", async () => {
  const { page, context } = await open("/?checks", { reducedMotion: "reduce" });
  await wallReady(page);
  assert.equal(await page.$eval(".col-track", el => getComputedStyle(el).animationName), "none");
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(300);
  const moved = await page.$$eval(".wall .col", cols => cols.filter(c => c.style.transform && c.style.transform !== "none").length);
  assert.equal(moved, 0);
  await context.close();
});

let failed = 0;
for (const c of checks) {
  if (only.length && !only.includes(c.name)) continue;
  try {
    await c.fn();
    console.log(`PASS ${c.name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${c.name} — ${String(e.message).split("\n")[0]}`);
  }
}
await browser.close();
server.kill();
process.exit(failed ? 1 : 0);
