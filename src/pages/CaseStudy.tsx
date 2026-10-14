import { asset, projects, type ProjectSlug } from "../content";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Contact, Footer, Header, TextLink } from "../components/SiteChrome";
import ProjectShowcase from "../components/ProjectShowcase";
import ScreenGallery from "../components/ScreenGallery";
import { capture } from "../showcase";

export default function CaseStudy({ slug }: { slug: ProjectSlug }) {
  const p = projects[slug];
  const other = slug === "korte" ? "space-arabica" : "korte";
  return (
    <div className={`case-page case-${p.color}`}>
      <Header />
      <main id="top">
        <section className="case-hero">
          <a className="back-link" href={asset(`#work-${slug}`)}>
            <ArrowLeft size={14} aria-hidden="true" /> Back to selected work
          </a>
          <div className="case-meta">
            <span>{p.category}</span>
            <span>{p.role}</span>
          </div>
          <p className="eyebrow">{p.name}</p>
          <h1>
            {p.title
              .split("\n")
              .map((line, i) =>
                i ? <em key={line}>{line}</em> : <span key={line}>{line}</span>,
              )}
          </h1>
          <p className="case-deck">{p.description}</p>
          <div className="case-disciplines">
            <span>{p.disciplines}</span>
            {p.website && (
              <TextLink href={p.website} external>
                Visit the website
              </TextLink>
            )}
          </div>
        </section>
        <figure className="case-cover case-cover--showcase">
          <ProjectShowcase slug={slug} />
          <figcaption>
            {slug === "korte"
              ? "Implemented local guest session, shown with synthetic names."
              : "The implemented Space Arabica home experience."}
          </figcaption>
        </figure>
        <div id="case-content" className="case-body">
          <section className="case-context">
            <p className="eyebrow">The challenge</p>
            <h2>{p.question}</h2>
            <p>{p.context}</p>
          </section>
          <section className="case-decisions" aria-label="Design decisions">
            {p.decisions.map((d, i) => (
              <article key={d.title}>
                <span className="decision-number">0{i + 1}</span>
                <div>
                  <h2>{d.title}</h2>
                  <p>{d.text}</p>
                  <p className="decision-detail">{d.detail}</p>
                </div>
              </article>
            ))}
          </section>
          <div className="case-media-pair">
            <figure>
              <img
                src={capture(slug === "korte" ? "korte-setup" : "space-full-menu", "cover")}
                alt={p.secondAlt}
                width="1440"
                height="1000"
                loading="lazy"
              />
              <figcaption>{p.secondCaption}</figcaption>
            </figure>
            <figure className="case-mobile">
              <img
                src={capture(slug === "korte" ? "korte-courts-dark-mobile" : "space-home-mobile", "cover")}
                alt={p.mobileAlt}
                width="390"
                height="844"
                loading="lazy"
              />
              <figcaption>The same priorities, adapted to a phone.</figcaption>
            </figure>
          </div>
          <ScreenGallery slug={slug} />
          <section className="case-reflection">
            <p className="eyebrow">What stayed with me</p>
            <h2>
              {slug === "korte"
                ? "Clarity starts below the surface."
                : "Expression and utility belong together."}
            </h2>
            <p>{p.reflection}</p>
            <p className="evidence-note">{p.evidence}</p>
          </section>
          <a className="next-project" href={asset(`work/${other}/`)}>
            <span>Explore the other project</span>
            <strong>
              {projects[other].name} <ArrowUpRight size="1em" aria-hidden="true" />
            </strong>
          </a>
        </div>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
