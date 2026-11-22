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

test("the pinned chapter track matches the timeline", () => {
  // Must equal trackScreens(4) × 100 in src/motion/scroll.ts: arrival .7 + four rests of .55 + three moves of 1 + one screen.
  assert.match(readFileSync("src/components/worlds.css", "utf8"), /\.worlds\.motion \{ height: 690vh; \}/);
});

test("the case-to-case whip's two root images blend normally", () => {
  // They overlap while one slides over the other; the crossfade's default plus-lighter blending would brighten the overlap.
  const css = readFileSync("src/project-transitions.css", "utf8");
  for (const part of ["old", "new"]) {
    const rule = css.match(new RegExp(`:root\\[data-transition-kind="whip"\\]::view-transition-${part}\\(root\\)\\s*\\{([^}]*)\\}`));
    assert.ok(rule, `no whip rule for the ${part} root image`);
    assert.match(rule[1], /mix-blend-mode:\s*normal/, `the whip's ${part} root image does not blend normally`);
  }
});
