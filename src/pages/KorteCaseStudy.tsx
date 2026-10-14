import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type CSSProperties,
} from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, ArrowUp, ArrowUpRight, Expand, X } from "lucide-react";
import { asset, email } from "../content";
import { Header } from "../components/SiteChrome";
import { capture } from "../showcase";

const media = (file: string) => asset(`media/korte-case/${file.replace(/\.png$/, ".webp")}`);
type Screen = { src: string; alt: string; width: number; height: number };
type View = { desktop: Screen; mobile: Screen; label: string; caption: string };
type Selection = { tab: number; partner: boolean };
const screen = (file: string, alt: string, mobile = false): Screen => ({
  src: media(file),
  alt,
  width: mobile ? 390 : 1440,
  height: mobile ? 844 : 900,
});
const explore = screen(
  "explore-mobile.png",
  "Korte player Explore: open play, search and upcoming meets, signed in as Alex Santos",
  true,
);
const live: Screen = {
  src: capture("korte-live", "cover"),
  alt: "Korte organizer workspace with two active courts, Up Next and the player roster",
  width: 1440,
  height: 1000,
};
const views: View[] = [
  {
    label: "Player · Meet details",
    caption:
      "Give players the place, time and participation details before they join.",
    desktop: screen(
      "discover-desktop.png",
      "Korte meet details with date, venue, format, skill range and participation",
    ),
    mobile: screen(
      "discover-mobile.png",
      "Korte mobile meet details and session information",
      true,
    ),
  },
  {
    label: "Player · Court booking",
    caption:
      "Make court availability and reservation status clear for players and venue partners.",
    desktop: screen(
      "book-desktop.png",
      "Korte signed-in court booking with availability and open time slots",
    ),
    mobile: screen(
      "book-mobile.png",
      "Korte mobile booking with date selection and court availability",
      true,
    ),
  },
  {
    label: "Organizer · Score entry",
    caption:
      "Keep arrivals, court operation and results connected, with a clear next action.",
    desktop: {
      src: capture("korte-scoring", "cover"),
      alt: "Korte score entry dialog with both teams and the next lineup",
      width: 1440,
      height: 1000,
    },
    mobile: {
      src: capture("korte-scoring-mobile", "cover"),
      alt: "Korte mobile score entry sheet with teams, scores and submit action",
      width: 390,
      height: 844,
    },
  },
  {
    label: "Player · Club hub",
    caption: "Connect the community to its next session.",
    desktop: screen(
      "connect-desktop.png",
      "Korte Southside Dinkers club with upcoming open play and club updates",
    ),
    mobile: screen(
      "connect-mobile.png",
      "Korte mobile club hub with upcoming open play and membership action",
      true,
    ),
  },
];
const partner: View = {
  label: "Venue partner · Dashboard",
  caption: views[1].caption,
  desktop: screen(
    "partner-desktop.png",
    "Korte signed-in venue partner dashboard with bookings, payment reviews and venue tools",
  ),
  mobile: {
    ...screen(
      "partner-mobile.png",
      "Korte mobile venue partner dashboard with booking activity",
      true,
    ),
    width: 390,
    height: 844,
  },
};
const tabs = ["Discover", "Book", "Organize", "Connect"];
const viewFor = (selection: Selection) =>
  selection.tab === 1 && selection.partner ? partner : views[selection.tab];
const same = (a: Selection, b: Selection) =>
  a.tab === b.tab && a.partner === b.partner;
const motion = () => ({
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  mobile: window.matchMedia("(max-width: 700px)").matches,
});
const ease = "cubic-bezier(0.2,0,0,1)";
const exitEase = "cubic-bezier(0.3,0,1,1)";
const ViewerContext = createContext<
  (screen: Screen, trigger: HTMLAnchorElement) => void
>(() => {});

function ScreenLink({
  value,
  eager = false,
  className = "",
}: {
  value: Screen;
  eager?: boolean;
  className?: string;
}) {
  const open = useContext(ViewerContext);
  function enlarge(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      typeof HTMLDialogElement === "undefined"
    )
      return;
    event.preventDefault();
    open(value, event.currentTarget);
  }
  return (
    <a
      className={`kc-screen-link ${className}`}
      href={value.src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Enlarge: ${value.alt}`}
      onClick={enlarge}
    >
      <img
        src={value.src}
        alt={value.alt}
        width={value.width}
        height={value.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <span className="kc-enlarge">
        <Expand size={14} aria-hidden="true" /> View screen
      </span>
    </a>
  );
}

function ProductGallery() {
  const initial = { tab: 0, partner: false };
  const [selected, setSelected] = useState<Selection>(initial);
  const [displayed, setDisplayed] = useState<Selection>(initial);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<Selection | null>(null);
  const [previous, setPrevious] = useState<View | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const outgoing = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sequence = useRef(0);
  const current = useRef(initial);
  const animations = useRef<Animation[]>([]);
  useEffect(
    () => () => {
      sequence.current++;
      animations.current.forEach((animation) => animation.cancel());
    },
    [],
  );

  async function select(next: Selection) {
    const request = ++sequence.current;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    setPrevious(null);
    setSelected(next);
    setFailed(null);
    setBusy(!same(next, current.current));
    setLoading(!same(next, current.current));
    if (same(next, current.current)) return;
    try {
      // Retain the last usable screen until both responsive versions have decoded.
      await Promise.all(
        [viewFor(next).desktop, viewFor(next).mobile].map(async (value) => {
          const image = new Image();
          image.src = value.src;
          await image.decode();
        }),
      );
    } catch {
      if (request === sequence.current) {
        setSelected(current.current);
        setFailed(next);
        setBusy(false);
        setLoading(false);
      }
      return;
    }
    if (request !== sequence.current || !frame.current) return;
    setLoading(false);
    const { reduced, mobile } = motion();
    const direction =
      next.tab === current.current.tab
        ? next.partner
          ? 1
          : -1
        : Math.sign(next.tab - current.current.tab);
    const oldView = viewFor(current.current);
    current.current = next;
    // Keep the outgoing composition underneath the incoming one. There is never
    // an empty frame between decoded screens, even when direction changes.
    flushSync(() => {
      setPrevious(reduced ? null : oldView);
      setDisplayed(next);
    });
    if (!reduced && frame.current?.animate) {
      const distance = (mobile ? 14 : 32) * direction;
      const concealed = direction > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)";
      animations.current.push(frame.current.animate(
        [
          { clipPath: concealed, transform: `translateY(${distance}px)` },
          { clipPath: "inset(0 0 0 0)", transform: "translateY(0)" },
        ],
        { duration: mobile ? 320 : 400, easing: ease },
      ));
      if (outgoing.current) animations.current.push(outgoing.current.animate(
        [
          { transform: "translateY(0) scale(1)" },
          { transform: `translateY(${-distance * 0.35}px) scale(0.975)` },
        ],
        { duration: mobile ? 240 : 300, easing: exitEase, fill: "forwards" },
      ));
      await Promise.all(animations.current.map((animation) => animation.finished.catch(() => {})));
    }
    if (request === sequence.current) {
      setPrevious(null);
      setBusy(false);
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
    }
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index + tabs.length - 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    void select({ tab: next, partner: false });
    tabRefs.current[next]?.focus();
  }
  const view = viewFor(displayed);
  return (
    <div className="kc-gallery">
      <div
        className="kc-tabs"
        role="tablist"
        aria-label="Explore the Korte app"
        style={{ "--kc-tab": selected.tab } as CSSProperties}
      >
        {tabs.map((tab, index) => (
          <button
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`kc-tab-${index}`}
            aria-controls="kc-gallery-panel"
            aria-selected={selected.tab === index}
            tabIndex={selected.tab === index ? 0 : -1}
            onClick={() => void select({ tab: index, partner: false })}
            onKeyDown={(event) => navigate(event, index)}
            key={tab}
          >
            <span aria-hidden="true">0{index + 1}</span>
            {tab}
          </button>
        ))}
      </div>
      <div className="kc-gallery-toolbar">
        <span>{view.label}</span>
        {selected.tab === 1 && (
          <div
            className="kc-view-switch"
            role="group"
            aria-label="Booking perspective"
          >
            <button
              type="button"
              aria-pressed={!selected.partner}
              onClick={() => void select({ tab: 1, partner: false })}
            >
              Player
            </button>
            <button
              type="button"
              aria-pressed={selected.partner}
              onClick={() => void select({ tab: 1, partner: true })}
            >
              Venue partner
            </button>
          </div>
        )}
        <span className="kc-loading" role="status">
          {loading ? "Loading screen…" : ""}
        </span>
      </div>
      <div
        id="kc-gallery-panel"
        role="tabpanel"
        aria-labelledby={`kc-tab-${displayed.tab}`}
        aria-busy={busy}
        tabIndex={0}
      >
        <div className="kc-gallery-content">
          <div className="kc-gallery-stage" data-kc-reveal>
            {previous && (
              <div ref={outgoing} className="kc-gallery-frame kc-gallery-outgoing" aria-hidden="true">
                <div className="kc-screen-link kc-desktop"><img src={previous.desktop.src} alt="" width={previous.desktop.width} height={previous.desktop.height} /><span className="kc-enlarge">View screen</span></div>
                <div className="kc-screen-link kc-mobile"><img src={previous.mobile.src} alt="" width={previous.mobile.width} height={previous.mobile.height} /><span className="kc-enlarge">View screen</span></div>
              </div>
            )}
            <div ref={frame} className="kc-gallery-frame kc-gallery-current">
              <ScreenLink value={view.desktop} className="kc-desktop" />
              <ScreenLink value={view.mobile} className="kc-mobile" />
            </div>
          </div>
          <div className="kc-gallery-caption">
            <p>{view.caption}</p>
            <span>Actual app · mock data</span>
          </div>
        </div>
      </div>
      {failed && (
        <p className="kc-load-error" role="alert">
          That screen couldn’t load. The previous screen is still available.{" "}
          <button type="button" onClick={() => void select(failed)}>
            Retry
          </button>
        </p>
      )}
    </div>
  );
}

export default function KorteCaseStudy() {
  const [enlarged, setEnlarged] = useState<Screen | null>(null);
  const [closing, setClosing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const hero = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    const root = element.closest(".korte-case")!;
    const header = root.querySelector(".site-header");
    const headerSize = new ResizeObserver(() => {
      (root as HTMLElement).style.setProperty("--kc-header-height", `${header?.getBoundingClientRect().height ?? 80}px`);
    });
    if (header) headerSize.observe(header);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 700px)");
    const reveals = [...root.querySelectorAll<HTMLElement>("[data-kc-reveal]")];
    const running = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (preference.matches || !entry.target.animate) return;
        const animation = entry.target.animate([
          { transform: `translateY(${smallScreen.matches ? 10 : 24}px)`, opacity: 0.6 },
          { transform: "translateY(0)", opacity: 1 },
        ], { duration: smallScreen.matches ? 320 : 480, easing: ease });
        running.add(animation);
        void animation.finished.catch(() => {}).finally(() => running.delete(animation));
      });
    }, { threshold: 0.12 });
    reveals.forEach((reveal) => observer.observe(reveal));
    // Native scrolling drives only two foreground layers, with no pinned
    // sections, scroll interception or added document height.
    let raf = 0;
    const update = () => {
      raf = 0;
      if (preference.matches) {
        element.style.removeProperty("--kc-depth");
        return;
      }
      const bounds = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)));
      const eased = progress * progress * (3 - 2 * progress);
      element.style.setProperty("--kc-depth", String(eased));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const resetMotion = () => {
      running.forEach((animation) => animation.cancel());
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", resetMotion);
    smallScreen.addEventListener("change", schedule);
    update();
    return () => {
      observer.disconnect();
      headerSize.disconnect();
      running.forEach((animation) => animation.cancel());
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", resetMotion);
      smallScreen.removeEventListener("change", schedule);
    };
  }, []);
  useEffect(() => {
    if (!enlarged || !dialog.current) return;
    dialog.current.showModal();
    dialog.current.querySelector<HTMLButtonElement>("button")?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      clearTimeout(closeTimer.current);
    };
  }, [enlarged]);
  function close() {
    if (closing) return;
    setClosing(true);
    const { reduced, mobile } = motion();
    closeTimer.current = setTimeout(
      () => dialog.current?.close(),
      reduced ? 40 : mobile ? 192 : 240,
    );
  }
  function restore() {
    setEnlarged(null);
    setClosing(false);
    trigger.current?.focus({ preventScroll: true });
  }
  return (
    <ViewerContext.Provider
      value={(value, source) => {
        trigger.current = source;
        setEnlarged(value);
      }}
    >
      <div className="korte-case">
        <Header />
        <main id="top">
          <section className="kc-hero kc-wrap" aria-labelledby="kc-title">
            <div className="kc-topline">
              <a href={asset("#work-korte")}>
                <ArrowLeft size={15} aria-hidden="true" /> Selected work
              </a>
              <span>Product design + development</span>
            </div>
            <div className="kc-hero-copy">
              <div>
                <p className="kc-brand">
                  Korte<span>All-in-one pickleball app</span>
                </p>
                <h1 id="kc-title">
                  Pickleball,
                  <br />
                  all in one place<span>.</span>
                </h1>
              </div>
              <p>
                I designed and built Korte, an all-in-one pickleball app for the
                Philippines, bringing discovery, clubs, court bookings and
                open-play management into one experience.
              </p>
            </div>
            <div ref={hero} className="kc-hero-stage" data-kc-reveal>
              <figure className="kc-hero-player">
                <figcaption>
                  <span>Player</span>Find your next game
                </figcaption>
                <ScreenLink value={explore} eager />
              </figure>
              <figure className="kc-hero-organizer">
                <figcaption>
                  <span>Organizer</span>Keep play moving
                </figcaption>
                <ScreenLink value={live} eager />
              </figure>
            </div>
            <div className="kc-hero-foot">
              <p>
                Player discovery and organizer tools. Local app captures with
                mock data.
              </p>
              <details className="kc-details">
                <summary>Project details</summary>
                <dl>
                  <div>
                    <dt>Role</dt>
                    <dd>Product design + development</dd>
                  </div>
                  <div>
                    <dt>Project dates</dt>
                    <dd>To be confirmed</dd>
                  </div>
                  <div>
                    <dt>Team</dt>
                    <dd>To be confirmed</dd>
                  </div>
                  <div>
                    <dt>Release status</dt>
                    <dd>To be confirmed</dd>
                  </div>
                </dl>
              </details>
            </div>
          </section>
          <section
            className="kc-roles kc-wrap"
            id="case-content"
            aria-labelledby="kc-roles-title"
          >
            <div data-kc-reveal>
              <p className="kc-eyebrow">The product</p>
              <h2 id="kc-roles-title">
                One app.
                <br />
                Three perspectives.
              </h2>
              <p className="kc-role-note">
                I organized each experience around its next action, connecting
                discovery, participation and operations through clear navigation
                and status.
              </p>
            </div>
            <dl className="kc-role-list">
              <div>
                <dt>
                  <span>01</span>Players
                </dt>
                <dd>Find open play, join clubs and book a court.</dd>
              </div>
              <div>
                <dt>
                  <span>02</span>Organizers
                </dt>
                <dd>
                  Create sessions, check players in, manage rotations and record
                  results.
                </dd>
              </div>
              <div>
                <dt>
                  <span>03</span>Venue partners
                </dt>
                <dd>Manage venues, court availability and bookings.</dd>
              </div>
            </dl>
          </section>
          <section
            className="kc-product kc-wrap"
            aria-labelledby="kc-product-title"
          >
            <div className="kc-section-heading" data-kc-reveal>
              <p className="kc-eyebrow">Inside Korte</p>
              <h2 id="kc-product-title">Find a game. Make it happen.</h2>
            </div>
            <ProductGallery />
          </section>
          <section className="kc-close" aria-labelledby="kc-close-title">
            <div className="kc-wrap">
              <p className="kc-eyebrow">Design + development</p>
              <div className="kc-close-copy">
                <h2 id="kc-close-title">
                  One product,
                  <br />
                  from discovery to play.
                </h2>
                <p>
                  My work connected product design and development across
                  player, organizer and venue experiences. Next, I want to test
                  how clearly people move between finding, arranging and running
                  play.
                </p>
              </div>
              <div className="kc-close-links">
                <a href={asset("work/space-arabica/")}>
                  <span>
                    <small>Next project</small>Space Arabica
                  </span>
                  <ArrowUpRight size={22} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </main>
        <footer className="kc-footer kc-wrap">
          <a href={asset("")}>Joshua Sabuero © 2026</a>
          <a href={`mailto:${email}`}>Email: {email}</a>
          <a href="#top">Back to top <ArrowUp size={14} aria-hidden="true" /></a>
        </footer>
        <dialog
          ref={dialog}
          className="kc-viewer"
          aria-label="Full-size product screen"
          data-closing={closing || undefined}
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onClose={restore}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const controls =
              event.currentTarget.querySelectorAll<HTMLElement>(
                "a[href], button",
              );
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (
              (!event.shiftKey && document.activeElement === last) ||
              (event.shiftKey && document.activeElement === first)
            ) {
              event.preventDefault();
              (event.shiftKey ? last : first)?.focus();
            }
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          {enlarged && (
            <div className="kc-viewer-inner">
              <div className="kc-viewer-bar">
                <p>{enlarged.alt}</p>
                <a
                  href={enlarged.src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Original image <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close image"
                  autoFocus
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>
              <div className="kc-viewer-image">
                <img
                  src={enlarged.src}
                  alt={enlarged.alt}
                  width={enlarged.width}
                  height={enlarged.height}
                />
              </div>
            </div>
          )}
        </dialog>
      </div>
    </ViewerContext.Provider>
  );
}
