import { useEffect, useRef } from "react";

type Dot = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  visibility: number;
  blue: boolean;
};

/** A decorative halftone field. The pointer attracts dots; their home grid
 * supplies the restoring spring. It sleeps when settled instead of looping. */
export default function ParticleField({ simple = false }: { simple?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    let active = false;
    let visible = true;
    let releaseTimer: ReturnType<typeof setTimeout>;
    const interactive = () => !simple && !reduced.matches;

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      for (const dot of dots) {
        if (dot.visibility < 0.015) continue;
        const size = dot.size * (0.25 + 0.75 * dot.visibility);
        context.globalAlpha = dot.alpha * dot.visibility;
        context.fillStyle = dot.blue ? "#85c5eb" : "#e0eaf0";
        context.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
      }
      context.globalAlpha = 1;
    }

    function tick(now: number) {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(2, lastTime ? (now - lastTime) / 16.667 : 1);
      lastTime = now;
      let moving = false;
      const radius = Math.min(190, Math.max(120, width * 0.14));
      for (const dot of dots) {
        const dx = pointerX - dot.homeX;
        const dy = pointerY - dot.homeY;
        const distance = Math.hypot(dx, dy);
        const influence = active ? Math.max(0, 1 - distance / radius) : 0;
        // A smooth radial pull and a small tangential bend suggest a gravity
        // well. Home coordinates, never displaced coordinates, set its range.
        const pull = influence * influence * (3 - 2 * influence);
        const orbit = Math.sin(influence * Math.PI) * 0.16;
        const targetX = dot.homeX + dx * pull - dy * orbit;
        const targetY = dot.homeY + dy * pull + dx * orbit;
        dot.vx = (dot.vx + (targetX - dot.x) * 0.065 * dt) * Math.pow(0.72, dt);
        dot.vy = (dot.vy + (targetY - dot.y) * 0.065 * dt) * Math.pow(0.72, dt);
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;
        const coreDistance = active ? Math.hypot(pointerX - dot.x, pointerY - dot.y) : radius;
        const visibility = Math.min(1, Math.max(0, (coreDistance - 16) / 36));
        dot.visibility += (visibility - dot.visibility) * (1 - Math.pow(0.75, dt));
        const unsettled = Math.abs(dot.x - targetX) + Math.abs(dot.y - targetY) + Math.abs(dot.vx) + Math.abs(dot.vy) + Math.abs(dot.visibility - visibility);
        if (unsettled > 0.025) moving = true;
        else {
          dot.x = targetX;
          dot.y = targetY;
          dot.vx = dot.vy = 0;
          dot.visibility = visibility;
        }
      }
      draw();
      if (moving) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    }

    function wake() {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !context) return;
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = [];
      const spacing = Math.max(7, Math.sqrt(width * height / 9500));
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          const u = x / Math.max(width, 1);
          const v = y / Math.max(height, 1);
          const wave = Math.sin(u * 8 + v * 3 + Math.sin(v * 7) * 1.25)
            + Math.cos(v * 8 - u * 3) * 0.65;
          const band = Math.pow(Math.max(0, 1 - Math.abs(wave) * 0.95), 2);
          // Leave a quieter center for the name and body text.
          const quiet = 0.36 + 0.64 * Math.min(1, Math.abs(u - 0.46) * 2.8);
          const alpha = (0.025 + band * 0.4) * quiet;
          dots.push({ homeX: x, homeY: y, x, y, vx: 0, vy: 0,
            size: (0.65 + band * 2.5) * spacing / 8,
            alpha, visibility: 1, blue: Math.sin(u * 9 + v * 4) > -0.15 });
        }
      }
      active = false;
      draw();
    }

    function move(event: PointerEvent) {
      if (!interactive()) return;
      const bounds = canvas!.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      active = true;
      wake();
      // Touch has no hover: a brief gravity well follows each contact and then
      // springs home. Passive listeners leave native swiping uninterrupted.
      clearTimeout(releaseTimer);
      if (event.pointerType === "touch") releaseTimer = setTimeout(release, 220);
    }

    function release() {
      active = false;
      wake();
    }

    function preferenceChanged() {
      active = false;
      if (interactive()) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        dots.forEach(dot => {
          dot.x = dot.homeX; dot.y = dot.homeY;
          dot.vx = dot.vy = 0; dot.visibility = 1;
        });
        draw();
      }
    }

    function visibilityChanged() {
      active = false;
      lastTime = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) wake();
      else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    });
    observer.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    document.documentElement.addEventListener("pointerleave", release);
    window.addEventListener("blur", release);
    window.addEventListener("scroll", release, { passive: true });
    document.addEventListener("visibilitychange", visibilityChanged);
    reduced.addEventListener("change", preferenceChanged);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(releaseTimer);
      resizeObserver.disconnect(); observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      document.documentElement.removeEventListener("pointerleave", release);
      window.removeEventListener("blur", release);
      window.removeEventListener("scroll", release);
      document.removeEventListener("visibilitychange", visibilityChanged);
      reduced.removeEventListener("change", preferenceChanged);
    };
  }, [simple]);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
