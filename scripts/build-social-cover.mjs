// Renders scripts/social-cover.html to public/media/social-cover.png (1200 × 630). Run by hand.
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(resolve("scripts/social-cover.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/media/social-cover.png" });
await browser.close();
console.log("public/media/social-cover.png");
