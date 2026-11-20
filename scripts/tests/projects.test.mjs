import test from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const { projects, projectBySlug, nextProject } = await loadTs("src/work/projects.ts");

test("four projects in chapter order", () => {
  assert.deepEqual(projects.map(p => p.slug), ["space-arabica", "korte", "fluxtrack", "atlas-treasury"]);
});

test("every project fills the same template", () => {
  for (const p of projects) {
    assert.equal(p.facts.length, 3, p.slug);
    assert.equal(p.tabs.length, 4, p.slug);
    assert.equal(p.decisions.length, 3, p.slug);
    assert.ok(p.wall.desktop.length >= 4 && p.wall.phone.length >= 4, p.slug);
    for (const shot of [p.desktop, p.phone, ...p.tabs.flatMap(t => [t.desktop, t.phone])]) {
      assert.match(shot.src, new RegExp(`^media/work/${p.slug}/[a-z0-9-]+\\.webp$`));
      assert.ok(shot.alt.length > 10, `${p.slug} alt text`);
    }
  }
});

test("tokens match the spec", () => {
  assert.deepEqual(projects.map(p => [p.tokens.ground, p.tokens.giant]), [["#1b130d", "#c9934a"], ["#0c1626", "#9acb2d"], ["#001c43", "#ec1f28"], ["#13161c", "#4f86f0"]]);
});

test("credits are worded as Joshua confirmed", () => {
  const text = p => JSON.stringify(p);
  assert.match(text(projectBySlug("fluxtrack")), /Designed and built it · team of three/);
  assert.equal(projectBySlug("fluxtrack").list.part, "Design + build · team of 3");
  assert.equal(projectBySlug("atlas-treasury").label, "Institutional project · Treasury module, MMCM");
  assert.match(text(projectBySlug("atlas-treasury")), /UI\/UX designer, Treasury module/);
  assert.match(text(projectBySlug("korte")), /Next\.js, Supabase, Convex/);
  assert.match(text(projectBySlug("korte")), /112 organizers/);
  for (const p of projects) assert.doesNotMatch(text(p), /concept|Aisha|Dones/i, p.slug);
  assert.doesNotMatch(text(projectBySlug("fluxtrack")), /\b(sole|solo)\b/i);
});

test("next project loops", () => {
  assert.equal(nextProject("atlas-treasury").slug, "space-arabica");
  assert.equal(nextProject("space-arabica").slug, "korte");
});
