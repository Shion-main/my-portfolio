import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const walk = dir => existsSync(dir) ? readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
}) : [];
const posix = path => path.split("\\").join("/");

test("the old animation and deploy tooling is gone", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of ["gsap", "three", "@types/three", "gh-pages", "@fontsource/syne", "@fontsource/dm-sans"]) assert.ok(!(name in deps), name);
  for (const script of ["predeploy", "deploy"]) assert.ok(!(script in pkg.scripts), script);
  assert.ok(!("homepage" in pkg), "homepage points at the old GitHub Pages site");
});

test("every file in public/media is used", () => {
  const html = walk("dist").filter(f => f.endsWith(".html")).map(f => readFileSync(f, "utf8")).join("\n");
  const projects = readFileSync("src/work/projects.ts", "utf8");
  const listed = new Set(walk("public/media/work").filter(f => f.endsWith("provenance.json")).flatMap(f => {
    const dir = posix(relative("public", f)).replace(/provenance\.json$/, "");
    return JSON.parse(readFileSync(f, "utf8")).map(e => dir + e.file);
  }));
  const keep = new Set(["media/social-cover.png", "media/shion-monogram.svg", "media/commission-story.png"]);
  const unused = walk("public/media").map(f => posix(relative("public", f))).filter(path =>
    !keep.has(path) && !path.endsWith("provenance.json") && !listed.has(path) && !html.includes(path) && !projects.includes(path));
  assert.deepEqual(unused, []);
});
