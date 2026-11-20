import { projects, type ProjectSlug } from "../work/projects";

const COUNT = projects.length;

/** Scroll position that shows a chapter at rest: its midpoint when pinned, its top when stacked. */
export function chapterScrollTop(slug: ProjectSlug) {
  const track = document.querySelector<HTMLElement>(".worlds");
  const index = projects.findIndex(p => p.slug === slug);
  if (!track || index < 0) return 0;
  if (!track.classList.contains("motion")) return track.offsetTop + (document.querySelector<HTMLElement>(`[data-chapter="${slug}"]`)?.offsetTop ?? 0);
  return track.offsetTop + ((index + 0.5) / COUNT) * (track.offsetHeight - window.innerHeight);
}
