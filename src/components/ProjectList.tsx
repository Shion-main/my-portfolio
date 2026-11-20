import type { CSSProperties, MouseEvent } from "react";
import { projects, type ProjectSlug } from "../work/projects";
import { asset } from "../work/asset";

type Point = ProjectSlug | "all";

function goToChapter(event: MouseEvent<HTMLAnchorElement>, slug: ProjectSlug) {
  const id = `work-${slug}`;
  event.preventDefault();
  history.replaceState(null, "", `#${id}`);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** The table of contents. Pointing at a row (mouse or keyboard, never touch) fills the wall with that project's screens. */
export default function ProjectList({ onPoint }: { onPoint: (point: Point) => void }) {
  return (
    <section className="index" id="work" aria-labelledby="work-title">
      <h2 className="label index-title" id="work-title">Selected work · 4 projects</h2>
      <div className="index-head label" aria-hidden="true"><span>Project</span><span>What it is</span><span>My part</span><span>Status</span><span /></div>
      <ul
        className="rows"
        onPointerLeave={() => onPoint("all")}
        onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onPoint("all"); }}
      >
        {projects.map(p => (
          <li key={p.slug}>
            <a
              className="row"
              href={`#work-${p.slug}`}
              data-slug={p.slug}
              style={{ "--hover": p.list.hover, "--dot": p.list.dot } as CSSProperties}
              onPointerEnter={e => { if (e.pointerType === "mouse" || e.pointerType === "pen") onPoint(p.slug); }}
              onFocus={e => { if (e.currentTarget.matches(":focus-visible")) onPoint(p.slug); }}
              onClick={e => goToChapter(e, p.slug)}
            >
              <span className="name">{p.name}</span>
              <span className="cell what">{p.list.what}</span>
              <span className="cell part">{p.list.part}</span>
              <span className="cell status">{p.list.status}</span>
              <span className="arrow" aria-hidden="true">↘</span>
              <img className="thumb" src={asset(`media/work/${p.slug}/wall/${p.wall.desktop[0]}.webp`)} alt="" loading="lazy" decoding="async" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
