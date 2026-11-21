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
const SLUGS = ["space-arabica", "korte", "fluxtrack", "atlas-accountancy"];
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
      // Wait until the chapters have drawn: a cold first page can take over half a second to paint its first frame.
      await caughtUp(page);
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
  const tokens = { "space-arabica": "rgb(241, 227, 204)", korte: "rgb(238, 242, 234)", fluxtrack: "rgb(255, 255, 255)", "atlas-accountancy": "rgb(232, 237, 246)" };
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
  for (const [slug, width] of SLUGS.flatMap(s => [[s, 390], [s, 320]])) {
    const { page, context, errors } = await open(`/work/${slug}/`, { width, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 0, `${slug} at ${width}px: horizontal overflow ${overflow}px`);
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
  const { page, context } = await open("/work/atlas-accountancy/");
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

// ---- Review fixes ----
const focusedIsVisible = page => page.evaluate(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return { ok: false, what: "nothing focused" };
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const seen = el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && !!hit && (el === hit || el.contains(hit));
  return { ok: seen, what: `${el.tagName}.${el.className} "${(el.textContent || "").trim().slice(0, 40)}"` };
});

check("chapters-accessible", async () => {
  const { page, context } = await open("/?checks");
  await page.waitForTimeout(300);
  for (const p of ["Space Arabica", "Korte", "FluxTrack", "Atlas Accountancy"]) {
    assert.equal(await page.getByRole("heading", { level: 2, name: p, exact: true }).count(), 1, `${p} heading missing from the accessibility tree`);
    assert.equal(await page.getByRole("link", { name: new RegExp(`Open case study.*${p}`) }).count(), 1, `${p} case-study link has no project in its name`);
  }
  await context.close();
});

check("chapter-focus-visible", async () => {
  const { page, context } = await open("/?checks");
  await page.focus('.row[data-slug="atlas-accountancy"]');
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);
  let st = await focusedIsVisible(page);
  assert.ok(st.ok, `Tab from the list focused something you cannot see: ${st.what}`);
  await page.evaluate(() => { location.hash = "work-atlas-accountancy"; });
  await page.waitForTimeout(500);
  await page.focus('[data-chapter="atlas-accountancy"] .chapter-open');
  await page.keyboard.press("Shift+Tab");
  await page.waitForTimeout(400);
  st = await focusedIsVisible(page);
  assert.ok(st.ok, `Shift+Tab from Atlas focused something you cannot see: ${st.what}`);
  await context.close();
});

check("back-after-scroll", async () => {
  const { page, context, errors } = await open("/?checks");
  await page.click('.row[data-slug="korte"]');
  await page.waitForTimeout(1500);
  // Scroll on to Atlas by hand: the address still says #work-korte unless the page keeps it current.
  await page.evaluate(() => { const a = document.getElementById("work-atlas-accountancy"); window.scrollTo(0, a.getBoundingClientRect().top + scrollY); });
  await page.waitForTimeout(600);
  await Promise.all([page.waitForNavigation({ waitUntil: "load" }), page.click('[data-chapter="atlas-accountancy"] .chapter-open')]);
  await page.waitForTimeout(1100);
  await page.goBack({ waitUntil: "load" });
  await page.waitForFunction(() => {
    const h2 = document.getElementById("chapter-atlas-accountancy");
    const r = h2.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight && h2.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
  }, null, { timeout: 2000 }).catch(async () => { throw new Error(`back landed on ${await page.evaluate(() => location.hash)} instead of Atlas`); });
  assert.deepEqual(errors.filter(e => /view.?transition|duplicate/i.test(e)), [], "view transition errors");
  await context.close();
});

check("deep-link-no-yank", async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // Slow fonts hold back the load event, as they do on a slow phone connection.
  await context.route("**/*.woff2", async r => { await new Promise(res => setTimeout(res, 4000)); await r.continue(); });
  const page = await context.newPage();
  await page.goto(BASE + "/#work-korte", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  assert.notEqual(await page.evaluate(() => document.readyState), "complete", "test setup: the page should still be loading");
  assert.equal(await page.evaluate(() => document.querySelectorAll(".wall .tile").length), 0, "the covered wall mounted its tiles");
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 1600);
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => scrollY);
  await page.waitForFunction(() => document.readyState === "complete", null, { timeout: 30000 });
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => scrollY);
  assert.ok(after >= before - 2, `the page pulled the reader back from ${before} to ${after} when it finished loading`);
  await context.close();
});

check("chapters-landscape", async () => {
  const { page, context } = await open("/?checks", { width: 844, height: 390, isMobile: true, hasTouch: true });
  for (const slug of SLUGS) {
    await page.evaluate(s => { location.hash = `work-${s}`; }, slug);
    await page.waitForTimeout(500);
    const st = await page.evaluate(s => {
      const chapter = document.querySelector(`[data-chapter="${s}"]`);
      const info = chapter.querySelector(".chapter-info").getBoundingClientRect();
      const show = chapter.querySelector(".showcase").getBoundingClientRect();
      const open = chapter.querySelector(".chapter-open").getBoundingClientRect();
      const head = document.querySelector(".site-head").getBoundingClientRect();
      const overlap = Math.max(0, Math.min(info.right, show.right) - Math.max(info.left, show.left)) * Math.max(0, Math.min(info.bottom, show.bottom) - Math.max(info.top, show.top));
      return { overlap: Math.round(overlap), showTop: show.top, headBottom: head.bottom, openInView: open.top >= 0 && open.bottom <= innerHeight };
    }, slug);
    assert.equal(st.overlap, 0, `${slug}: the screens cover the chapter text`);
    assert.ok(st.showTop >= st.headBottom, `${slug}: the screens run under the header`);
    assert.ok(st.openInView, `${slug}: Open case study is off screen`);
  }
  await context.close();
});

check("list-touch-no-sticky-hover", async () => {
  const { page, context } = await open("/?checks", { width: 390, height: 844, hasTouch: true, isMobile: true });
  await page.tap('.row[data-slug="korte"]');
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, document.getElementById("work").offsetTop));
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => ({
    other: getComputedStyle(document.querySelector('.row[data-slug="space-arabica"]')).opacity,
    tapped: getComputedStyle(document.querySelector('.row[data-slug="korte"] .name')).fontStyle,
  }));
  assert.deepEqual(st, { other: "1", tapped: "normal" }, "the list kept its hover look after a tap");
  await context.close();
});

// ---- Push-through (2026-11-22). Positions are screens of scroll from the moment the track pins. ----
const goTo = (page, s) => page.evaluate(s => scrollTo(0, document.querySelector(".worlds").offsetTop + s * innerHeight), s);
async function worldsOpen(options = {}) {
  const opened = await open("/?checks", options);
  await opened.page.evaluate(() => document.fonts.ready);
  await opened.page.waitForFunction(() => window.__worlds, null, { timeout: 3000 });
  await opened.page.evaluate(() => window.__worlds.settle(false));
  return opened;
}
// The drawn position has caught up with the real scroll position.
// Two frames first, so the scroll event has reached the page before asking.
const caughtUp = async page => {
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForFunction(() => window.__worlds.caught(), null, { timeout: 4000 });
};
const chapterLook = (page, slug) => page.evaluate(s => {
  const ch = document.querySelector(`[data-chapter="${s}"]`);
  const scene = ch.querySelector(".scene");
  const ss = scene ? getComputedStyle(scene) : null;
  return {
    opacity: Number(getComputedStyle(ch).opacity),
    transform: ss ? ss.transform : "missing",
    scale: ss && ss.transform !== "none" ? new DOMMatrix(ss.transform).a : 1,
    filter: ss ? ss.filter : "missing",
  };
}, slug);
const flashOpacity = page => page.evaluate(() => {
  const f = document.querySelector(".stage-flash");
  return f ? Number(getComputedStyle(f).opacity) : -1;
});

check("push-through-mid-move", async () => {
  const { page, context } = await worldsOpen();
  // At .45 of the move the dolly is .52 of the way in: about 1.66× at 1440×900, where the laptop is already large.
  await goTo(page, 1.25 + .45); await caughtUp(page);
  let sa = await chapterLook(page, "space-arabica"), ko = await chapterLook(page, "korte");
  assert.ok(sa.scale > 1.5, `Space Arabica is not flying into its screen (scale ${sa.scale})`);
  assert.equal(ko.opacity, 0, "Korte shows too early");
  await goTo(page, 1.25 + .6); await caughtUp(page);
  ko = await chapterLook(page, "korte");
  assert.ok(ko.opacity > .5, `Korte is not in (opacity ${ko.opacity})`);
  assert.ok(ko.scale > .62 && ko.scale < 1, `Korte is not growing toward the camera (scale ${ko.scale})`);
  assert.ok(await flashOpacity(page) > 0, "no flash at the hand-off");
  await goTo(page, 2.25); await caughtUp(page);
  ko = await chapterLook(page, "korte"); sa = await chapterLook(page, "space-arabica");
  assert.equal(ko.transform, "none", `Korte is not at rest (${ko.transform})`);
  assert.equal(sa.opacity, 0, "Space Arabica still shows over Korte at rest");
  await context.close();
});

check("push-through-resize", async () => {
  const { page, context } = await worldsOpen();
  await goTo(page, 1.25 + .3); await caughtUp(page);
  await page.setViewportSize({ width: 1159, height: 668 });
  await page.waitForTimeout(300);
  await goTo(page, 1.25 + .3); await caughtUp(page);
  const st = await page.evaluate(() => {
    const ch = document.querySelector('[data-chapter="space-arabica"]'), scene = ch.querySelector(".scene"), desk = ch.querySelector(".showcase-desk");
    const [ox, oy] = getComputedStyle(scene).transformOrigin.split(" ").map(parseFloat);
    const saved = [ch.style.transform, scene.style.transform, desk.style.transform];
    ch.style.transform = scene.style.transform = desk.style.transform = "";
    const r = desk.querySelector("img").getBoundingClientRect();
    [ch.style.transform, scene.style.transform, desk.style.transform] = saved;
    return { ox, oy, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  });
  assert.ok(Math.abs(st.ox - st.cx) <= 2 && Math.abs(st.oy - st.cy) <= 2, `the dolly aims at ${st.ox},${st.oy} but the screen is at ${st.cx},${st.cy}`);
  await context.close();
});

check("glide-and-jump", async () => {
  const { page, context } = await worldsOpen();
  await goTo(page, .975); await caughtUp(page);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 100);
  const position = () => ({ drawn: window.__worlds.drawn(), real: (scrollY - document.querySelector(".worlds").offsetTop) / innerHeight });
  const lag = await page.evaluate(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r((${position})()))))`);
  assert.ok(lag.drawn < lag.real - .01, `no glide after a wheel click: drawn ${lag.drawn}, real ${lag.real}`);
  await page.waitForTimeout(700);
  const caught = await page.evaluate(position);
  assert.ok(Math.abs(caught.drawn - caught.real) < .001, `the glide never caught up: ${caught.drawn} vs ${caught.real}`);
  await goTo(page, 5.625);
  const seen = await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() =>
    r([...document.querySelectorAll(".chapter")].filter(c => Number(getComputedStyle(c).opacity) > 0).map(c => c.dataset.chapter))))));
  assert.deepEqual(seen, ["atlas-accountancy"], `a jump to Atlas drew ${seen.join(", ")}`);
  await context.close();
});

check("chapters-reduced", async () => {
  const { page, context } = await worldsOpen({ reducedMotion: "reduce" });
  await goTo(page, 1.25 + .3); await caughtUp(page);
  let sa = await chapterLook(page, "space-arabica"), ko = await chapterLook(page, "korte");
  assert.equal(sa.transform, "none", `reduced motion still moves the scene (${sa.transform})`);
  assert.equal(sa.filter, "none", "reduced motion still blurs");
  assert.equal(ko.opacity, 0, "Korte shows before the midpoint");
  assert.equal(await flashOpacity(page), 0, "reduced motion still flashes");
  await goTo(page, 1.25 + .7); await caughtUp(page);
  sa = await chapterLook(page, "space-arabica"); ko = await chapterLook(page, "korte");
  assert.equal(ko.opacity, 1, "Korte is not shown after the midpoint");
  assert.equal(ko.transform, "none", "Korte is not at rest");
  assert.equal(sa.opacity, 0, "Space Arabica still shows after the midpoint");
  await context.close();
});

check("hidden-words-no-click", async () => {
  const { page, context } = await worldsOpen();
  await goTo(page, 1.25 + .2); await caughtUp(page);
  const st = await page.evaluate(() => {
    const link = document.querySelector('[data-chapter="space-arabica"] .chapter-open');
    const r = link.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const el = document.elementFromPoint(x, y);
    return { inView: x > 0 && y > 0 && x < innerWidth && y < innerHeight, hit: !!el && (el === link || link.contains(el)) };
  });
  assert.ok(st.inView, "the faded button left the screen, so this check proves nothing");
  assert.equal(st.hit, false, "the faded-out button can still be clicked");
  await context.close();
});

// ---- Finish the move (2026-11-22) ----
const position = () => (scrollY - (document.querySelector(".worlds").getBoundingClientRect().top + scrollY)) / innerHeight;
const REST_SPANS = [[.7, 1.25], [2.25, 2.8], [3.8, 4.35], [5.35, 5.9]];
const atRest = (s, px) => REST_SPANS.some(([a, b]) => s >= a - 2 / px && s <= b + 2 / px);
const nearScreens = (s, want, px) => Math.abs(s - want) * px <= 2;
async function settleOpen(options) {
  const opened = await worldsOpen(options);
  await opened.page.evaluate(() => window.__worlds.settle(true));
  // A reader has always given some input before scrolling; until then a chapter in the address wins.
  await opened.page.keyboard.press("Shift");
  return opened;
}

check("settle-forward", async () => {
  const { page, context } = await settleOpen();
  await goTo(page, .975); await caughtUp(page);
  await page.mouse.move(700, 450);
  for (let i = 0; i < 20 && await page.evaluate(position) < 1.25 + .3; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(60); }
  const stop = await page.evaluate(position);
  assert.ok(stop > 1.25 + .25 && stop < 1.25 + .5, `the wheel stopped at ${stop}, outside the case this check is for`);
  await page.waitForTimeout(1500);
  const end = await page.evaluate(position);
  assert.ok(nearScreens(end, 2.25, 900), `stopped at ${stop.toFixed(3)} heading forward, finished at ${end.toFixed(3)} instead of Korte's rest (2.25)`);
  await context.close();
});

check("settle-back", async () => {
  const { page, context } = await settleOpen();
  await goTo(page, 2.25); await caughtUp(page); await page.waitForTimeout(300);
  await page.mouse.move(700, 450);
  for (let i = 0; i < 20 && await page.evaluate(position) > 1.25 + .7; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(60); }
  const stop = await page.evaluate(position);
  assert.ok(stop > 1.25 + .5 && stop < 1.25 + .75, `the wheel stopped at ${stop}, outside the case this check is for`);
  await page.waitForTimeout(1500);
  const end = await page.evaluate(position);
  assert.ok(nearScreens(end, 1.25, 900), `stopped at ${stop.toFixed(3)} heading back, finished at ${end.toFixed(3)} instead of Space Arabica's rest (1.25)`);
  await context.close();
});

check("settle-touch-held", async () => {
  const { page, context } = await settleOpen({ hasTouch: true });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 700, y: 450 }] });
  await goTo(page, 1.25 + .4);
  const held = await page.evaluate(() => scrollY);
  await page.waitForTimeout(600);
  assert.equal(await page.evaluate(() => scrollY), held, "the page finished the move under a finger");
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(1500);
  const end = await page.evaluate(position);
  assert.ok(atRest(end, 900), `after the finger lifted the page stayed mid-move at ${end.toFixed(3)}`);
  await context.close();
});

check("settle-pagedown", async () => {
  const { page, context } = await settleOpen();
  await goTo(page, .975); await caughtUp(page); await page.waitForTimeout(300);
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(1800);
  const end = await page.evaluate(position);
  assert.ok(atRest(end, 900), `PageDown left the page mid-move at ${end.toFixed(3)}`);
  assert.equal(new URL(page.url()).hash, "#work-korte", "PageDown from Space Arabica did not land on Korte");
  await context.close();
});

check("settle-reload", async () => {
  const { page, context } = await worldsOpen();
  await goTo(page, 1.25 + .4); await caughtUp(page);
  // Drop the chapter hash, so the restored scroll position (not a deep link) decides where the page is.
  await page.evaluate(() => history.replaceState(null, "", "/?checks"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const end = await page.evaluate(position);
  assert.ok(atRest(end, 900), `a reload mid-move stayed mid-move at ${end.toFixed(3)}`);
  await context.close();
});

check("settle-input-wins", async () => {
  const { page, context } = await settleOpen();
  await goTo(page, .975); await caughtUp(page); await page.waitForTimeout(300);
  await goTo(page, 1.25 + .4);
  await page.waitForTimeout(170 + 100);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(1500);
  const end = await page.evaluate(position);
  assert.ok(nearScreens(end, 1.25, 900), `scrolling back during a finish ended at ${end.toFixed(3)} instead of back on Space Arabica (1.25)`);
  await context.close();
});

// ---- First arrival through the wall (2026-11-22) ----
const arrivalLook = page => page.evaluate(() => {
  const tilt = document.querySelector(".wall-tilt");
  return {
    dive: getComputedStyle(document.documentElement).getPropertyValue("--dive").trim(),
    scale: tilt ? getComputedStyle(tilt).scale : "missing",
    first: Number(getComputedStyle(document.querySelector('[data-chapter="space-arabica"]')).opacity),
    off: !!document.querySelector(".wall.off"),
  };
});

check("first-arrival", async () => {
  const { page, context } = await worldsOpen();
  await wallReady(page);
  await goTo(page, -.3); await caughtUp(page);
  let st = await arrivalLook(page);
  assert.ok(Number(st.dive) > 0, `the wall does not dive as the list leaves (--dive ${st.dive || "unset"})`);
  assert.ok(st.scale !== "none" && parseFloat(st.scale) > 1, `the wall is not scaling toward the camera (scale ${st.scale})`);
  assert.equal(st.first, 0, "Space Arabica shows before its section is pinned");
  await goTo(page, -.05); await caughtUp(page);
  assert.equal((await arrivalLook(page)).first, 0, "Space Arabica's edge would show sliding up");
  await goTo(page, .12); await caughtUp(page);
  st = await arrivalLook(page);
  assert.ok(st.first > 0 && st.first < 1, `Space Arabica is not emerging (opacity ${st.first})`);
  assert.ok(await flashOpacity(page) > 0, "no flash as Space Arabica emerges");
  await goTo(page, .6); await caughtUp(page); await page.waitForTimeout(700);
  st = await arrivalLook(page);
  assert.equal(st.first, 1, "Space Arabica is not fully in");
  assert.ok(st.off, "the wall is still on under Space Arabica");
  await context.close();

  const reduced = await worldsOpen({ reducedMotion: "reduce" });
  await goTo(reduced.page, -.3); await caughtUp(reduced.page);
  const dive = (await arrivalLook(reduced.page)).dive;
  assert.ok(dive === "" || Number(dive) === 0, `reduced motion still dives into the wall (--dive ${dive})`);
  await reduced.context.close();
});

// ---- Phones and frame budget (2026-11-22) ----
check("push-through-phone", async () => {
  for (const [width, height] of [[390, 844], [844, 390]]) {
    const { page, context } = await worldsOpen({ width, height, isMobile: true, hasTouch: true });
    // At .55 of the move both chapters would be blurred on a desktop.
    await goTo(page, 1.25 + .55); await caughtUp(page);
    const sa = await chapterLook(page, "space-arabica"), ko = await chapterLook(page, "korte");
    assert.equal(sa.filter, "none", `${width}×${height}: the outgoing project is blurred on a phone`);
    assert.equal(ko.filter, "none", `${width}×${height}: the incoming project is blurred on a phone`);
    assert.ok(sa.scale > 1.3, `${width}×${height}: no fly-in on a phone (scale ${sa.scale})`);
    await context.close();
  }
});

// Wheel through the arrival and all three moves like a reader, recording frame intervals.
async function wheelFrames(page, from = -.4, steps = 60) {
  await page.evaluate(s => scrollTo(0, document.querySelector(".worlds").offsetTop + s * innerHeight), from);
  await page.waitForTimeout(800);
  // One recorder per run: a new run stops the previous one.
  await page.evaluate(() => { const run = (window.__run = (window.__run || 0) + 1); window.__frames = []; let last = performance.now(); const tick = now => { if (window.__run !== run) return; window.__frames.push(now - last); last = now; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await page.mouse.move(700, 450);
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(90); }
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const f = window.__frames.slice(2).sort((a, b) => a - b);
    const at = q => f[Math.min(f.length - 1, Math.floor(f.length * q))];
    return { frames: f.length, median: +at(.5).toFixed(1), p95: +at(.95).toFixed(1), max: +f[f.length - 1].toFixed(1), over20: f.filter(v => v > 20).length, over34: f.filter(v => v > 34).length };
  });
}

// Measured on the machine's real GPU: headless Chromium otherwise draws in software (SwiftShader),
// where any blur costs several times what it does on hardware. Software numbers are printed for reference.
const GPU_ARGS = ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"];
async function framesWith(launched) {
  const context = await launched.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + "/?checks", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__worlds, null, { timeout: 3000 });
  await wallReady(page);
  // The first arrival on its own, first on a fresh page (cold: reported, see implementation-checks.md),
  // then again (warm: what every later arrival is like). Slow frames bunched into one moment are visible
  // stutter even when a whole run averages out.
  const cold = await wheelFrames(page, -.6, 13);
  const arrival = await wheelFrames(page, -.6, 13);
  const normal = await wheelFrames(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const slow = await wheelFrames(page);
  const renderer = await page.evaluate(() => { const c = document.createElement("canvas").getContext("webgl"); const e = c && c.getExtension("WEBGL_debug_renderer_info"); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : "unknown"; });
  await context.close();
  return { normal, cold, arrival, slow, renderer };
}

check("chapters-frame-budget", async () => {
  const gpu = await chromium.launch({ headless: !process.env.HEADED, args: GPU_ARGS });
  const onGpu = await framesWith(gpu);
  await gpu.close();
  const inSoftware = await framesWith(browser);
  console.log(`     GPU (${onGpu.renderer.slice(0, 48)}) 1× ${JSON.stringify(onGpu.normal)}`);
  console.log(`     GPU first arrival, cold 1× ${JSON.stringify(onGpu.cold)}`);
  console.log(`     GPU arrival, warm 1× ${JSON.stringify(onGpu.arrival)}`);
  console.log(`     GPU 4× CPU ${JSON.stringify(onGpu.slow)}`);
  console.log(`     software 1× ${JSON.stringify(inSoftware.normal)}`);
  assert.ok(!/SwiftShader/.test(onGpu.renderer), "no real GPU available, so the frame budget cannot be judged here");
  assert.ok(onGpu.normal.p95 <= 17, `95% of frames should take at most 17 ms at full speed on the GPU; p95 was ${onGpu.normal.p95} ms`);
  assert.ok(onGpu.arrival.p95 <= 17, `the first arrival stutters on the GPU: p95 ${onGpu.arrival.p95} ms`);
  // A visitor's very first arrival drops a few frames (measured 7–12); this ceiling keeps it from quietly getting worse.
  assert.ok(onGpu.cold.over20 <= 14, `the cold first arrival dropped ${onGpu.cold.over20} frames (ceiling 14)`);
});

// ---- Review fixes for the push-through (2026-11-22) ----
const visibleChapters = page => page.evaluate(() => [...document.querySelectorAll(".chapter")].filter(c => Number(getComputedStyle(c).opacity) > .99).map(c => c.dataset.chapter));

check("settle-small-steps", async () => {
  const { page, context } = await settleOpen();
  // One wheel notch out of the end of Korte's rest, then a pause: it must advance, not snap back.
  await goTo(page, 2.75); await caughtUp(page); await page.waitForTimeout(400);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(1500);
  let end = await page.evaluate(position);
  assert.ok(nearScreens(end, 3.8, 900), `one wheel notch forward from Korte ended at ${end.toFixed(3)} instead of FluxTrack (3.8)`);
  // Tapping the down arrow walks out of FluxTrack's rest and on to Atlas.
  await goTo(page, 4.075); await caughtUp(page); await page.waitForTimeout(400);
  for (let i = 0; i < 10 && new URL(page.url()).hash !== "#work-atlas-accountancy"; i++) { await page.keyboard.press("ArrowDown"); await page.waitForTimeout(600); }
  await page.waitForTimeout(1200);
  end = await page.evaluate(position);
  assert.equal(new URL(page.url()).hash, "#work-atlas-accountancy", `arrow keys could not leave FluxTrack (stuck at ${end.toFixed(3)})`);
  assert.ok(atRest(end, 900), `arrow keys left the page mid-move at ${end.toFixed(3)}`);
  await context.close();
});

check("reduced-no-drift", async () => {
  const { page, context } = await worldsOpen({ reducedMotion: "reduce" });
  const shots = [];
  for (const s of [2.325, 2.525, 2.725]) {
    await goTo(page, s); await caughtUp(page);
    shots.push(await page.evaluate(() => {
      const ch = document.querySelector('[data-chapter="korte"]');
      return [getComputedStyle(ch.querySelector(".showcase-desk")).transform, getComputedStyle(ch.querySelector(".showcase-phone")).transform].join(" | ");
    }));
  }
  assert.ok(shots.every(x => x === "none | none"), `reduced motion still moves the screens with scroll: ${shots.join(" / ")}`);
  await context.close();
});

check("settle-reload-keeps-hash", async () => {
  for (const [s, slug] of [[1.25 + .3, "space-arabica"], [1.25 + .7, "korte"]]) {
    const { page, context } = await worldsOpen();
    await goTo(page, s); await caughtUp(page);
    assert.equal(new URL(page.url()).hash, `#work-${slug}`, "the address does not name the chapter being read");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const end = await page.evaluate(position);
    assert.ok(atRest(end, 900), `a reload at ${s} stayed mid-move at ${end.toFixed(3)}`);
    assert.equal(new URL(page.url()).hash, `#work-${slug}`, `a reload on ${slug} ended on ${new URL(page.url()).hash}`);
    const shown = await visibleChapters(page);
    assert.deepEqual(shown, [slug], `a reload on ${slug} shows ${shown.join(", ")}`);
    await context.close();
  }
});

check("settle-from-list", async () => {
  const { page, context } = await settleOpen();
  // PageDown from the end of the list lands on Space Arabica, not on the empty wall.
  await goTo(page, -1); await page.waitForTimeout(500);
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(2200);
  let end = await page.evaluate(position);
  assert.ok(nearScreens(end, .7, 900), `PageDown from the list ended at ${end.toFixed(3)} instead of Space Arabica (0.7)`);
  assert.deepEqual(await visibleChapters(page), ["space-arabica"], "Space Arabica is not on screen");
  // A few notches back up from Space Arabica return to the list, not the empty wall.
  await goTo(page, .975); await caughtUp(page); await page.waitForTimeout(400);
  await page.mouse.move(700, 450);
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(60); }
  await page.waitForTimeout(2200);
  end = await page.evaluate(position);
  const listBottom = await page.evaluate(() => document.querySelector(".rows").getBoundingClientRect().bottom);
  assert.ok(nearScreens(end, -.6, 900), `scrolling back up from Space Arabica ended at ${end.toFixed(3)} instead of the list (-0.6)`);
  assert.ok(listBottom > 100, "the list is not in view");
  await context.close();
});

check("rotate-at-rest", async () => {
  const { page, context } = await worldsOpen({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.__worlds.settle(true));
  await page.evaluate(() => { location.hash = "work-korte"; });
  await caughtUp(page); await page.waitForTimeout(400);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(1500);
  assert.equal(new URL(page.url()).hash, "#work-korte", `rotating on Korte moved to ${new URL(page.url()).hash}`);
  const shown = await visibleChapters(page);
  assert.deepEqual(shown, ["korte"], `rotating on Korte shows ${shown.join(", ")}`);
  assert.ok(atRest(await page.evaluate(position), 390), "rotating left the page mid-move");
  await context.close();
});

check("settle-pointer-held", async () => {
  const { page, context } = await settleOpen();
  await goTo(page, .975); await caughtUp(page);
  await page.mouse.move(700, 450);
  await page.mouse.down();
  await goTo(page, 1.25 + .45);
  const held = await page.evaluate(() => scrollY);
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => scrollY), held, "the page finished the move under a held mouse button");
  await page.mouse.up();
  await page.waitForTimeout(1500);
  assert.ok(atRest(await page.evaluate(position), 900), "after the button was released the page stayed mid-move");
  await context.close();
});

check("list-click-one-move", async () => {
  const { page, context } = await worldsOpen();
  await page.evaluate(() => window.scrollTo(0, document.getElementById("work").offsetTop));
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__seen = new Set();
    const tick = () => { document.querySelectorAll(".chapter").forEach(c => { if (Number(getComputedStyle(c).opacity) > 0) window.__seen.add(c.dataset.chapter); }); window.__seenRaf = requestAnimationFrame(tick); };
    tick();
  });
  await page.click('.row[data-slug="atlas-accountancy"]');
  await page.waitForTimeout(2500);
  const seen = await page.evaluate(() => { cancelAnimationFrame(window.__seenRaf); return [...window.__seen].sort(); });
  assert.deepEqual(seen, ["atlas-accountancy", "fluxtrack"], `clicking Atlas in the list played ${seen.join(", ")}`);
  assert.equal(new URL(page.url()).hash, "#work-atlas-accountancy");
  assert.deepEqual(await visibleChapters(page), ["atlas-accountancy"], "Atlas is not on screen after the click");
  await context.close();
});

// ---- Long names (2026-11-22: Atlas Accountancy) ----
check("names-not-clipped", async () => {
  for (const [width, height] of [...SIZES, [844, 390], [1366, 768], [1920, 1080]]) {
    const { page, context } = await open("/?checks", { width, height });
    await page.evaluate(() => document.fonts.ready);
    const clipped = await page.evaluate(() => [...document.querySelectorAll(".chapter-info h2")].filter(h => h.scrollWidth - h.clientWidth > 1).map(h => `${h.textContent} by ${h.scrollWidth - h.clientWidth}px`));
    assert.deepEqual(clipped, [], `${width}×${height}: chapter heading clipped: ${clipped.join(", ")}`);
    await context.close();
    const caseView = await open("/work/atlas-accountancy/", { width, height });
    await caseView.page.evaluate(() => document.fonts.ready);
    const h1 = await caseView.page.evaluate(() => { const h = document.querySelector("h1"); return h.scrollWidth - h.clientWidth; });
    assert.ok(h1 <= 1, `${width}×${height}: the Atlas case title runs ${h1}px past its box`);
    await caseView.context.close();
  }
});

// ---- Atlas has no phone app (2026-11-22) ----
check("atlas-no-phone", async () => {
  const { page, context } = await open("/?checks");
  const home = await page.evaluate(() => [...document.querySelectorAll("[data-chapter]")].map(c => [c.dataset.chapter, !!c.querySelector(".showcase-phone, .frame--phone")]));
  assert.deepEqual(home, [["space-arabica", true], ["korte", true], ["fluxtrack", true], ["atlas-accountancy", false]], `phones on the home page: ${JSON.stringify(home)}`);
  await wallReady(page);
  await page.evaluate(() => window.__wall.show("atlas-accountancy"));
  await page.waitForTimeout(900);
  const phoneColumns = await page.evaluate(() => [...document.querySelectorAll(".wall .col--phone")].map(c => getComputedStyle(c).opacity));
  assert.ok(phoneColumns.length > 0 && phoneColumns.every(o => o === "0"), `pointing at Atlas still shows phone columns: ${phoneColumns.join(", ")}`);
  await page.evaluate(() => window.__wall.show("korte"));
  await page.waitForTimeout(900);
  assert.ok((await page.evaluate(() => [...document.querySelectorAll(".wall .col--phone")].map(c => getComputedStyle(c).opacity))).every(o => o === "1"), "phone columns did not come back for Korte");
  await context.close();
  const caseView = await open("/work/atlas-accountancy/");
  const phones = await caseView.page.evaluate(() => document.querySelectorAll(".frame--phone, .tab-shot--phone").length);
  assert.equal(phones, 0, "the Atlas case study shows a phone");
  await caseView.context.close();
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
