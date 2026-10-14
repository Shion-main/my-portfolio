import { useEffect, useRef, type RefObject } from "react";
import { progressAtScroll, type ScrollStop } from "./choreography";

export default function StoryCanvas({
  container,
  onReady,
}: {
  container: RefObject<HTMLDivElement>;
  onReady: (value: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const parent = container.current,
      target = host.current;
    if (!parent || !target) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    Promise.all([
      import("./scene"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ])
      .then(([{ createScene }, { gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const scene = createScene(
          target,
          () => onReady(true),
          () => onReady(false),
        );
        let stops: ScrollStop[] = [];
        const measure = () => {
          const vh = window.innerHeight;
          stops = [...parent.querySelectorAll<HTMLElement>("[data-pose]")].map(
            (el) => {
              const top = el.getBoundingClientRect().top + window.scrollY;
              return {
                y: Math.max(0, top - Math.max(120, vh * 0.16)),
                end: top + Math.max(0, el.offsetHeight - vh) + vh * 0.24,
                progress: Number(el.dataset.pose),
              };
            },
          );
        };
        measure();
        const update = () =>
          scene.setProgress(progressAtScroll(window.scrollY, stops));
        const trigger = ScrollTrigger.create({
          trigger: parent,
          start: "top top",
          end: "bottom bottom",
          onUpdate: update,
          onRefresh: () => {
            measure();
            update();
          },
        });
        update();
        const resize = new ResizeObserver(() => {
          measure();
          update();
        });
        resize.observe(parent);
        const visibility = () => {
          scene.setVisible(!document.hidden);
          if (!document.hidden) update();
        };
        const intersection = new IntersectionObserver(([entry]) =>
          scene.setVisible(entry.isIntersecting && !document.hidden),
        );
        intersection.observe(parent);
        document.addEventListener("visibilitychange", visibility);
        const restore = () => {
          measure();
          update();
        };
        window.addEventListener("pageshow", restore);
        window.addEventListener("hashchange", restore);
        document.fonts.ready.then(() => {
          if (!disposed) ScrollTrigger.refresh();
        });
        cleanup = () => {
          trigger.kill();
          resize.disconnect();
          intersection.disconnect();
          document.removeEventListener("visibilitychange", visibility);
          window.removeEventListener("pageshow", restore);
          window.removeEventListener("hashchange", restore);
          scene.dispose();
        };
      })
      .catch(() => {
        if (!disposed) onReady(false);
      });
    return () => {
      disposed = true;
      cleanup?.();
      onReady(false);
    };
  }, [container, onReady]);
  return <div className="canvas-host" ref={host} />;
}
