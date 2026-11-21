import type { CSSProperties } from "react";
import { nextProject, projectBySlug, type ProjectSlug } from "../work/projects";
import { asset } from "../work/asset";
import { Contact, Footer, Header } from "../components/SiteChrome";
import { BrowserFrame } from "../components/DeviceFrames";
import ScreenTabs from "../components/ScreenTabs";
import "./case.css";

/** The one case-study template every project uses, in the project's own colours. */
const COUNT_WORDS: Record<number, string> = { 3: "Three", 4: "Four" };

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
            <p className="case-question">{p.question}</p>
            <p className="case-intro">{p.intro}</p>
            {(p.demo || p.live) && (
              <div className="case-actions">
                {p.demo && <a className="case-demo" href="#demo">Try the full demo <span aria-hidden="true">↓</span></a>}
                {p.live && <a className="case-live" href={p.live.url} target="_blank" rel="noopener noreferrer">{p.live.label} <span aria-hidden="true">↗</span></a>}
              </div>
            )}
          </div>
          <dl className="case-facts">
            {p.caseFacts.map(f => <div key={f.term}><dt>{f.term}</dt><dd>{f.detail}</dd></div>)}
          </dl>
        </section>

        <ScreenTabs tabs={p.tabs} title={p.name} />

        <section className="case-decisions" aria-labelledby="decisions-title">
          <h2 className="label" id="decisions-title">{`${COUNT_WORDS[p.decisions.length] ?? p.decisions.length} decisions`}</h2>
          <ol>
            {p.decisions.map((d, i) => (
              <li key={d.title}>
                <span className="case-decisions__number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{d.title}</h3>
                <dl>
                  <div><dt>The problem</dt><dd>{d.problem}</dd></div>
                  <div><dt>What I chose</dt><dd>{d.choice}</dd></div>
                  <div><dt>What happened</dt><dd>{d.result}</dd></div>
                </dl>
              </li>
            ))}
          </ol>
        </section>

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

        <section className="case-reflection" aria-labelledby="reflection-title">
          <h2 className="label" id="reflection-title">Looking back</h2>
          <p className="case-reflection__text">{p.reflection}</p>
          <p className="case-evidence">{p.evidence}</p>
        </section>

        <a className="case-next" href={asset(`work/${next.slug}/`)} style={{ "--next-ground": next.tokens.ground, "--next-ink": next.tokens.text, "--next-giant": next.tokens.giant } as CSSProperties}>
          <span className="label">Next project</span>
          <strong>{next.name}</strong>
          <span className="case-next__line">{next.line}</span>
        </a>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
