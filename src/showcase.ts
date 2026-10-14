import { asset, type ProjectSlug } from "./content";

export type Screen = { id: string; title: string; mobile?: boolean; viewportOnly?: boolean };
export const capture = (id: string, version: "cover" | "full" = "full") => asset(`media/showcase/${id}-${version}.jpg`);
export const preview = (id: string, version: "cover" | "full" = "full") => asset(`media/showcase/previews/${id}-${version}.webp`);
export const bentoPreview = (id: string) => asset(`media/bento/previews/${id}.webp`);

// Captured browser viewports, not cropped derivatives. Source routes and
// fictional-data provenance live in public/media/bento/provenance.json.
export const bentoScreens = [
  { id: "space-home", project: "Space Arabica", slug: "space-arabica", title: "Signature coffee", step: "Discover", device: "desktop", src: "bento/space-home.png", width: 1440, height: 900, tone: "sand" },
  { id: "korte-explore", project: "Korte", slug: "korte", title: "Find a game", step: "Discover", device: "phone", src: "korte-case/explore-mobile.png", width: 390, height: 844, tone: "blue" },
  { id: "korte-live", project: "Korte", slug: "korte", title: "Keep play moving", step: "Play", device: "desktop", src: "showcase/korte-live-cover.jpg", width: 1440, height: 1000, tone: "navy" },
  { id: "space-menu", project: "Space Arabica", slug: "space-arabica", title: "Find your next cup", step: "Choose", device: "phone", src: "bento/space-menu.png", width: 390, height: 844, tone: "clay" },
  { id: "space-contact", project: "Space Arabica", slug: "space-arabica", title: "Plan a visit", step: "Visit", device: "phone", src: "bento/space-contact.png", width: 390, height: 844, tone: "clay" },
  { id: "space-story", project: "Space Arabica", slug: "space-arabica", title: "The story behind the space", step: "Get to know us", device: "desktop", src: "bento/space-story.png", width: 1440, height: 900, tone: "sand" },
  { id: "korte-club", project: "Korte", slug: "korte", title: "Find your people", step: "Connect", device: "phone", src: "korte-case/connect-mobile.png", width: 390, height: 844, tone: "blue" },
  { id: "korte-partner", project: "Korte", slug: "korte", title: "Run your venue", step: "Manage", device: "desktop", src: "korte-case/partner-desktop.png", width: 1440, height: 900, tone: "navy" },
  { id: "korte-home", project: "Korte", slug: "korte", title: "The pickleball community", step: "Welcome", device: "desktop", src: "showcase/korte-home-cover.jpg", width: 1440, height: 1000, tone: "blue" },
  { id: "korte-organizers", project: "Korte", slug: "korte", title: "Open play, under control", step: "Organize", device: "desktop", src: "showcase/korte-organizers-cover.jpg", width: 1440, height: 1000, tone: "navy" },
  { id: "space-space", project: "Space Arabica", slug: "space-arabica", title: "Make yourself at home", step: "Explore", device: "desktop", src: "bento/space-space.png", width: 1440, height: 900, tone: "sand" },
  { id: "korte-setup", project: "Korte", slug: "korte", title: "Bring your players together", step: "Create", device: "desktop", src: "bento/korte-setup.png", width: 1440, height: 900, tone: "blue" },
  { id: "korte-checkin", project: "Korte", slug: "korte", title: "Ready for the first game", step: "Check in", device: "desktop", src: "bento/korte-checkin.png", width: 1440, height: 900, tone: "navy" },
  { id: "space-full-menu", project: "Space Arabica", slug: "space-arabica", title: "Something for every taste", step: "Browse", device: "desktop", src: "bento/space-full-menu.png", width: 1440, height: 900, tone: "clay" },
  { id: "korte-meet", project: "Korte", slug: "korte", title: "A good game starts here", step: "Join", device: "phone", src: "korte-case/discover-mobile.png", width: 390, height: 844, tone: "blue" },
  { id: "korte-book", project: "Korte", slug: "korte", title: "Your time on court", step: "Book", device: "phone", src: "korte-case/book-mobile.png", width: 390, height: 844, tone: "navy" },
  { id: "korte-profile", project: "Korte", slug: "korte", title: "Your player profile", step: "You", device: "phone", src: "bento/korte-profile.png", width: 390, height: 844, tone: "blue" },
  { id: "korte-organize", project: "Korte", slug: "korte", title: "The next open play", step: "Organize", device: "phone", src: "bento/korte-organize.png", width: 390, height: 844, tone: "navy" },
  { id: "korte-score", project: "Korte", slug: "korte", title: "Every point counts", step: "Score", device: "phone", src: "showcase/korte-scoring-mobile-cover.jpg", width: 390, height: 844, tone: "blue" },
  { id: "korte-venue", project: "Korte", slug: "korte", title: "Meet your next court", step: "Find a venue", device: "phone", src: "bento/korte-venue.png", width: 390, height: 844, tone: "navy" },
] as const;

export const projectScreens: Record<ProjectSlug, Screen[]> = {
  "space-arabica": [
    { id: "space-home", title: "Home & signature drinks" },
    { id: "space-menu", title: "Menu highlights" },
    { id: "space-full-menu", title: "The complete menu" },
    { id: "space-space", title: "Inside the café" },
    { id: "space-story", title: "The story" },
    { id: "space-contact", title: "Plan a visit" },
    { id: "space-home-mobile", title: "Home on mobile", mobile: true },
    { id: "space-menu-mobile", title: "Menu on mobile", mobile: true },
    { id: "space-contact-mobile", title: "Contact on mobile", mobile: true },
  ],
  korte: [
    { id: "korte-home", title: "The community website" },
    { id: "korte-players", title: "For players" },
    { id: "korte-organizers", title: "For organizers" },
    { id: "korte-partners", title: "For venue partners" },
    { id: "korte-login", title: "Welcome & sign in" },
    { id: "korte-setup", title: "Build a session" },
    { id: "korte-checkin", title: "Check players in" },
    { id: "korte-live", title: "Courts, queue & roster" },
    { id: "korte-live-dark", title: "Courtside in dark mode" },
    { id: "korte-scoring", title: "Record a result", viewportOnly: true },
    { id: "korte-results", title: "Session standings" },
    { id: "korte-home-mobile", title: "Community on mobile", mobile: true },
    { id: "korte-setup-mobile", title: "Session setup", mobile: true },
    { id: "korte-courts-dark-mobile", title: "Live courts", mobile: true },
    { id: "korte-queue-mobile", title: "The next lineup", mobile: true, viewportOnly: true },
    { id: "korte-roster-mobile", title: "Manage the roster", mobile: true, viewportOnly: true },
    { id: "korte-scoring-mobile", title: "Enter scores", mobile: true, viewportOnly: true },
    { id: "korte-results-mobile", title: "Final standings", mobile: true },
  ],
};
