import test from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const { projects, projectBySlug, nextProject } = await loadTs("src/work/projects.ts");

test("four projects in chapter order", () => {
  assert.deepEqual(projects.map(p => p.slug), ["space-arabica", "korte", "fluxtrack", "atlas-accountancy"]);
});

test("every project fills the same template", () => {
  for (const p of projects) {
    assert.equal(p.facts.length, 3, p.slug);
    assert.equal(p.tabs.length, 4, p.slug);
    assert.ok([3, 4].includes(p.decisions.length), p.slug);
    assert.ok(p.wall.desktop.length >= 4 && (p.phone ? p.wall.phone.length >= 4 : p.wall.phone.length === 0), p.slug);
    for (const shot of [p.desktop, p.phone, ...p.tabs.flatMap(t => [t.desktop, t.phone])].filter(Boolean)) {
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
  // Atlas: Joshua was the UI/UX designer for the Accountancy module (corrected 2026-11-22; it is not the Treasury module).
  assert.equal(projectBySlug("atlas-accountancy").name, "Atlas Accountancy");
  assert.equal(projectBySlug("atlas-accountancy").label, "Institutional project · Accountancy module, MMCM");
  assert.match(text(projectBySlug("atlas-accountancy")), /UI\/UX designer, Accountancy module/);
  assert.doesNotMatch(text(projectBySlug("atlas-accountancy")), /Treasury/);
  // Korte: an all-in-one app for the pickleball community, not only an open-play queue.
  assert.equal(projectBySlug("korte").label, "All-in-one pickleball app · Philippines");
  assert.match(projectBySlug("korte").list.what, /all-in-one/i);
  assert.match(projectBySlug("korte").intro, /all-in-one app for the pickleball community/);
  assert.match(text(projectBySlug("korte")), /players, organizers and venues/i);
  // The Korte chapter's phone shows the end-of-session podium (changed 2026-11-22).
  assert.equal(projectBySlug("korte").phone.src, "media/work/korte/podium-phone.webp");
  assert.match(text(projectBySlug("korte")), /Next\.js, Supabase, Convex/);
  assert.match(text(projectBySlug("korte")), /112 organizers/);
  for (const p of projects) assert.doesNotMatch(text(p), /concept|Aisha|Dones/i, p.slug);
  assert.doesNotMatch(text(projectBySlug("fluxtrack")), /\b(sole|solo)\b/i);
});

test("Atlas has no phone app, so nothing shows it on a phone", () => {
  const atlas = projectBySlug("atlas-accountancy");
  assert.equal(atlas.phone, undefined);
  assert.ok(atlas.tabs.every(t => t.phone === undefined));
  assert.deepEqual(atlas.wall.phone, []);
  const shots = [atlas.desktop, ...atlas.tabs.map(t => t.desktop)];
  assert.ok(shots.every(s => /-desktop\.webp$/.test(s.src)), "an Atlas screen is not a desktop screen");
  assert.doesNotMatch([atlas.caption, ...shots.flatMap(s => [s.alt, s.caption])].join(" "), /phone|portrait|-tall/i);
  for (const slug of ["space-arabica", "korte", "fluxtrack"]) assert.ok(projectBySlug(slug).phone && projectBySlug(slug).tabs.every(t => t.phone), slug);
});

// Both Space Arabica sites are Joshua's design: the demo is his original direction, the live site a second design to the owner's brief.
test("Space Arabica tells the pivot and credits both sites to Joshua", () => {
  const sa = projectBySlug("space-arabica");
  const last = sa.decisions.at(-1);
  assert.equal(last.title, "The owner’s call.");
  assert.match(last.problem, /owner wanted a different type of website/);
  assert.match(last.choice, /designed and built a second site to the owner’s brief/);
  assert.match(last.result, /spacearabica\.com/);
  assert.deepEqual(sa.live, { url: "https://spacearabica.com/", label: "See the live site — my design to the owner’s brief" });
  assert.doesNotMatch(JSON.stringify(sa), /owner’s version/);
  assert.equal(sa.demo, "work/space-arabica/demo/");
});

test("next project loops", () => {
  assert.equal(nextProject("atlas-accountancy").slug, "space-arabica");
  assert.equal(nextProject("space-arabica").slug, "korte");
});

test("the page-transition script lists the same projects", async () => {
  // public/project-transitions.js runs before the app loads, so it keeps its own copy of the slugs.
  const { readFileSync } = await import("node:fs");
  const script = readFileSync("public/project-transitions.js", "utf8");
  const listed = script.match(/const slugs = \[([^\]]*)\]/)[1].match(/'([a-z-]+)'/g).map(s => s.slice(1, -1));
  assert.deepEqual(listed, projects.map(p => p.slug));
});
