import { projects, type ProjectSlug } from "../work/projects";
import { restCenter } from "../motion/scroll";

/** Scroll position that shows a chapter at rest: the middle of its rest when pinned, its top when stacked. */
export function chapterScrollTop(slug: ProjectSlug) {
  const track = document.querySelector<HTMLElement>(".worlds");
  const index = projects.findIndex(p => p.slug === slug);
  if (!track || index < 0) return 0;
  if (!track.classList.contains("motion")) return track.offsetTop + (document.querySelector<HTMLElement>(`[data-chapter="${slug}"]`)?.offsetTop ?? 0);
  return track.offsetTop + restCenter(index) * window.innerHeight;
}
