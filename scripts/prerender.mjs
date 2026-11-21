import { readFile, mkdir, writeFile } from "node:fs/promises";
import { render } from "../.prerender/entry-server.js";
import { loadTs } from "./tests/load-ts.mjs";

const transitionScript = (await readFile("public/project-transitions.js", "utf8")).replaceAll("</script", "<\\/script");
// Inline the transition script: it must run before first paint, and a separate request would block rendering.
const template = (await readFile("dist/index.html", "utf8")).replace(/<script src="[^"]*project-transitions\.js"><\/script>/, `<script>${transitionScript}</script>`);
const origin = "https://by-shion.dev";
const { projects } = await loadTs("src/work/projects.ts");
const routes = [
  [
    "/",
    "Joshua Sabuero — Web Designer & Developer",
    "I design and build websites and digital products. Explore Space Arabica, Korte, FluxTrack and Atlas Accountancy.",
    "#0d0f11",
  ],
  ...projects.map(p => [`/work/${p.slug}/`, `${p.name} — Joshua Sabuero`, p.line, p.tokens.ground]),
];
for (const [path, title, description, theme] of routes) {
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
  html = html.replace('<meta name="theme-color" content="#0d0f11" />', `<meta name="theme-color" content="${theme}" />`);
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
