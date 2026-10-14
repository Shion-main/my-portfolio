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
console.log(
  "Static checks passed: three complete pages, official email, no legacy project copy, all local referenced assets exist.",
);
