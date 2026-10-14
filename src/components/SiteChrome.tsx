import { ArrowUpRight, Asterisk, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { asset, contact, email } from "../content";

export function Header({
  home = false,
}: {
  home?: boolean;
}) {
  const base = home ? "" : asset("");
  const header = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    let previous = window.scrollY;
    let direction = 0;
    let distance = 0;
    let frame = 0;

    const reveal = () => {
      setHidden(false);
      distance = 0;
      previous = window.scrollY;
    };
    const update = () => {
      frame = 0;
      // Clamp elastic overscroll so bouncing at either end cannot flip direction.
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const position = Math.max(0, Math.min(window.scrollY, max));
      const delta = position - previous;
      previous = position;
      if (position <= element.offsetHeight + 24 || element.querySelector("details[open], :focus-visible")) {
        setHidden(false);
        distance = 0;
        return;
      }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      // A little travel filters trackpad jitter; returning navigation is quicker.
      if (distance >= (direction > 0 ? 12 : 8)) {
        setHidden(direction > 0);
        distance = 0;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const dismissMenu = (event: PointerEvent) => {
      if (event.target instanceof Node && !element.contains(event.target)) {
        element.querySelector("details[open]")?.removeAttribute("open");
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("pointerdown", dismissMenu);
    element.addEventListener("focusin", reveal);
    element.addEventListener("toggle", reveal, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("pointerdown", dismissMenu);
      element.removeEventListener("focusin", reveal);
      element.removeEventListener("toggle", reveal, true);
    };
  }, []);

  return (
    <>
      <a
        className="skip-link"
        href={home ? "#work-space-arabica" : "#case-content"}
      >
        Skip to work
      </a>
      <header ref={header} className={`site-header${hidden ? " site-header--hidden" : ""}`}>
        <a
          className="identity"
          href={`${base}#top`}
          aria-label="Joshua Sabuero, home"
        >
          <img className="identity-mark" src={asset("media/shion-monogram.svg")} width="48" height="44" alt="" aria-hidden="true" />
          <span>
            Joshua
            <br />
            Sabuero
          </span>
        </a>
        <nav
          aria-label="Main navigation"
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
              event.currentTarget.querySelector("details[open]")?.removeAttribute("open");
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              const menu = event.currentTarget.querySelector("details");
              if (menu?.open) {
                menu.open = false;
                menu.querySelector("summary")?.focus();
              }
            }
          }}
        >
          <details className="work-menu">
            <summary>
              <span className="nav-work-label">Work</span><span className="nav-menu-label">Menu</span><span className="nav-menu-icon" aria-hidden="true">+</span>
            </summary>
            <div>
              <a
                href={home ? "#work-space-arabica" : asset("work/space-arabica/")}
              >
                Space Arabica <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a
                href={home ? "#work-korte" : asset("work/korte/")}
              >
                Korte <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a className="mobile-menu-link" href={`${base}#about`}>About <ArrowUpRight size={16} aria-hidden="true" /></a>
              <a className="mobile-menu-link" href={`${base}#services`}>Services <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </details>
          <a href={`${base}#about`}>About</a>
          <a className="services-nav" href={`${base}#services`}>Services</a>
          <a href={`${base}#contact`}>
            Let’s talk <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </header>
    </>
  );
}
export function TextLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      className="text-link"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
export function Contact() {
  return (
    <section
      className="contact-section"
      id="contact"
      data-chapter="contact"
      aria-labelledby="contact-title"
    >
      <div className="section-topline">
        <span>Start a conversation</span>
        <span>Projects & opportunities</span>
      </div>
      <h2 id="contact-title">
        Let’s make
        <br />
        <em>something.</em>
        <span className="contact-heading-arrow" aria-hidden="true">
          <Asterisk size="1em" strokeWidth={1} />
        </span>
      </h2>
      <div className="contact-bottom">
        <p>
          Have a project or a role in mind?
          <br />
          I’d like to hear about it.
        </p>
        <div className="contact-options">
          <TextLink href={contact("project")}>Discuss a project</TextLink>
          <TextLink href={contact("role")}>Discuss a role</TextLink>
        </div>
      </div>
      <a className="email-link" href={`mailto:${email}`}>
        <span className="email-link-label"><Mail size={15} aria-hidden="true" /> Email me</span>
        <span>{email}</span>
      </a>
    </section>
  );
}
export function Footer() {
  const footer = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = footer.current;
    const portfolio = element?.parentElement;
    if (!element || !portfolio) return;
    const measure = () => portfolio.style.setProperty("--closing-footer-height", `${element.offsetHeight}px`);
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    let visible = false;
    const updateMotion = () => element.classList.toggle("wordmark-active", visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateMotion(); });
    observer.observe(element.querySelector(".footer-wordmark")!);
    document.addEventListener("visibilitychange", updateMotion);
    measure();
    return () => { resize.disconnect(); observer.disconnect(); document.removeEventListener("visibilitychange", updateMotion); portfolio.style.removeProperty("--closing-footer-height"); };
  }, []);
  return (
    <footer ref={footer} className="site-footer">
      <div className="footer-wordmark" aria-hidden="true"><span className="wordmark-lettering">Joshua<span className="wordmark-glitch wordmark-glitch--blue">Joshua</span><span className="wordmark-glitch wordmark-glitch--light">Joshua</span></span></div>
      <div className="footer-bottom">
      <a href={asset("")}>Joshua Sabuero © 2026</a>
      <span>Designed with intention. Built with care.</span>
      </div>
    </footer>
  );
}
