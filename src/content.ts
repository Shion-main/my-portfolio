export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export const email = "create@by-shion.dev";
export const contact = (kind: "project" | "role") =>
  `mailto:${email}?subject=${encodeURIComponent(kind === "project" ? "Let’s discuss a project" : "Let’s discuss a role")}`;
export const projects = {
  "space-arabica": {
    name: "Space Arabica",
    category: "Website · Hospitality",
    title: "A little more\nthan coffee.",
    description:
      "Bringing a café’s character to the web. A place to discover its drinks, explore the menu, and get a feel for the space before stepping inside.",
    role: "Sole designer & developer",
    disciplines: "Visual direction, interaction design, responsive development",
    color: "amber",
    cover: "space-home",
    mobile: "space-mobile",
    coverAlt:
      "Space Arabica website with signature drinks, amber typography, and café photography",
    mobileAlt: "Space Arabica signature drink experience on a phone",
    website: "https://space-arabica-2.vercel.app",
    question: "How do you translate the feeling of a place into a website?",
    context:
      "A café has a personality before anyone opens its menu. For Space Arabica, I wanted the website to carry that same sense of place while helping visitors find the practical details: what to drink, where to visit, and how to get in touch.",
    decisions: [
      {
        title: "Let the drinks lead.",
        text: "I built the visual direction around the actual signature drinks. Large type, photographic cutouts, and a rotating composition give each drink room to have its own character.",
        detail:
          "The signature carousel supports keyboard navigation and touch, with a quieter presentation for reduced motion.",
      },
      {
        title: "Separate discovery from detail.",
        text: "The signature selection invites exploration. A separate full menu gives people a direct way to find a familiar drink and compare options.",
        detail:
          "The six-page structure connects the home, menu highlights, full menu, space, story, and contact pages.",
      },
      {
        title: "Keep the character on a smaller screen.",
        text: "On a phone, the hierarchy shifts toward one drink and one clear next step. The visual identity stays intact as the composition changes.",
        detail:
          "Responsive layouts and touch interactions carry the same content across screen sizes.",
      },
    ],
    secondImage: "space-menu",
    secondAlt:
      "Space Arabica full menu with drink categories and product photography",
    secondCaption: "The full menu gives practical browsing its own space.",
    reflection:
      "The useful tension was between atmosphere and access. I used expressive motion for discovery, then a clearer, quieter layout when someone needs to find something specific.",
    evidence:
      "Screens shown are captures of the implemented website. The project is presented through its design and behavior; no commercial impact or participant research is claimed.",
  },
  korte: {
    name: "Korte",
    category: "Web app · Community & sport",
    title: "Less organizing.\nMore playing.",
    description:
      "A pickleball community app built around a moving session: who’s arrived, who’s on court, and what happens next.",
    role: "Sole designer & developer",
    disciplines: "Product design, interface systems, application development",
    color: "lime",
    cover: "korte-live",
    mobile: "korte-mobile",
    coverAlt:
      "Korte local demo session showing two active courts, the next lineup, and the waiting roster",
    mobileAlt:
      "Korte live-session interface on a phone using synthetic demonstration data",
    website: undefined,
    question: "How do you make a changing session easy to understand?",
    context:
      "Players arrive, wait, join a court, finish a match, and return to the queue. The organizer needs to keep track while play continues. I designed and built Korte around those changing states, with the current courts and the next action given clear priority.",
    decisions: [
      {
        title: "Put the current courts first.",
        text: "The live view leads with the courts, then shows who is up next and the waiting roster. These are the pieces an organizer needs to connect in the middle of a session.",
        detail:
          "On a smaller screen, Courts, Up next, and Roster become clear destinations for the task at hand.",
      },
      {
        title: "Make the rules understandable.",
        text: "Different sessions need different rotations. Matchmaking choices explain their purpose, rather than leaving the organizer to infer what “fair” means.",
        detail:
          "Waiting order, game-count equity, and skill constraints have different tradeoffs. More restrictive choices can mean longer waits.",
      },
      {
        title: "Design for the interruption, too.",
        text: "Sitting out is different from losing your history. I kept temporary eligibility separate from completed games and considered how the organizer returns after a same-device interruption.",
        detail:
          "Local session continuity and saved results are separate states. Recovery and completion need clear feedback.",
      },
    ],
    secondImage: "korte-quick",
    secondAlt: "Korte quick-session setup with a demonstration roster",
    secondCaption:
      "Quick-session setup brings the roster and session essentials together.",
    reflection:
      "A clear interface has to reflect a clear state model. The interesting work was making the rules, exceptions, and next actions understandable without asking an organizer to think about the engine underneath.",
    evidence:
      "Live and setup captures come from an inspected local guest flow with synthetic names. They demonstrate the interface, not hosted availability, cross-device synchronization, or measured adoption.",
  },
} as const;
export type ProjectSlug = keyof typeof projects;
