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

// ---- Project list ----
check("list-hover", async () => {
  const { page, context } = await open("/?checks");
  await wallReady(page);
  await page.hover('.row[data-slug="korte"]');
  await page.waitForSelector('.wall[data-show="korte"]', { timeout: 3000 });
  await page.hover("h1");
  await page.waitForSelector('.wall[data-show="all"]', { timeout: 3000 });
  await context.close();
});

check("list-focus", async () => {
  const { page, context } = await open("/?checks");
  await wallReady(page);
  await page.focus('.row[data-slug="space-arabica"]');
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-slug")), "fluxtrack");
  await page.waitForSelector('.wall[data-show="fluxtrack"]', { timeout: 3000 });
  await context.close();
});

check("list-touch", async () => {
  const { page, context } = await open("/?checks", { width: 390, height: 844, hasTouch: true, isMobile: true });
  await wallReady(page);
  await page.tap('.row[data-slug="korte"]');
  await page.waitForFunction(() => location.hash === "#work-korte", null, { timeout: 3000 });
  await page.waitForFunction(() => {
    const h2 = document.getElementById("chapter-korte");
    const r = h2?.getBoundingClientRect();
    return r && r.top >= 0 && r.bottom <= innerHeight && h2.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
  }, null, { timeout: 4000 });
  assert.equal(await page.$eval(".wall", el => el.dataset.show), "all", "touch must not leave the wall pointing at a project");
  assert.ok(await page.$eval('.row[data-slug="korte"] .thumb', el => el.getBoundingClientRect().width > 0), "phones show row thumbnails");
  await context.close();
});

// ---- Project chapters ----
const SIZES = [[1440, 900], [1159, 668], [390, 844], [320, 740]];
const SLUGS = ["space-arabica", "korte", "fluxtrack", "atlas-treasury"];
const chapterState = (page, slug) => page.evaluate(s => {
  const h2 = document.getElementById(`chapter-${s}`);
  const r = h2.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const giant = document.querySelector(`[data-chapter="${s}"] .giant span`).getBoundingClientRect();
  const desk = document.querySelector(`[data-chapter="${s}"] .showcase-desk`).getBoundingClientRect();
  const head = document.querySelector(".site-head").getBoundingClientRect();
  return { visible: r.top >= 0 && r.bottom <= innerHeight && h2.contains(hit), wallOff: !!document.querySelector(".wall.off"), overflow: document.documentElement.scrollWidth - innerWidth, giant: giant.width - innerWidth, deskTop: desk.top, headBottom: head.bottom };
}, slug);

check("chapters-midpoints", async () => {
  for (const [width, height] of SIZES) {
    const { page, context } = await open("/?checks", { width, height });
    await page.evaluate(() => document.fonts.ready);
    for (const slug of SLUGS) {
      await page.evaluate(s => { location.hash = `work-${s}`; }, slug);
      await page.waitForTimeout(500);
      const st = await chapterState(page, slug);
      const at = `${slug} at ${width}x${height}`;
      assert.ok(st.visible, `${at}: heading not visible`);
      assert.ok(st.wallOff, `${at}: wall still showing`);
      assert.ok(st.overflow <= 0, `${at}: horizontal overflow ${st.overflow}px`);
      assert.ok(st.giant <= 1, `${at}: giant name wider than the screen by ${st.giant}px`);
      assert.ok(st.deskTop >= st.headBottom, `${at}: showcase runs under the header`);
    }
    await context.close();
  }
});

check("deep-link", async () => {
  const { page, context } = await open("/#work-korte");
  await page.waitForFunction(() => {
    const h2 = document.getElementById("chapter-korte");
    const r = h2.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight && h2.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)) && document.querySelector(".wall.off");
  }, null, { timeout: 1000 });
  await context.close();
});

check("no-js", async () => {
  const { page, context } = await open("/", { javaScriptEnabled: false });
  for (const slug of SLUGS) {
    await page.locator(`#chapter-${slug}`).scrollIntoViewIfNeeded();
    const ok = await page.evaluate(s => {
      const h2 = document.getElementById(`chapter-${s}`);
      const r = h2.getBoundingClientRect();
      return getComputedStyle(h2).visibility === "visible" && r.top >= 0 && r.bottom <= innerHeight;
    }, slug);
    assert.ok(ok, `${slug} chapter not readable without JavaScript`);
  }
  await context.close();
});

// ---- Header ----
check("header-contrast", async () => {
  const { page, context } = await open("/?checks");
  const ratio = await page.evaluate(() => {
    const rgb = getComputedStyle(document.querySelector(".site-head__name")).color.match(/\d+/g).map(Number);
    const lum = c => { const v = c / 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    const L = ([r, g, b]) => .2126 * lum(r) + .7152 * lum(g) + .0722 * lum(b);
    const a = L(rgb), b = L([13, 15, 17]);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  });
  assert.ok(ratio >= 4.5, `header contrast ${ratio.toFixed(2)}`);
  const tokens = { "space-arabica": "rgb(241, 227, 204)", korte: "rgb(238, 242, 234)", fluxtrack: "rgb(255, 255, 255)", "atlas-treasury": "rgb(232, 237, 246)" };
  for (const slug of SLUGS) {
    await page.evaluate(s => { location.hash = `work-${s}`; }, slug);
    await page.waitForTimeout(600);
    assert.equal(await page.$eval(".site-head__name", el => getComputedStyle(el).color), tokens[slug], `header colour inside ${slug}`);
  }
  await context.close();
});

// ---- Case studies ----
check("tabs-keyboard", async () => {
  const { page, context } = await open("/work/korte/");
  await page.focus('[role="tab"][aria-selected="true"]');
  await page.keyboard.press("ArrowRight");
  const state = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const selected = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
    const panel = document.getElementById(tabs[selected].getAttribute("aria-controls"));
    return { selected, focused: document.activeElement === tabs[selected], panelVisible: !panel.hidden && panel.getBoundingClientRect().height > 0 };
  });
  assert.deepEqual(state, { selected: 1, focused: true, panelVisible: true });
  await page.keyboard.press("End");
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].findIndex(t => t.getAttribute("aria-selected") === "true")), 3);
  await context.close();
});

check("viewer-escape", async () => {
  const { page, context } = await open("/work/fluxtrack/");
  const opener = page.locator('[role="tabpanel"]:not([hidden]) .shot-open').first();
  await opener.focus();
  await page.keyboard.press("Enter");
  await page.waitForSelector("dialog.viewer[open]", { timeout: 2000 });
  assert.ok(await page.$eval("dialog.viewer img", img => img.alt.length > 10), "viewer image has alt text");
  await page.keyboard.press("Escape");
  await page.waitForSelector("dialog.viewer:not([open])", { state: "attached", timeout: 2000 });
  assert.ok(await opener.evaluate(el => el === document.activeElement), "focus returns to the frame");
  await context.close();
});

check("case-layout", async () => {
  for (const slug of SLUGS) {
    const { page, context, errors } = await open(`/work/${slug}/`, { width: 390, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 0, `${slug}: horizontal overflow ${overflow}px`);
    assert.deepEqual(errors, [], `${slug}: console errors`);
    await context.close();
  }
});

// ---- Transitions ----
const RECORD = () => {
  window.__kinds = [];
  window.addEventListener("pagereveal", e => {
    const vt = !!e.viewTransition;
    // After every pagereveal listener has run (microtasks would run between listeners).
    setTimeout(() => window.__kinds.push({ vt, kind: document.documentElement.dataset.transitionKind || null }), 0);
  });
};
async function navigateBy(page, selector) {
  await Promise.all([page.waitForNavigation({ waitUntil: "load" }), page.click(selector)]);
  await page.waitForFunction(() => window.__kinds?.length > 0, null, { timeout: 3000 });
  return page.evaluate(() => window.__kinds[0]);
}

check("morph-into-case", async () => {
  const { page, context, errors } = await open("/#work-korte");
  await context.addInitScript(RECORD);
  await page.waitForTimeout(400);
  const reveal = await navigateBy(page, '[data-chapter="korte"] .chapter-open');
  assert.deepEqual(reveal, { vt: true, kind: "morph" });
  assert.equal(await page.textContent("h1"), "Korte");
  await page.waitForTimeout(1200);
  assert.deepEqual(errors.filter(e => !/aborted|skipped/i.test(e)), []);
  await context.close();
});

check("wipe-next-case", async () => {
  const { page, context } = await open("/work/atlas-treasury/");
  await context.addInitScript(RECORD);
  const reveal = await navigateBy(page, ".case-next");
  assert.equal(new URL(page.url()).pathname, "/work/space-arabica/");
  assert.deepEqual(reveal, { vt: true, kind: "wipe" });
  await context.close();
});

check("back-lands-on-chapter", async () => {
  const { page, context } = await open("/#work-korte");
  await page.waitForTimeout(400);
  for (let round = 0; round < 2; round++) {
    await Promise.all([page.waitForNavigation({ waitUntil: "load" }), page.click('[data-chapter="korte"] .chapter-open')]);
    await page.waitForTimeout(1100);
    await page.goBack({ waitUntil: "load" });
    assert.equal(new URL(page.url()).hash, "#work-korte");
    await page.waitForFunction(() => {
      const h2 = document.getElementById("chapter-korte");
      const r = h2.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight && h2.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    }, null, { timeout: 2000 });
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(() => !!document.querySelector("[data-transition-kind], [data-project-arrival]")), false, "a transition state stayed on the page");
  }
  await context.close();
});

check("transitions-reduced", async () => {
  const { page, context } = await open("/#work-korte", { reducedMotion: "reduce" });
  await context.addInitScript(RECORD);
  await page.waitForTimeout(400);
  const reveal = await navigateBy(page, '[data-chapter="korte"] .chapter-open');
  assert.equal(reveal.kind, null, "reduced motion skips the transition");
  assert.equal(await page.textContent("h1"), "Korte");
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
