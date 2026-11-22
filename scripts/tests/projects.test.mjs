import test from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const { projects, projectBySlug, nextProject } = await loadTs("src/work/projects.ts");
const text = p => JSON.stringify(p);

test("four projects in chapter order", () => {
  assert.deepEqual(projects.map(p => p.slug), ["space-arabica", "korte", "fluxtrack", "atlas-treasury"]);
});

// The case-study template (approved 2026-11-22): headline, at a glance, the challenge, what I did, results,
// screens, a line for the client, and a note.
test("every project fills the same template", () => {
  for (const p of projects) {
    assert.equal(p.facts.length, 3, p.slug);
    assert.equal(p.tabs.length, 4, p.slug);
    assert.ok(p.headline && p.challenge && p.forYou && p.note, `${p.slug}: headline, challenge, for-you line and note`);
    assert.ok(p.caseFacts.length >= 4 && p.caseFacts.length <= 6, `${p.slug}: ${p.caseFacts.length} facts at a glance`);
    assert.ok([3, 4].includes(p.did.length) && p.did.every(d => d.title && d.text), `${p.slug}: three or four things I did`);
    assert.ok(p.results.length >= 1 && p.results.length <= 4, `${p.slug}: results`);
    assert.ok(p.wall.desktop.length >= 4 && (p.phone ? p.wall.phone.length >= 4 : p.wall.phone.length === 0), p.slug);
    for (const shot of [p.desktop, p.phone, ...p.tabs.flatMap(t => [t.desktop, t.phone])].filter(Boolean)) {
      assert.match(shot.src, new RegExp(`^media/work/${p.slug}/[a-z0-9-]+\\.webp$`));
      assert.ok(shot.alt.length > 10, `${p.slug} alt text`);
    }
    for (const gone of ["question", "intro", "decisions", "reflection", "evidence"]) assert.equal(p[gone], undefined, `${p.slug} still has ${gone}`);
  }
});

test("tokens match the spec", () => {
  assert.deepEqual(projects.map(p => [p.tokens.ground, p.tokens.giant]), [["#1b130d", "#c9934a"], ["#0c1626", "#9acb2d"], ["#001c43", "#ec1f28"], ["#13161c", "#4f86f0"]]);
});

// Clients don't need the technical side (Joshua, 2026-11-22): no test counts, database calls or code metrics.
test("no technical stats in the case studies", () => {
  for (const p of projects) assert.doesNotMatch(text(p), /tests? passing|1,637|1,600|database calls|4,396|breakpoints?|sideways/i, p.slug);
});

test("credits are worded as Joshua confirmed", () => {
  // FluxTrack: researched, pitched, designed and built by a team of three.
  const flux = projectBySlug("fluxtrack");
  assert.match(flux.headline, /^A system we researched and pitched to track faculty attendance and show room occupancy in real time/);
  assert.match(text(flux), /Researched, designed and built it · team of three/);
  assert.equal(flux.list.part, "Research, design + build · team of 3");
  assert.doesNotMatch(text(flux), /\b(sole|solo)\b/i);
  // Atlas: Atlas Treasury, Mapúa's in-house system; Joshua designed the accounting module for the Accounting / Treasury Office.
  const atlas = projectBySlug("atlas-treasury");
  assert.equal(atlas.name, "Atlas Treasury");
  assert.equal(atlas.label, "In-house system · Mapúa · Accounting module");
  assert.match(text(atlas), /UI\/UX designer for the accounting module/);
  assert.match(text(atlas), /in-house system/);
  assert.doesNotMatch(text(atlas), /Accountancy/);
  // Korte: one app for the whole pickleball community, with Joshua's current numbers.
  const korte = projectBySlug("korte");
  assert.equal(korte.label, "Pickleball community app · Philippines");
  assert.match(korte.headline, /^One app for the whole pickleball community, with 1,800\+ users and 700\+ sessions completed/);
  assert.match(korte.challenge, /^Organizers were using one to four different apps just to run open play\./);
  assert.deepEqual(korte.did.map(d => d.title), ["For players", "For organizers", "For venues", "Built for courtside"]);
  assert.match(text(korte), /Players, organizers and venues/);
  assert.doesNotMatch(text(korte), /112 organizers|373 meets/);
  assert.equal(korte.phone.src, "media/work/korte/podium-phone.webp");
  // Korte's main desktop screen is Explore, the public page at korteph.app/explore (Joshua, 2026-11-22).
  assert.equal(korte.desktop.src, "media/work/korte/explore-desktop.webp");
  assert.equal(korte.desktop.title, "Korte — Explore");
  assert.match(korte.note, /korteph\.app\/explore/);
  for (const p of projects) assert.doesNotMatch(text(p), /concept|Aisha|Dones/i, p.slug);
});

test("Atlas is Joshua's first UI/UX work, said on its chapter and in its case study", () => {
  // Confirmed by Joshua 2026-11-22: the Atlas accounting module was his first ever UI/UX work.
  const atlas = projectBySlug("atlas-treasury");
  assert.match(atlas.line, /^My first UI\/UX project/);
  assert.match(atlas.caseFacts.find(f => f.term === "Role").detail, /my first UI\/UX project/);
  for (const p of projects.filter(p => p !== atlas)) assert.doesNotMatch(text(p), /first UI\/UX/i, p.slug);
});

test("Atlas has no phone app, so nothing shows it on a phone", () => {
  const atlas = projectBySlug("atlas-treasury");
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
  const last = sa.did.at(-1);
  assert.equal(last.title, "Built what the owner chose");
  assert.match(last.text, /designed and built a second one to their brief/);
  assert.match(last.text, /original direction is kept here as a working demo/);
  assert.deepEqual(sa.live, { url: "https://spacearabica.com/", label: "See the live site — my design to the owner’s brief" });
  assert.doesNotMatch(text(sa), /owner’s version/);
  assert.equal(sa.demo, "work/space-arabica/demo/");
});

test("next project loops", () => {
  assert.equal(nextProject("atlas-treasury").slug, "space-arabica");
  assert.equal(nextProject("space-arabica").slug, "korte");
});

test("the page-transition script lists the same projects", async () => {
  // public/project-transitions.js runs before the app loads, so it keeps its own copy of the slugs.
  const { readFileSync } = await import("node:fs");
  const script = readFileSync("public/project-transitions.js", "utf8");
  const listed = script.match(/const slugs = \[([^\]]*)\]/)[1].match(/'([a-z-]+)'/g).map(s => s.slice(1, -1));
  assert.deepEqual(listed, projects.map(p => p.slug));
});
