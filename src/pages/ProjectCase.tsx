import type { CSSProperties } from "react";
import { nextProject, projectBySlug, type ProjectSlug } from "../work/projects";
import { asset } from "../work/asset";
import { Header } from "../components/SiteChrome";
import { BrowserFrame } from "../components/DeviceFrames";
import ScreenTabs from "../components/ScreenTabs";
import CaseHandoff from "../components/CaseHandoff";
import "./case.css";

/** The one case-study template every project uses, in the project's own colours: headline, at a glance, the challenge,
 *  what I did, results, screens, then a line for the client with a way to get in touch. */
export default function ProjectCase({ slug }: { slug: ProjectSlug }) {
  const p = projectBySlug(slug);
  const next = nextProject(slug);
  const tokens = { "--ground": p.tokens.ground, "--ink": p.tokens.text, "--giant": p.tokens.giant } as CSSProperties;
  return (
    <div className="case" style={tokens}>
      <a className="skip-link" href="#case-main">Skip to content</a>
      <Header solid />
      <main id="case-main">
        <section className="case-hero" aria-label={`${p.name} at a glance`}>
          <a className="case-back label" href={asset(`#work-${slug}`)}>← All work</a>
          <BrowserFrame className="case-hero__frame" title={p.desktop.title} src={asset(p.desktop.src)} alt={p.desktop.alt} lazy={false} morph />
        </section>

        <section className="case-overview" aria-labelledby="case-title">
          <div>
            <p className="label">{p.label}</p>
            <h1 id="case-title">{p.name}</h1>
          </div>
          <div>
            <p className="case-headline">{p.headline}</p>
            {(p.demo || p.live) && (
              <div className="case-actions">
                {p.demo && <a className="case-demo" href="#demo">Try the full demo <span aria-hidden="true">↓</span></a>}
                {p.live && <a className="case-live" href={p.live.url} target="_blank" rel="noopener noreferrer">{p.live.label} <span aria-hidden="true">↗</span></a>}
              </div>
            )}
          </div>
          <dl className="case-facts" aria-label="At a glance">
            {p.caseFacts.map(f => <div key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>)}
          </dl>
        </section>

        <section className="case-challenge" aria-labelledby="challenge-title">
          <h2 className="label" id="challenge-title">The challenge</h2>
          <p className="case-challenge__text">{p.challenge}</p>
        </section>

        <section className="case-did" aria-labelledby="did-title">
          <h2 className="label" id="did-title">What I did</h2>
          <ol>
            {p.did.map((d, i) => (
              <li key={d.title}>
                <span className="case-did__number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="case-results" aria-labelledby="results-title">
          <h2 className="label" id="results-title">Results</h2>
          <ul>
            {p.results.map(r => <li key={r}>{r}</li>)}
          </ul>
        </section>

        <ScreenTabs tabs={p.tabs} title={p.name} />

        {p.demo && (
          <section className="case-embed" id="demo" aria-labelledby="demo-title">
            <div className="case-embed__head">
              <h2 className="label" id="demo-title">My original direction · the full site</h2>
              <p className="case-embed__note">The whole site as I first designed it. Every page works inside this frame; forms are switched off.</p>
              <div className="case-actions">
                <a className="case-demo" href={asset(p.demo)}>Open full screen <span aria-hidden="true">↗</span></a>
                {p.live && <a className="case-live" href={p.live.url} target="_blank" rel="noopener noreferrer">{p.live.label} <span aria-hidden="true">↗</span></a>}
              </div>
            </div>
            <div className="frame frame--browser case-embed__frame">
              <div className="frame__bar" aria-hidden="true"><i /><i /><i /><span>{p.name} — original direction</span></div>
              <iframe src={asset(p.demo)} title={`${p.name} website — my original design, running as a demo`} loading="lazy" />
            </div>
          </section>
        )}

        <section className="case-close" aria-labelledby="close-title">
          <h2 className="case-close__text" id="close-title">{p.forYou}</h2>
          <a className="case-cta" href="#contact">Let’s talk <span aria-hidden="true">→</span></a>
          <p className="case-note">{p.note}</p>
        </section>

        <CaseHandoff next={next} />
      </main>
    </div>
  );
}
