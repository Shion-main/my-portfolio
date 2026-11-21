// Turns the captured project screens into the WebP files the site serves, plus the
// small tiles for the background wall and a provenance.json per project.
// Run by hand: WORK_MEDIA_SOURCE=<folder of source PNGs> node scripts/build-work-media.mjs
// The build never runs this; its output in public/media/work is committed.
import sharp from "sharp";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SOURCE = process.env.WORK_MEDIA_SOURCE ?? "docs/designs/redesign-2026-11-21/assets/v2";
const OUT = "public/media/work";
const CAPTURED = "2026-11-21";

const DATA = {
  "space-arabica": "Real café content and photography from the local build; no customer data.",
  korte: "Korte 3.0 App Screens with made-up player and organizer names.",
  fluxtrack: "Captured from the running app with demo data on a throwaway database; names are demo data (confirmed by Joshua).",
  "atlas-accountancy": "Design file with placeholder data; the signed-in name is replaced with “Demo Requester”.",
};
const local = page => `local:space-arabica-2@9ba1c45/${page}`;
const figma = (file, node) => `figma:${file}#${node}`;
const K = id => figma("vVaqB6A9lmYpWGUKhbFZy5", id);
const F = id => figma("Tp2icRcQ3dTqFrsQSeGnIS", id);
const A = id => figma("yn261MuzNcCFYyQyA5J3m3", id);

// kind: desktop = 16:10 frame; phone = 390 × 844 frame; tall = phone-shaped crop of a wider source at x.
const MEDIA = {
  "space-arabica": [
    ["home-desktop", "space-desktop", "desktop", local("index.html")],
    ["menu-desktop", "space-menu-desktop", "desktop", local("menu.html")],
    ["fullmenu-desktop", "space-fullmenu-desktop", "desktop", local("full-menu.html")],
    ["spaces-desktop", "space-spaces-desktop", "desktop", local("space.html")],
    ["visit-desktop", "space-visit-desktop", "desktop", local("contact.html")],
    ["story-desktop", "space-story-desktop", "desktop", local("story.html")],
    ["home-phone", "space-phone", "phone", local("index.html")],
    ["menu-phone", "space-menu-phone", "phone", local("menu.html")],
    ["spaces-phone", "space-spaces-phone", "phone", local("space.html")],
    ["story-phone", "space-story-phone", "phone", local("story.html")],
    ["visit-phone", "space-visit-phone", "phone", local("contact.html")],
  ],
  korte: [
    ["live-desktop", "korte-desktop", "desktop", K("33:3599")],
    ["tv-desktop", "korte-tv", "desktop", K("34:4100")],
    ["hub-desktop", "korte-hub-desktop", "desktop", K("69:15315")],
    ["partner-desktop", "korte-partner-desktop", "desktop", K("80:19048")],
    ["upnext-phone", "korte-phone", "phone", K("49:6335")],
    ["explore-phone", "korte-explore-phone", "phone", K("58:8892")],
    ["courts-phone", "korte-courts-phone", "phone", K("24:953")],
    ["podium-phone", "korte-podium-phone", "phone", K("30:2521")],
    ["checkin-phone", "korte-checkin-phone", "phone", K("48:5725")],
  ],
  fluxtrack: [
    ["util-desktop", "flux-rooms-desktop", "desktop", F("34:12807")],
    ["faculty-desktop", "flux-faculty-desktop", "desktop", F("33:1374")],
    ["buildings-desktop", "flux-buildings-desktop", "desktop", F("34:10452")],
    ["scan-desktop", "flux-scan-desktop", "desktop", F("33:2118")],
    ["faculty-phone", "flux-phone", "phone", F("34:30")],
    ["scan-phone", "flux-scan-phone", "phone", F("34:2")],
    ["buildings-phone", "flux-buildings-phone", "phone", F("34:10346")],
    ["util-phone", "flux-util-phone", "phone", F("34:12685")],
    ["terms-phone", "flux-terms-phone", "phone", F("34:13640")],
  ],
  "atlas-accountancy": [
    ["step3-desktop", "atlas-desktop", "desktop", A("1:3542")],
    ["journey-desktop", "atlas-journey", "desktop", A("1:3005")],
    ["list-desktop", "atlas-list-desktop", "desktop", A("1:2981")],
    ["step1-desktop", "atlas-step1-desktop", "desktop", A("1:3432")],
    ["login-desktop", "atlas-login-desktop", "desktop", A("1:7433")],
    ["form-tall", "atlas-portrait", "phone", A("1:6739")],
    ["list-tall", "atlas-list-desktop", "tall", A("1:2981"), 0],
    ["journey-tall", "atlas-journey", "tall", A("1:3005"), 560],
    ["step1-tall", "atlas-step1-desktop", "tall", A("1:3432"), 300],
    ["step3-tall", "atlas-desktop", "tall", A("1:3542"), 300],
  ],
};

// Atlas is a real institutional project: replace the signed-in user's name everywhere it appears.
const HEADER = [
  { left: 1366, top: 22, width: 156, height: 22, text: "Demo Requester", size: 15, fill: "#1d2433", anchor: "end" },
  { left: 1366, top: 45, width: 156, height: 22, text: "Requester", size: 14, fill: "#e2231a", anchor: "end" },
];
const REDACT = {
  "atlas-desktop": HEADER,
  "atlas-list-desktop": HEADER,
  "atlas-step1-desktop": [...HEADER, { left: 378, top: 433, width: 330, height: 28, text: "Demo Requester", size: 15, fill: "#2b2f36", anchor: "start" }],
  "atlas-portrait": [{ left: 58, top: 150, width: 72, height: 11, text: "Demo Requester", size: 5.5, fill: "#5b6270", anchor: "start" }],
};

async function sourceImage(file) {
  const path = join(SOURCE, `${file}.png`);
  const regions = REDACT[file];
  if (!regions) return sharp(path);
  const layers = [];
  for (const r of regions) {
    // Paint over the region with the colour just left of it, then write the replacement text.
    const px = await sharp(path).extract({ left: Math.max(0, r.left - 4), top: r.top + Math.floor(r.height / 2), width: 1, height: 1 }).raw().toBuffer();
    const bg = `rgb(${px[0]},${px[1]},${px[2]})`;
    const x = r.anchor === "end" ? r.width : 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r.width}" height="${r.height}"><rect width="100%" height="100%" fill="${bg}"/><text x="${x}" y="${r.height * 0.72}" font-family="Montserrat, Arial, sans-serif" font-size="${r.size}" fill="${r.fill}" text-anchor="${r.anchor}">${r.text}</text></svg>`;
    layers.push({ input: Buffer.from(svg), left: r.left, top: r.top });
  }
  return sharp(await sharp(path).composite(layers).png().toBuffer());
}

async function render(file, kind, x, width, height, quality) {
  let img = await sourceImage(file);
  if (kind === "tall") {
    const { height: h } = await img.metadata();
    img = sharp(await img.extract({ left: x, top: 0, width: Math.round(h * 0.462), height: h }).png().toBuffer());
  }
  return img.resize(width, height, { fit: "cover", position: "top" }).webp({ quality }).toBuffer();
}

for (const [slug, entries] of Object.entries(MEDIA)) {
  const dir = join(OUT, slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(join(dir, "wall"), { recursive: true });
  const provenance = [];
  for (const [name, file, kind, source, x = 0] of entries) {
    const meta = await sharp(join(SOURCE, `${file}.png`)).metadata();
    const desktop = kind === "desktop";
    // Phone frames keep their captured resolution: 2× captures stay 780 wide, Figma frames stay 390.
    const [w, h] = desktop ? [1440, 900] : meta.width >= 780 && kind === "phone" ? [780, 1688] : [390, 844];
    await writeFile(join(dir, `${name}.webp`), await render(file, kind, x, w, h, 82));
    await writeFile(join(dir, "wall", `${name}.webp`), await render(file, kind, x, desktop ? 640 : 300, desktop ? 400 : 649, 72));
    const note = { source, captured: CAPTURED, data: DATA[slug] };
    provenance.push({ file: `${name}.webp`, ...note }, { file: `wall/${name}.webp`, ...note });
  }
  await writeFile(join(dir, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n");
  console.log(`${slug}: ${entries.length} screens`);
}
