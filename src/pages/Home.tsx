import { useEffect, useState } from "react";
import ScreenWall from "../components/ScreenWall";
import ProjectList from "../components/ProjectList";
import ProjectWorlds from "../components/ProjectWorlds";
import { Contact, Footer, Header } from "../components/SiteChrome";
import { projectBySlug, type ProjectSlug } from "../work/projects";
import "./home.css";

const SERVICES = [
  ["Logo & visual identity", "Marks, colour, type and guidelines."],
  ["UI/UX & product design", "Flows and screens that make sense on first use."],
  ["Website design & development", "An expressive home for a business, on every screen."],
  ["Web application development", "Interfaces, logic and data connected into a working tool."],
] as const;

export default function Home() {
  const [point, setPoint] = useState<ProjectSlug | "all">("all");
  const [chapter, setChapter] = useState<ProjectSlug | null>(null);
  const [covered, setCovered] = useState(false);
  // The header takes the text colour of whichever chapter is on screen.
  useEffect(() => {
    const root = document.documentElement.style;
    if (chapter) root.setProperty("--head", projectBySlug(chapter).tokens.text);
    else root.removeProperty("--head");
  }, [chapter]);
  return (
    <div className="home">
      <a className="skip-link" href="#work">Skip to work</a>
      <Header />
      <ScreenWall show={covered ? "all" : point} hidden={covered} />
      <main className="home-main">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">
            <span className="ln"><span>I design how an idea</span></span>
            <span className="ln"><span><em>looks,</em> and build how</span></span>
            <span className="ln"><span>it <em>works.</em></span></span>
          </h1>
          <div className="hero-foot">
            <p className="label">Independent designer &amp; developer</p>
            <p className="label">Identity · Interfaces · Working web products</p>
          </div>
        </section>
        <ProjectList onPoint={setPoint} />
        <ProjectWorlds onActive={(slug, isCovered) => { setChapter(slug); setCovered(isCovered); }} />
        <section className="about" id="about" aria-labelledby="about-title">
          <p className="label">About</p>
          <div>
            <h2 id="about-title">I work on <em>both sides</em> of the screen, so an idea keeps one character from first sketch to shipped product.</h2>
            <ul className="services">
              {SERVICES.map(([name, line]) => <li key={name}><b>{name}</b><span>{line}</span></li>)}
            </ul>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
