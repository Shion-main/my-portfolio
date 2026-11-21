import { chromium } from "playwright";
import sharp from "sharp";
const [out, w, h, name, ...pts] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto("http://localhost:4176/?checks"); await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => window.__worlds); await page.evaluate(() => window.__worlds.settle(false));
const bufs = [];
for (const s of pts.map(Number)) {
  await page.evaluate(s => scrollTo(0, document.querySelector(".worlds").offsetTop + s * innerHeight), s);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForFunction(() => window.__worlds.caught(), null, { timeout: 4000 });
  await page.waitForTimeout(250);
  bufs.push(await sharp(await page.screenshot()).resize(480).toBuffer());
}
const meta = await sharp(bufs[0]).metadata();
await sharp({ create: { width: 480 * 3 + 20, height: (meta.height + 10) * Math.ceil(bufs.length / 3), channels: 3, background: "#fff" } })
  .composite(bufs.map((b, i) => ({ input: b, left: (i % 3) * 490, top: Math.floor(i / 3) * (meta.height + 10) }))).png().toFile(`${out}/${name}.png`);
await browser.close();
