import type { CSSProperties } from "react";

type FrameProps = { src: string; alt: string; className?: string; lazy?: boolean };

/** A screen in a browser window. `morph` names it for the frame-to-hero page transition. */
export function BrowserFrame({ title, src, alt, className = "", lazy = true, morph = false }: FrameProps & { title: string; morph?: boolean }) {
  const style: CSSProperties | undefined = morph ? { viewTransitionName: "project-frame" } : undefined;
  return (
    <figure className={`frame frame--browser ${className}`} style={style}>
      <div className="frame__bar" aria-hidden="true"><i /><i /><i /><span>{title}</span></div>
      <img src={src} alt={alt} loading={lazy ? "lazy" : "eager"} decoding="async" />
    </figure>
  );
}

/** A screen in a phone. */
export function PhoneFrame({ src, alt, className = "", lazy = true }: FrameProps) {
  return (
    <figure className={`frame frame--phone ${className}`}>
      <img src={src} alt={alt} loading={lazy ? "lazy" : "eager"} decoding="async" />
    </figure>
  );
}
