import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { loadTs } from "./load-ts.mjs";

const { projects } = await loadTs("src/work/projects.ts");

for (const p of projects) {
  test(`${p.slug}: every shot and wall tile exists`, () => {
    const shots = [p.desktop, p.phone, ...p.tabs.flatMap(t => [t.desktop, t.phone])].filter(Boolean);
    for (const s of shots) assert.ok(existsSync(`public/${s.src}`), s.src);
    for (const name of [...p.wall.desktop, ...p.wall.phone]) {
      const file = `public/media/work/${p.slug}/wall/${name}.webp`;
      assert.ok(existsSync(file), file);
      assert.ok(statSync(file).size <= 40000, `${file} is ${statSync(file).size} bytes`);
    }
  });

  test(`${p.slug}: provenance covers every file`, () => {
    const list = JSON.parse(readFileSync(`public/media/work/${p.slug}/provenance.json`, "utf8"));
    const files = new Set(list.map(e => e.file));
    for (const s of [p.desktop, p.phone, ...p.tabs.flatMap(t => [t.desktop, t.phone])].filter(Boolean)) assert.ok(files.has(s.src.replace(`media/work/${p.slug}/`, "")), s.src);
    for (const name of [...p.wall.desktop, ...p.wall.phone]) assert.ok(files.has(`wall/${name}.webp`), name);
    for (const e of list) {
      assert.ok(e.source && e.captured && e.data, JSON.stringify(e));
      assert.doesNotMatch(e.source, /34:11280/, "the reporting dashboard lists real-looking staff names");
    }
  });
}
