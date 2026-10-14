import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { asset, type ProjectSlug } from "../content";
import { bentoScreens, bentoPreview } from "../showcase";

export default function ProjectShowcase({ slug }: { slug: ProjectSlug }) {
  const space = slug === "space-arabica";
  const screens = (space ? [0, 3, 5, 4] : [1, 2, 6, 7]).map(index => bentoScreens[index]);
  return (
    <div className={`design-board design-board--${space ? "space" : "korte"}`}>
      <div className="compiled-identity"><img src={asset(`media/${space ? "space-logo.svg" : "korte-logo-light.svg"}`)} alt={space ? "Space Arabica" : "Korte"} /><span>{space ? "A place to slow down." : "Pickleball, all in one place."}</span></div>
      <div className="compiled-sequence">
        {screens.map((screen, index) => (
          <figure className={`compiled-step compiled-step--${screen.device}`} key={screen.id} style={{ "--screen-ratio": screen.width / screen.height } as CSSProperties}>
            <div className="compiled-screen-stage">
              <div className={`bento-device bento-device--${screen.device}`}>
                {screen.device === "desktop" && <div className="bento-browser" aria-hidden="true"><i /><i /><i /><span>{screen.project}</span></div>}
                <img src={bentoPreview(screen.id)} alt={`${screen.project} — ${screen.title}`} width={screen.width} height={screen.height} loading="lazy" decoding="async" />
              </div>
            </div>
            <figcaption><span>0{index + 1}</span>{screen.step}<span aria-hidden="true">{index < screens.length - 1 ? <ArrowRight size="1.3em" /> : <ArrowUpRight size="1.3em" />}</span></figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
