import { readFile, mkdir, writeFile } from "node:fs/promises";
import { render } from "../.prerender/entry-server.js";

const template = await readFile("dist/index.html", "utf8");
const origin = "https://by-shion.dev";
const routes = [
  [
    "/",
    "Joshua Sabuero — Web Designer & Developer",
    "I design and build websites and digital products. Explore Space Arabica and Korte through an interactive portfolio.",
  ],
  [
    "/work/space-arabica/",
    "Space Arabica — Joshua Sabuero",
    "Designing and building a café website with expressive motion, a distinct visual identity, and a clear menu experience.",
  ],
  [
    "/work/korte/",
    "Korte — Pickleball, all in one place | Joshua Sabuero",
    "Designing and building an all-in-one pickleball app for the Philippines, connecting player discovery, clubs, court bookings and open-play management.",
  ],
];
for (const [path, title, description] of routes) {
  const body = render(path);
  let html = template
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/s,
      `$1${description}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/s,
      `$1${title}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/s,
      `$1${description}$2`,
    );
  const url = `${origin}${path}`;
  html = html
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, `$1${url}$2`);
  if (path === "/work/korte/") html = html.replace('content="#111113"', 'content="#eef3f4"');
  const person = { "@type": "Person", "@id": `${origin}/#joshua`, name: "Joshua Sabuero", url: `${origin}/`, email: "create@by-shion.dev", jobTitle: "Designer and developer", sameAs: ["https://github.com/Shion-main", "https://www.linkedin.com/in/joshua-robert-sabuero-6b3677373/"] };
  const structured = {
    "@context": "https://schema.org",
    "@graph": [person, path === "/" ? { "@type": "WebSite", name: "Joshua Sabuero", url, author: { "@id": person["@id"] } } : { "@type": "CreativeWork", name: title, description, url, author: { "@id": person["@id"] } }],
  };
  html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(structured).replaceAll("<", "\\u003c")}</script>\n</head>`);
  if (!html.includes("<h1"))
    throw new Error(`Missing prerendered content: ${path}`);
  const directory = `dist${path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}index.html`, html);
  console.log(`Prerendered ${path}`);
}
await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(([path]) => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>\n`);
