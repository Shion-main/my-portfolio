import { ArrowUpRight } from "lucide-react";
import { type ProjectSlug } from "../content";
import { capture, preview, projectScreens, type Screen } from "../showcase";

function ScreenLink({ screen }: { screen: Screen }) {
  return (
    <a className={`screen-link ${screen.mobile ? "screen-link--mobile" : ""}`} href={capture(screen.id, screen.viewportOnly ? "cover" : "full")} target="_blank" rel="noreferrer" aria-label={`Open ${screen.title}, ${screen.viewportOnly ? "screen capture" : "complete page"} in a new tab`}>
      <div className="screen-window"><img src={preview(screen.id, screen.mobile || screen.viewportOnly ? "cover" : "full")} alt={`${screen.title} interface`} loading="lazy" decoding="async" /></div>
      <span className="screen-label">{screen.title}<ArrowUpRight size={15} aria-hidden="true" /></span>
      <span className="screen-link-hint">{screen.viewportOnly ? "View screen" : "View complete page"}</span>
    </a>
  );
}

export default function ScreenGallery({ slug }: { slug: ProjectSlug }) {
  const screens = projectScreens[slug];
  return (
    <section className="screen-gallery" aria-labelledby="screen-gallery-title">
      <div className="screen-gallery-heading"><p className="eyebrow">Explore the interface</p><h2 id="screen-gallery-title">Every screen has a part to play.</h2>
        <p>{slug === "space-arabica" ? "Six connected pages, from discovering a drink to planning a visit. Open any page to see its complete layout." : "The community website and the guest-session flow, from setup and attendance to courts, scoring, and standings. Open a screen for a closer look."}</p>
      </div>
      <div className="screen-grid">{screens.filter(screen => !screen.mobile).map(screen => <ScreenLink screen={screen} key={screen.id} />)}</div>
      <h3 className="screen-mobile-heading">Made for a smaller screen, too.</h3>
      <div className="screen-grid screen-grid--mobile">{screens.filter(screen => screen.mobile).map(screen => <ScreenLink screen={screen} key={screen.id} />)}</div>
      {slug === "korte" && <p className="screen-source-note">Session screens use a local guest session with demonstration names and scores.</p>}
    </section>
  );
}
