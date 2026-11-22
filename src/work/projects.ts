// Every project the portfolio shows, in chapter order. One shape for all four,
// so the home chapters and case studies stay consistent. No imports: tests
// load this file directly.

export type ProjectSlug = "space-arabica" | "korte" | "fluxtrack" | "atlas-treasury";
export type Shot = { src: string; alt: string; caption: string };
/** `phone` is absent for projects with no phone app (Atlas). */
export type Tab = { title: string; desktop: Shot; phone?: Shot };
export type Fact = { term: string; detail: string };
/** One thing Joshua did on the project: a short title and a sentence or two. */
export type Move = { title: string; text: string };

export type Project = {
  slug: ProjectSlug;
  name: string;
  label: string;
  list: { what: string; part: string; status: string; dot: string; hover: string };
  tokens: { ground: string; text: string; giant: string };
  line: string;
  facts: [Fact, Fact, Fact];
  caption: string;
  desktop: Shot & { title: string };
  phone?: Shot;
  /** The case study, in order: headline, at a glance, the challenge, what I did, results, screens, a line for the
   *  client, and an honest note. */
  headline: string;
  caseFacts: Fact[];
  challenge: string;
  did: Move[];
  results: string[];
  tabs: Tab[];
  forYou: string;
  note: string;
  demo?: string;
  /** The live site, when it differs from the work shown here (Space Arabica: Joshua's second design, made to the owner's brief). */
  live?: { url: string; label: string };
  wall: { desktop: string[]; phone: string[] };
  giantFit: number;
  glow: string;
};

const shot = (slug: ProjectSlug, name: string, alt: string, caption: string): Shot => ({ src: `media/work/${slug}/${name}.webp`, alt, caption });

const space = (name: string, alt: string, caption: string) => shot("space-arabica", name, alt, caption);
const korte = (name: string, alt: string, caption: string) => shot("korte", name, alt, caption);
const flux = (name: string, alt: string, caption: string) => shot("fluxtrack", name, alt, caption);
const atlas = (name: string, alt: string, caption: string) => shot("atlas-treasury", name, alt, caption);

export const projects: readonly Project[] = [
  {
    slug: "space-arabica",
    name: "Space Arabica",
    label: "Café website · Ecoland, Davao City",
    list: { what: "Café website, Davao City", part: "Design + build", status: "Live", dot: "#c9934a", hover: "#d9a45f" },
    tokens: { ground: "#1b130d", text: "#f1e3cc", giant: "#c9934a" },
    line: "A café’s character, carried online — the drinks lead, the full menu is one tap away.",
    facts: [
      { term: "Role", detail: "Sole designer & developer" },
      { term: "Scope", detail: "7 pages" },
      { term: "Status", detail: "Live" },
    ],
    caption: "Home · desktop and phone",
    desktop: { ...space("home-desktop", "Space Arabica home page with the Timeless Americano in the signature drink carousel", "Home · signature carousel"), title: "Space Arabica — Home" },
    phone: space("home-phone", "Space Arabica home page on a phone with the signature carousel", "Home on a phone"),
    headline: "A seven-page website for a Davao café, where the signature drinks lead and the practical details are easy to find.",
    caseFacts: [
      { term: "Client", detail: "Space Arabica, a café in Ecoland, Davao City" },
      { term: "Role", detail: "Sole designer and developer" },
      { term: "Scope", detail: "7 pages · a 104-item menu · 23 drink photos" },
      { term: "Built with", detail: "HTML, CSS, JavaScript" },
      { term: "Status", detail: "Live at spacearabica.com" },
    ],
    challenge: "The café has a feel people know in person. The site had to carry that feel, and still let someone find a drink, the hours or a booking fast.",
    did: [
      { title: "Let the drinks lead", text: "Large type, cup cutouts and a carousel of the nine signature drinks, which works by swipe or keyboard." },
      { title: "Kept browsing and finding apart", text: "Signature drinks are told as stories on Menu; Full Menu is a plain, filterable list of all 104 items." },
      { title: "Made seven pages feel like one visit", text: "One motion idea per page, linked by a single amber line, all switched off for anyone who prefers reduced motion." },
      { title: "Built what the owner chose", text: "The owner wanted a different type of site, so I designed and built a second one to their brief, through their final tweaks. That’s the site live today. My original direction is kept here as a working demo." },
    ],
    results: ["Live at spacearabica.com", "7 pages", "My original direction, playable below"],
    tabs: [
      { title: "Home", desktop: space("home-desktop", "Home page with the orbiting signature drink carousel", "Signature drinks lead"), phone: space("home-phone", "Home page on a phone", "The same carousel, one cup at a time") },
      { title: "Menu", desktop: space("menu-desktop", "Menu page telling each signature drink as an episode", "Menu · signature episodes"), phone: space("menu-phone", "Menu page on a phone", "Episodes on a phone") },
      { title: "Spaces", desktop: space("spaces-desktop", "Spaces page with the café floor plan and meeting room", "Spaces · the room and the meeting room"), phone: space("spaces-phone", "Spaces page on a phone", "Spaces on a phone") },
      { title: "Visit", desktop: space("visit-desktop", "Visit page with live opening hours and directions", "Visit · live opening hours"), phone: space("visit-phone", "Visit page on a phone", "Visit on a phone") },
    ],
    forYou: "If your business has a feel people love in person, I can carry it online and still make the menu, hours and booking easy to find.",
    note: "The screens and the demo show my original direction. No visitor numbers are claimed.",
    demo: "work/space-arabica/demo/",
    live: { url: "https://spacearabica.com/", label: "See the live site — my design to the owner’s brief" },
    wall: {
      desktop: ["home-desktop", "menu-desktop", "fullmenu-desktop", "spaces-desktop", "visit-desktop", "story-desktop"],
      phone: ["home-phone", "menu-phone", "spaces-phone", "story-phone", "visit-phone"],
    },
    giantFit: 122,
    glow: "rgba(201, 147, 74, .2)",
  },
  {
    slug: "korte",
    name: "Korte",
    label: "Pickleball community app · Philippines",
    list: { what: "Pickleball community app", part: "Design + build", status: "In use", dot: "#9acb2d", hover: "#9acb2d" },
    tokens: { ground: "#0c1626", text: "#eef2ea", giant: "#9acb2d" },
    line: "One app for the pickleball community — find open play, book a court, run a fair queue and follow your rankings.",
    facts: [
      { term: "Role", detail: "Solo designer & developer" },
      { term: "Users", detail: "1,800+" },
      { term: "Sessions", detail: "700+ completed" },
    ],
    caption: "Explore on a laptop · the podium on a phone",
    desktop: { ...korte("explore-desktop", "Korte Explore page on a laptop: create a meet, run open play, run a DUPR open play or book a court, with upcoming meets below", "Explore on a laptop"), title: "Korte — Explore" },
    phone: korte("podium-phone", "Korte final results on a phone: the podium for the top three players, with their Korte Points", "Final results · the podium"),
    headline: "One app for the whole pickleball community, with 1,800+ users and 700+ sessions completed, and counting.",
    caseFacts: [
      { term: "Role", detail: "Solo designer and developer" },
      { term: "Timeline", detail: "March to November 2026 · three versions" },
      { term: "Users", detail: "1,800+ and growing" },
      { term: "Sessions completed", detail: "700+ and counting" },
      { term: "For", detail: "Players, organizers and venues" },
      { term: "Built with", detail: "Next.js, Supabase, Convex" },
    ],
    challenge: "Organizers were using one to four different apps just to run open play. Korte brings all of it into one app, and gives players and venues their side of it too.",
    did: [
      { title: "For players", text: "Find open play, book a court, check in at the door, see when you’re up next, and follow the results and rankings, all from your phone." },
      { title: "For organizers", text: "Create a meet, check players in, and let Korte decide who plays next. The longest wait goes first, repeat partners get flagged with a one-tap fix, and results post on their own when the night ends." },
      { title: "For venues", text: "List your courts, take bookings, and put the live courts on a TV for everyone to follow." },
      { title: "Built for courtside", text: "The session keeps running when the connection drops, and organizers get a tablet layout with the courts and the next group side by side." },
    ],
    results: ["1,800+ users", "700+ sessions completed, and counting", "Three versions in eight months; Korte 3.0 launched on 28 October 2026"],
    tabs: [
      { title: "Run a session", desktop: korte("live-desktop", "Live courts on a laptop with four courts in play", "Courts, scores and the next lineup"), phone: korte("courts-phone", "Live courts on a phone while a game is playing", "The same session on a phone") },
      { title: "Players", desktop: korte("tv-desktop", "Court board on a venue TV showing who is on each court", "Court board for the venue TV"), phone: korte("upnext-phone", "Player phone showing You’re up next", "Players follow along on their phones") },
      { title: "Organizer Hub", desktop: korte("hub-desktop", "Organizer Hub overview with session numbers", "Organizer Hub · your numbers"), phone: korte("podium-phone", "Standings podium at the end of a session", "Standings at the end") },
      { title: "Venues", desktop: korte("partner-desktop", "Partner dashboard for a venue taking bookings", "Partner dashboard for venues"), phone: korte("checkin-phone", "Player self check-in, picking their name", "Self check-in at the door") },
    ],
    forYou: "If your community runs on scattered tools, I can design and build the one app that brings it together.",
    note: "App screens use made-up names; the Explore screen is the public page at korteph.app/explore. User and session numbers are Korte’s own records.",
    wall: {
      desktop: ["explore-desktop", "live-desktop", "tv-desktop", "hub-desktop", "partner-desktop"],
      phone: ["upnext-phone", "explore-phone", "courts-phone", "podium-phone", "checkin-phone"],
    },
    giantFit: 140,
    glow: "rgba(154, 203, 45, .18)",
  },
  {
    slug: "fluxtrack",
    name: "FluxTrack",
    label: "Campus system · Capstone, MMCM",
    list: { what: "Campus attendance & room system", part: "Research, design + build · team of 3", status: "Rollout pending", dot: "#ec1f28", hover: "#ff5a60" },
    tokens: { ground: "#001c43", text: "#ffffff", giant: "#ec1f28" },
    line: "Faculty attendance and live room occupancy in one system — so the school knows how its rooms are really used.",
    facts: [
      { term: "Role", detail: "Research, design + build" },
      { term: "Team", detail: "Three people" },
      { term: "Status", detail: "Rollout pending" },
    ],
    caption: "Facilities desk · faculty phone",
    desktop: { ...flux("util-desktop", "FluxTrack room utilization grid showing when room capacity sits idle", "Facilities · when capacity sits idle"), title: "FluxTrack — Room utilization" },
    phone: flux("faculty-phone", "FluxTrack faculty home with the next class and Scan Room QR", "Faculty · check in from a phone"),
    headline: "A system we researched and pitched to track faculty attendance and show room occupancy in real time, giving the school data on how its rooms are used.",
    caseFacts: [
      { term: "Client", detail: "Mapúa Malayan Colleges Mindanao · capstone project" },
      { term: "Role", detail: "Researched, designed and built it · team of three" },
      { term: "What it does", detail: "Tracks faculty attendance, shows live room occupancy, and reports room use" },
      { term: "Users", detail: "7 roles, from faculty on their phones to the facilities office" },
      { term: "Built with", detail: "Django, Microsoft SQL Server, htmx" },
      { term: "Status", detail: "Built · campus rollout pending" },
    ],
    challenge: "Faculty attendance was checked on paper, and the school had no live view of which rooms were in use. We researched the problem and pitched FluxTrack as the solution: attendance and room occupancy in one system, so the school has real data on how its rooms are used.",
    did: [
      { title: "Attendance at the door", text: "Faculty check in by scanning the room’s QR code, and checkers walk by and confirm it." },
      { title: "Every room, live", text: "A room board shows which rooms are in session right now, and a freed room shows up the moment a class moves." },
      { title: "Data on room use", text: "Reports and a utilization grid show when rooms sit idle, and a weekly report builds itself." },
      { title: "One system for everyone", text: "Seven roles share one design: a phone layout for the floor and a desk layout for the office." },
    ],
    results: ["Attendance and live room occupancy in one system", "Room-use reports for the facilities office", "Built, with campus rollout pending"],
    tabs: [
      { title: "Faculty", desktop: flux("faculty-desktop", "Faculty home on a desktop with today’s classes", "Faculty home on a desktop"), phone: flux("faculty-phone", "Faculty home on a phone with the next class", "Faculty home on a phone") },
      { title: "Scan", desktop: flux("scan-desktop", "Scan room QR on a desktop", "Scan a room QR or type its code"), phone: flux("scan-phone", "Scan room QR on a phone", "Checking in at the door") },
      { title: "Facilities", desktop: flux("util-desktop", "Room utilization grid for facilities", "When capacity sits idle"), phone: flux("util-phone", "Room utilization on a phone", "Utilization on a phone") },
      { title: "Rooms", desktop: flux("buildings-desktop", "Rooms and buildings directory", "Rooms and buildings"), phone: flux("buildings-phone", "Rooms and buildings on a phone", "Rooms on a phone") },
    ],
    forYou: "If your organisation needs to see what’s really happening, I can research the problem, design the system and build it.",
    note: "Screens come from the running app with demo data. No adoption is claimed yet.",
    wall: {
      desktop: ["util-desktop", "faculty-desktop", "buildings-desktop", "scan-desktop"],
      phone: ["faculty-phone", "scan-phone", "buildings-phone", "util-phone", "terms-phone"],
    },
    giantFit: 125,
    glow: "rgba(236, 31, 40, .18)",
  },
  {
    slug: "atlas-treasury",
    name: "Atlas Treasury",
    label: "In-house system · Mapúa · Accounting module",
    list: { what: "Finance request system", part: "UI/UX · Accounting module", status: "In-house", dot: "#5b8def", hover: "#6f9cf0" },
    tokens: { ground: "#13161c", text: "#e8edf6", giant: "#4f86f0" },
    line: "My first UI/UX project — manual finance forms turned into a familiar, easy-to-use system.",
    facts: [
      { term: "Role", detail: "UI/UX designer" },
      { term: "Module", detail: "Accounting" },
      { term: "Size", detail: "100+ screens & states" },
    ],
    caption: "New request · step 3 of 5",
    desktop: { ...atlas("step3-desktop", "Atlas reimbursement request at step 3, payment terms and schedule", "New request · step 3 of 5"), title: "Atlas — New request, step 3" },
    headline: "Turning the Accounting Office’s manual forms and processes into a system that feels familiar from the first request.",
    caseFacts: [
      { term: "Client", detail: "Mapúa Malayan Colleges Mindanao · Atlas, an in-house system" },
      { term: "Role", detail: "UI/UX designer for the accounting module · my first UI/UX project" },
      { term: "Requests", detail: "Reimbursement, vendor payment (trade and non-trade), cash advance" },
      { term: "Size", detail: "100+ screens and states" },
      { term: "Delivered", detail: "Request flows, a component library, a prototype" },
    ],
    challenge: "Reimbursements, vendor payments and cash advances ran on manual forms and processes. The new module had to replace them without asking staff to learn something new.",
    did: [
      { title: "Familiar first", text: "Every screen uses predictable patterns instead of anything novel, so moving from paper feels easy." },
      { title: "One pattern for every request", text: "All four request types share the same list, stepped form, review and tracking view." },
      { title: "Long forms, in steps", text: "A progress bar shows what’s left, and every request ends with a review you can edit before submitting." },
      { title: "Status at a glance", text: "Badges, a timeline and comments stay with each request, so nobody has to ask where it is." },
    ],
    results: ["100+ screens and states", "A component library", "A clickable prototype"],
    tabs: [
      { title: "File a request", desktop: atlas("step1-desktop", "Reimbursement step 1, requester information", "Step 1 · requester information") },
      { title: "Payment terms", desktop: atlas("step3-desktop", "Reimbursement step 3, payment terms and schedule", "Step 3 · payment terms") },
      { title: "Track it", desktop: atlas("journey-desktop", "Request journey tab showing each approval step", "The journey view") },
      { title: "My requests", desktop: atlas("list-desktop", "My requests list with status for each request", "Every request in one list") },
    ],
    forYou: "If your team still runs on paper forms, I can turn them into a system people find familiar from day one.",
    note: "Screens come from the Atlas design file, with signed-in names replaced. These are design deliverables; no usage is claimed.",
    wall: {
      desktop: ["step3-desktop", "journey-desktop", "list-desktop", "step1-desktop", "login-desktop"],
      phone: [],
    },
    giantFit: 122,
    glow: "rgba(79, 134, 240, .2)",
  },
];

export function projectBySlug(slug: ProjectSlug): Project {
  const project = projects.find(p => p.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}

export function nextProject(slug: ProjectSlug): Project {
  const index = projects.findIndex(p => p.slug === slug);
  return projects[(index + 1) % projects.length];
}
