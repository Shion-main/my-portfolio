import { useEffect, useMemo, useRef, useState } from "react";
import { projects, type ProjectSlug } from "../work/projects";
import { asset } from "../work/asset";
import { WALL_PATTERN, shadeEdge, wallColumn, wallSource } from "../motion/scroll";
import "./screen-wall.css";

type Show = ProjectSlug | "all";
const lists = projects.map(p => p.wall);

function tileSrc(which: Show, type: "d" | "p", col: number, i: number) {
  const index = which === "all" ? "all" : projects.findIndex(p => p.slug === which);
  const { project, name } = wallSource(index, type === "d" ? "desktop" : "phone", col, i, lists);
  return asset(`media/work/${projects[project].slug}/wall/${name}.webp`);
}

const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Slanted columns of real screens behind the hero and list. Pointing at a project swaps every tile to that project. */
export default function ScreenWall({ show, hidden }: { show: Show; hidden: boolean }) {
  const [ready, setReady] = useState(false);
  const [override, setOverride] = useState<Show | null>(null);
  const wall = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const current = override ?? show;
  const shown = useRef<Show>("all");

  // Tiles mount after the hero has painted, so its text never waits for them.
  useEffect(() => {
    // Two frames after hydration: the hero has painted, the wall follows.
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setReady(true)); });
    if (import.meta.env.DEV || location.search.includes("checks")) (window as unknown as { __wall: unknown }).__wall = { show: (v: Show) => setOverride(v) };
    return () => cancelAnimationFrame(frame);
  }, []);

  // Swap tiles only after the incoming image has decoded, so no tile ever shows an empty layer.
  useEffect(() => {
    if (!ready || !wall.current || shown.current === current) return;
    shown.current = current;
    const target = current;
    wall.current.querySelectorAll<HTMLElement>(".tile").forEach(tile => {
      const [a, b] = tile.querySelectorAll("img");
      const front = a.classList.contains("on") ? a : b;
      const back = front === a ? b : a;
      const src = tileSrc(target, tile.dataset.t as "d" | "p", Number(tile.dataset.c), Number(tile.dataset.i));
      if (front.getAttribute("src") === src) return;
      back.src = src;
      back.decode().catch(() => undefined).then(() => {
        if (shown.current !== target || !back.complete || back.naturalWidth === 0) return;
        back.classList.add("on");
        front.classList.remove("on");
      });
    });
  }, [current, ready]);

  // One frame loop: columns drift with scroll in alternating directions; the shade follows scroll and pointing.
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = 0;
      const y = window.scrollY;
      shade.current?.style.setProperty("--edge", shadeEdge(y, window.innerHeight, shown.current !== "all").toFixed(3));
      if (reducedMotion()) return;
      wall.current?.querySelectorAll<HTMLElement>(".col").forEach((col, c) => {
        const { dir, speed } = wallColumn(c);
        col.style.transform = `translateY(${(y * speed * dir).toFixed(1)}px)`;
      });
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(draw); };
    queue();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); };
  }, [ready, current]);

  // Rendered once; swaps happen on the DOM above so 160 tiles never re-render.
  const columns = useMemo(() => !ready ? null : WALL_PATTERN.map((type, c) => {
    const { dir, duration } = wallColumn(c);
    const count = type === "d" ? 8 : 6;
    return (
      <div className={`col ${type === "d" ? "col--desk" : "col--phone"}`} key={c}>
        <div className={`col-track${dir === 1 ? " col-track--rev" : ""}`} style={{ "--dur": `${duration}s` } as React.CSSProperties}>
          {Array.from({ length: count * 2 }, (_, k) => {
            const i = k % count;
            return (
              <div className="tile" key={k} data-t={type} data-c={c} data-i={i} style={{ "--i": (c * 2 + i) % 20 } as React.CSSProperties}>
                <img className="on" src={tileSrc("all", type, c, i)} alt="" decoding="async" />
                <img src={tileSrc("all", type, c, i)} alt="" decoding="async" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }), [ready]);

  const pointing = current !== "all";
  const glow = pointing ? projects.find(p => p.slug === current)?.glow : undefined;
  return (
    <>
      <div ref={wall} className={`wall${hidden ? " off" : ""}`} aria-hidden="true" data-show={current}>
        <div className="wall-tilt">{columns}</div>
      </div>
      <div ref={shade} className={`wall-shade${hidden ? " off" : ""}`} aria-hidden="true" />
      <div className={`wall-tint${pointing && !hidden ? " on" : ""}`} style={glow ? ({ "--tint": glow } as React.CSSProperties) : undefined} aria-hidden="true" />
    </>
  );
}
