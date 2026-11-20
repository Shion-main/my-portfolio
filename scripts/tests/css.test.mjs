import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src"];

function cssFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return path.endsWith(".css") ? [path] : [];
  });
}

test("no text smaller than 11px", () => {
  const small = [];
  for (const file of ROOTS.flatMap(cssFiles)) {
    const css = readFileSync(file, "utf8");
    for (const m of css.matchAll(/font-size:\s*([\d.]+)px|font:\s*(?:[a-z0-9-]+\s+)*?([\d.]+)px/gi)) {
      const size = Number(m[1] ?? m[2]);
      if (size < 11) small.push(`${file}: ${m[0]}`);
    }
  }
  assert.deepEqual(small, []);
});

test("font licences ship with the fonts in use", () => {
  for (const name of ["newsreader", "anybody", "instrument-sans"]) assert.ok(existsSync(`public/licenses/${name}.txt`), name);
  for (const name of ["syne", "dm-sans"]) assert.ok(!existsSync(`public/licenses/${name}.txt`), name);
});

test("the dark base tokens are defined", () => {
  const css = readFileSync("src/styles/base.css", "utf8");
  for (const token of ["--page: #0d0f11", "--surface: #16191c", "--text: #e8eaeb", "--muted: #8d959c", "--rule: #262b30"]) assert.ok(css.includes(token), token);
});
