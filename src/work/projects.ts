// Every project the portfolio shows, in chapter order. One shape for all four,
// so the home chapters and case studies stay consistent. No imports: tests
// load this file directly.

export type ProjectSlug = "space-arabica" | "korte" | "fluxtrack" | "atlas-treasury";
export type Shot = { src: string; alt: string; caption: string };
export type Tab = { title: string; desktop: Shot; phone: Shot };
export type Fact = { term: string; detail: string };
export type Decision = { title: string; problem: string; choice: string; result: string };

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
  phone: Shot;
  question: string;
  intro: string;
  caseFacts: Fact[];
  tabs: Tab[];
  decisions: Decision[];
  reflection: string;
  evidence: string;
  demo?: string;
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
    label: "Café website · Davao City",
    list: { what: "Café website, Davao City", part: "Design + build", status: "Preview online", dot: "#c9934a", hover: "#d9a45f" },
    tokens: { ground: "#1b130d", text: "#f1e3cc", giant: "#c9934a" },
    line: "A café’s character, carried online — signature drinks lead, the full menu stays one tap away.",
    facts: [
      { term: "Role", detail: "Sole designer & developer" },
      { term: "Scope", detail: "7 pages, each with its own motion" },
      { term: "Built with", detail: "HTML, CSS, JavaScript" },
    ],
    caption: "Home · desktop and phone",
    desktop: { ...space("home-desktop", "Space Arabica home page with the Timeless Americano in the signature drink carousel", "Home · signature carousel"), title: "Space Arabica — Home" },
    phone: space("home-phone", "Space Arabica home page on a phone with the signature carousel", "Home on a phone"),
    question: "How do you translate the feeling of a place into a website?",
    intro: "Space Arabica is a café in Ecoland, Davao City. I designed and built its seven-page website so the drinks, the room and the practical details all carry the same character.",
    caseFacts: [
      { term: "Role", detail: "Sole designer & developer" },
      { term: "Pages", detail: "Home, Menu, Full Menu, Spaces, Order & Book, Our Story, Visit" },
      { term: "Built with", detail: "HTML, CSS, JavaScript" },
      { term: "Menu", detail: "104 entries and 23 drink photos" },
      { term: "Status", detail: "Preview online" },
    ],
    tabs: [
      { title: "Home", desktop: space("home-desktop", "Home page with the orbiting signature drink carousel", "Signature drinks lead"), phone: space("home-phone", "Home page on a phone", "The same carousel, one cup at a time") },
      { title: "Menu", desktop: space("menu-desktop", "Menu page telling each signature drink as an episode", "Menu · signature episodes"), phone: space("menu-phone", "Menu page on a phone", "Episodes on a phone") },
      { title: "Spaces", desktop: space("spaces-desktop", "Spaces page with the café floor plan and meeting room", "Spaces · the room and the meeting room"), phone: space("spaces-phone", "Spaces page on a phone", "Spaces on a phone") },
      { title: "Visit", desktop: space("visit-desktop", "Visit page with live opening hours and directions", "Visit · live opening hours"), phone: space("visit-phone", "Visit page on a phone", "Visit on a phone") },
    ],
    decisions: [
      { title: "Let the drinks lead.", problem: "A café has a personality before anyone opens its menu, and a generic coffee template would hide it.", choice: "I built the visual direction around the café’s real signature drinks: large type, transparent cup cutouts and an orbiting carousel.", result: "Each drink gets its own stage, with keyboard and touch control and a quiet version for reduced motion." },
      { title: "Separate discovery from detail.", problem: "Expressive browsing slows down someone who just wants a familiar drink and its price.", choice: "Signature drinks live on Menu as episodes; Full Menu is plain, filterable and lists every entry.", result: "Exploring and finding are two clear routes from the same navigation." },
      { title: "One motion idea per page.", problem: "Seven animated pages felt like seven separate rooms.", choice: "An amber line links every page and one framed window morphs between them, while each page keeps a single idea of its own.", result: "The site reads as one continuous visit, and reduced motion turns it all off." },
    ],
    reflection: "The useful tension was between atmosphere and access. I used expressive motion for discovery, then a clearer, quieter layout when someone needs to find something specific.",
    evidence: "Screens are captures of the implemented site from its local build on 21 November 2026. No commercial impact or visitor research is claimed.",
    demo: "work/space-arabica/demo/",
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
    label: "Pickleball open play · Philippines",
    list: { what: "Pickleball open play, Philippines", part: "Design + build", status: "In use", dot: "#9acb2d", hover: "#9acb2d" },
    tokens: { ground: "#0c1626", text: "#eef2ea", giant: "#9acb2d" },
    line: "An organizer pastes the player list; Korte decides who plays next on every court.",
    facts: [
      { term: "Role", detail: "Solo designer & developer" },
      { term: "In use", detail: "112 organizers ran 373 meets, Mar–Jun 2026" },
      { term: "Version", detail: "Korte 3.0 — calmer, light by default" },
    ],
    caption: "Organizer on a laptop · player on a phone",
    desktop: { ...korte("live-desktop", "Korte live session with four courts, scores to enter and a backup reminder", "Live courts on a laptop"), title: "Korte — Live courts" },
    phone: korte("upnext-phone", "Korte player view showing You’re up next, tonight’s record and rankings", "Player · you’re up next"),
    question: "How do you keep 30 players and four courts moving without arguments?",
    intro: "Korte runs pickleball open play in the Philippines. Organizers run sessions from an iPad or laptop beside the court, players follow on their phones, and venues put the courts on a TV. I designed and built all three, from v1 in March to Korte 3.0 in October.",
    caseFacts: [
      { term: "Role", detail: "Solo designer & developer" },
      { term: "When", detail: "March to November 2026 · v1, v2, then 3.0" },
      { term: "Built with", detail: "Next.js, Supabase, Convex" },
      { term: "In use", detail: "112 organizers set up 373 meets between 30 March and 29 June 2026; 239 were completed" },
      { term: "Status", detail: "In use" },
    ],
    tabs: [
      { title: "Run a session", desktop: korte("live-desktop", "Live courts on a laptop with four courts in play", "Courts, scores and the next lineup"), phone: korte("courts-phone", "Live courts on a phone while a game is playing", "The same session on a phone") },
      { title: "Players", desktop: korte("tv-desktop", "Court board on a venue TV showing who is on each court", "Court board for the venue TV"), phone: korte("upnext-phone", "Player phone showing You’re up next", "Players follow along on their phones") },
      { title: "Organizer Hub", desktop: korte("hub-desktop", "Organizer Hub overview with session numbers", "Organizer Hub · your numbers"), phone: korte("podium-phone", "Standings podium at the end of a session", "Standings at the end") },
      { title: "Venues", desktop: korte("partner-desktop", "Partner dashboard for a venue taking bookings", "Partner dashboard for venues"), phone: korte("checkin-phone", "Player self check-in, picking their name", "Self check-in at the door") },
    ],
    decisions: [
      { title: "Why the look changed twice.", problem: "v1 was dark only and built fast, one screen at a time. By September the pages looked like different apps, and on a bright court the dark screens were hard to read.", choice: "One colour system in light and dark, light by default, with Explore as the visual reference for every other screen.", result: "Korte 3.0 shipped on 28 October on one set of light and dark colours — the same colours this case study uses." },
      { title: "Tablet first for organizers.", problem: "Organizers run 10 to 40 players across 2 to 7 courts from an iPad or laptop, and on an upright iPad Live was one long phone column.", choice: "Tablet first for organizers, phone first for players: courts on one side, Up next on the other, growing to a 20-court desktop view and a TV board.", result: "On a tablet, organizers keep the courts and the next group side by side." },
      { title: "Fairness you can see.", problem: "Organizers lost trust when the queue went wrong in front of players. Korte only works if people trust who plays next.", choice: "Show, then let the organizer fix it: Up next warns about repeat partners, and Fix pairing re-pairs inside the session’s rules.", result: "When nothing better exists, the button says so instead of making things worse." },
    ],
    reflection: "The interesting work sat below the surface: a queue organizers can trust, sessions that survive a dropped connection, and screens calm enough to read courtside.",
    evidence: "Screens come from the Korte 3.0 App Screens file and use made-up names. Usage figures are Korte’s own records for 30 March to 29 June 2026.",
    wall: {
      desktop: ["live-desktop", "tv-desktop", "hub-desktop", "partner-desktop"],
      phone: ["upnext-phone", "explore-phone", "courts-phone", "podium-phone", "checkin-phone"],
    },
    giantFit: 140,
    glow: "rgba(154, 203, 45, .18)",
  },
  {
    slug: "fluxtrack",
    name: "FluxTrack",
    label: "Campus system · Capstone, MMCM",
    list: { what: "Campus attendance system", part: "Design + build · team of 3", status: "Rollout pending", dot: "#ec1f28", hover: "#ff5a60" },
    tokens: { ground: "#001c43", text: "#ffffff", giant: "#ec1f28" },
    line: "Faculty attendance and room use — one design system across seven roles, from a faculty phone to the facilities desk.",
    facts: [
      { term: "Role", detail: "Designed and built it · team of three" },
      { term: "Proof", detail: "1,637 automated tests passing" },
      { term: "Status", detail: "Built · campus rollout pending" },
    ],
    caption: "Facilities desk · faculty phone",
    desktop: { ...flux("util-desktop", "FluxTrack room utilization grid showing when room capacity sits idle", "Facilities · when capacity sits idle"), title: "FluxTrack — Room utilization" },
    phone: flux("faculty-phone", "FluxTrack faculty home with the next class and Scan Room QR", "Faculty · check in from a phone"),
    question: "How do you make an attendance record people trust as official?",
    intro: "FluxTrack is Mapúa Malayan Colleges Mindanao’s faculty attendance and facility utilization system. I designed and built it as part of a three-person capstone team: faculty check in by phone, checkers verify rooms on the floor, and deans, HR and facilities read one record from the desk.",
    caseFacts: [
      { term: "Role", detail: "Designed and built it · team of three" },
      { term: "Users", detail: "Seven roles, from phone to desk" },
      { term: "Built with", detail: "Django, Microsoft SQL Server, htmx" },
      { term: "Proof", detail: "1,637 automated tests passing" },
      { term: "Status", detail: "Built · campus rollout pending" },
    ],
    tabs: [
      { title: "Faculty", desktop: flux("faculty-desktop", "Faculty home on a desktop with today’s classes", "Faculty home on a desktop"), phone: flux("faculty-phone", "Faculty home on a phone with the next class", "Faculty home on a phone") },
      { title: "Scan", desktop: flux("scan-desktop", "Scan room QR on a desktop", "Scan a room QR or type its code"), phone: flux("scan-phone", "Scan room QR on a phone", "Checking in at the door") },
      { title: "Facilities", desktop: flux("util-desktop", "Room utilization grid for facilities", "When capacity sits idle"), phone: flux("util-phone", "Room utilization on a phone", "Utilization on a phone") },
      { title: "Rooms", desktop: flux("buildings-desktop", "Rooms and buildings directory", "Rooms and buildings"), phone: flux("buildings-phone", "Rooms and buildings on a phone", "Rooms on a phone") },
    ],
    decisions: [
      { title: "Trust is the product.", problem: "Attendance records are used as official evidence, so an ambiguous screen is a correctness bug.", choice: "Every state is designed — default, loading, error and offline — and checkers get a five-minute undo.", result: "Each verification shows exactly what was recorded and what can still be changed." },
      { title: "Phone first on the floor.", problem: "Faculty, checkers and guards use it on phones between rooms, sometimes offline.", choice: "A real single-column floor experience: scan the room QR or type its code, with offline replay.", result: "Checking in is one card and one button, even on a weak connection." },
      { title: "One system, seven roles.", problem: "Deans, HR and facilities need dense desk tools, while the floor needs quick phone screens.", choice: "One shadcn-style design system in MMCM’s navy and red, shared by a phone family and a desk console.", result: "The 61 pages and 122 frames in the case study use one set of components." },
    ],
    reflection: "Trust comes from clarity and correctness, not decoration. The quiet screens were the hard part.",
    evidence: "Screens come from the FluxTrack case study file, captured from the running app with demo data on a throwaway database. Campus rollout is pending; no adoption is claimed.",
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
    label: "Institutional project · Treasury module, MMCM",
    list: { what: "Finance request workflow", part: "UI/UX · Treasury module", status: "Institutional", dot: "#5b8def", hover: "#6f9cf0" },
    tokens: { ground: "#13161c", text: "#e8edf6", giant: "#4f86f0" },
    line: "Reimbursements, vendor payments and cash advances — filed step by step, then tracked to a decision.",
    facts: [
      { term: "Role", detail: "UI/UX designer, Treasury module" },
      { term: "Size", detail: "100+ screens & states" },
      { term: "Scope", detail: "Flows, UI, design system" },
    ],
    caption: "Request · form, comments and journey",
    desktop: { ...atlas("step3-desktop", "Atlas reimbursement request at step 3, payment terms and schedule", "New request · step 3 of 5"), title: "Atlas — New request, step 3" },
    phone: atlas("form-tall", "Atlas request window stacked three ways: the filled form, its comments and its approval journey", "Form, comments and journey"),
    question: "How do you make a payment request easy to file and easy to follow?",
    intro: "Atlas Treasury is the request and payment module for MMCM’s Accounting and Treasury Office. As its UI/UX designer, I designed how requesters file reimbursements, vendor payments and cash advances, and how they track each one to a decision.",
    caseFacts: [
      { term: "Role", detail: "UI/UX designer, Treasury module" },
      { term: "Requests", detail: "Reimbursement, vendor payment (trade and non-trade), cash advance" },
      { term: "Size", detail: "100+ screens and states" },
      { term: "Delivered", detail: "Request flows, component library, prototype" },
    ],
    tabs: [
      { title: "File a request", desktop: atlas("step1-desktop", "Reimbursement step 1, requester information", "Step 1 · requester information"), phone: atlas("form-tall", "The submitted request as a form, comments and journey", "The submitted request, three ways") },
      { title: "Payment terms", desktop: atlas("step3-desktop", "Reimbursement step 3, payment terms and schedule", "Step 3 · payment terms"), phone: atlas("step3-tall", "Close-up of the payment terms step", "Payment terms, close up") },
      { title: "Track it", desktop: atlas("journey-desktop", "Request journey tab showing each approval step", "The journey view"), phone: atlas("journey-tall", "Close-up of the request journey", "Who has it, and what’s next") },
      { title: "My requests", desktop: atlas("list-desktop", "My requests list with status for each request", "Every request in one list"), phone: atlas("list-tall", "Close-up of the requests list and navigation", "Requests, close up") },
    ],
    decisions: [
      { title: "One shell for four requests.", problem: "Four request types had different fields but the same life cycle.", choice: "One shell for all of them: a request list, a stepper-driven form, a review step and a journey view.", result: "Learning one request teaches all four." },
      { title: "Steps you can see.", problem: "Long finance forms invite mistakes and abandoned requests.", choice: "A five-step stepper with mode-of-payment branching and a final review where any section can be edited.", result: "Requesters always know where they are and what is left." },
      { title: "Track it to a decision.", problem: "Once filed, a request disappeared into email and phone calls.", choice: "A view-form window with Form, Comments and Journey tabs, and cancelling with a confirmation.", result: "Every request shows who has it and what happens next." },
    ],
    reflection: "Finance tools earn trust through plain structure. The stepper and the journey made a long process feel predictable.",
    evidence: "Screens come from the Atlas Treasury design file. Signed-in names are replaced with a demo requester. Claims cover the Treasury module’s design only.",
    wall: {
      desktop: ["step3-desktop", "journey-desktop", "list-desktop", "step1-desktop", "login-desktop"],
      phone: ["form-tall", "list-tall", "journey-tall", "step1-tall", "step3-tall"],
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
