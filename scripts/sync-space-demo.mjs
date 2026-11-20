// Copies the current Space Arabica build into the portfolio as a hosted demo:
// every page gets the work-in-progress banner, and nothing on it can send anything.
// Run by hand: SPACE_ARABICA_SITE=<path to space-arabica-2/local-site> node scripts/sync-space-demo.mjs
import { cp, readFile, readdir, rm, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

const SOURCE = process.env.SPACE_ARABICA_SITE ?? "../space-arabica-2/local-site";
const OUT = "public/work/space-arabica/demo";
const SKIP = new Set(["README.md", "vercel.json"]);
const banner = (await readFile("scripts/space-demo/wip-banner.html", "utf8")).trim();

await rm(OUT, { recursive: true, force: true });
await cp(SOURCE, OUT, { recursive: true, filter: src => !SKIP.has(src.split(/[\\/]/).pop()) });
await copyFile("scripts/space-demo/wip-banner.css", join(OUT, "wip-banner.css"));

const disable = tag => tag.replace(/\s*\/?>$/, m => ` disabled readonly tabindex="-1" aria-disabled="true"${m.trim() === "/>" ? " />" : ">"}`);

// Leave out source images nothing on the site references (the build keeps both PNG originals and WebP copies).
const texts = [];
for (const name of await readdir(OUT)) if (/\.(html|css|js|json)$/.test(name)) texts.push(await readFile(join(OUT, name), "utf8"));
const used = texts.join("\n");
for (const file of await readdir(join(OUT, "assets"), { recursive: true })) {
  const base = file.split(/[\\/]/).pop();
  if (base.includes(".") && !used.includes(base)) await rm(join(OUT, "assets", file), { force: true });
}

for (const name of (await readdir(OUT)).filter(n => n.endsWith(".html"))) {
  let html = await readFile(join(OUT, name), "utf8");
  html = html.replace("</head>", '  <link rel="stylesheet" href="wip-banner.css">\n</head>');
  html = html.replace(/<body\b[^>]*>/, body => `${body}\n    ${banner}`);
  // Fields can be seen but not used.
  html = html.replace(/<(?:input|textarea|select)\b[^>]*>/g, disable);
  html = html.replace(/<button\b[^>]*type="submit"[^>]*>/g, tag => tag.replace(/>$/, ' disabled aria-disabled="true">'));
  // Forms go nowhere.
  html = html.replace(/<form\b[^>]*>/g, tag => tag.replace(/\s(?:action|target)="[^"]*"/g, "").replace(/>$/, " data-demo-disabled>"));
  // Messenger links become plain text.
  html = html.replace(/<a\b[^>]*href="https:\/\/m\.me\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g, (_, text) => `<span class="demo-disabled-link">${text}</span>`);
  await writeFile(join(OUT, name), html);
  console.log(`demo: ${name}`);
}
