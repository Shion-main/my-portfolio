import { useState } from "react";
import ScreenWall from "../components/ScreenWall";
import ProjectList from "../components/ProjectList";
import { EMAIL } from "../work/asset";
import type { ProjectSlug } from "../work/projects";
import "./home.css";

export default function Home() {
  const [point, setPoint] = useState<ProjectSlug | "all">("all");
  return (
    <div className="home">
      <a className="skip-link" href="#work">Skip to work</a>
      <header className="site-head">
        <a className="site-head__name" href="/">Joshua Sabuero</a>
        <nav aria-label="Main"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      </header>
      <ScreenWall show={point} hidden={false} />
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
        <section id="contact" className="home-contact-placeholder">
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </section>
      </main>
    </div>
  );
}
