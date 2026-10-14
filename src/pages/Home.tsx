import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { asset, projects, type ProjectSlug } from "../content";
import { Contact, Footer, Header } from "../components/SiteChrome";
import WorkCollage from "../components/WorkCollage";
import ProjectShowcase from "../components/ProjectShowcase";
import ParticleField from "../components/ParticleField";

const services = [
  { title: "Logo & visual identity", text: "A distinctive mark and a consistent visual language. Logos, color, typography, and the details that make a brand recognizable.", tags: "Logo design · Identity systems · Brand guidelines" },
  { title: "UI/UX & product design", text: "Digital products that make sense from the first interaction. I shape the flow, design the screens, and connect the experience.", tags: "User flows · Interface design · Interactive prototypes" },
  { title: "Website design & development", text: "An expressive home for your business, built to work beautifully across screens. From the first visual direction to the finished website.", tags: "Custom websites · Responsive design · Interaction & motion" },
  { title: "Web application development", text: "Useful tools for the way people actually work. I connect interfaces, application logic, and data into a working product.", tags: "Front end · Back end · API integrations" },
];

function ChapterTitle({ children, id }: { children: string; id: string }) {
  return <h2 className="chapter-title" id={id}><span>{children}</span><span className="chapter-title-fill" aria-hidden="true">{children}</span></h2>;
}

function SelectedProject({ slug, number }: { slug: ProjectSlug; number: string }) {
  const project = projects[slug];
  return (
    <>
    <div id={`work-${slug}`} className={`project-anchor project-anchor--${slug}`} aria-hidden="true" />
    <article className={`selected-project selected-project--${project.color}`} data-project={slug} data-chapter={slug} aria-labelledby={`${slug}-title`} onFocusCapture={event => {
      // A sticky card can be onscreen but covered by another card or contact.
      // Keyboard focus must return to its real flow position before reading it.
      if (!(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
      const target = event.target.getBoundingClientRect();
      const visible = document.elementFromPoint(target.left + target.width / 2, Math.min(window.innerHeight - 20, Math.max(100, target.top + target.height / 2)));
      if (visible?.closest(".selected-project") !== event.currentTarget) document.getElementById(`work-${slug}`)?.scrollIntoView({ block: "start", behavior: "instant" });
    }}>
      <div className="project-heading">
        <span className="project-number" aria-hidden="true">{number}</span>
        <div><h3 id={`${slug}-title`}>{project.name}</h3><p>{project.category}</p></div>
        <a className="project-action" href={asset(`work/${slug}/`)} aria-label={`Explore ${project.name} project`}>Explore project <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
      <a className="project-showcase" href={asset(`work/${slug}/`)} aria-label={`See ${project.name}, design and development case study`}>
        <ProjectShowcase slug={slug} />
      </a>
      <div className="project-details"><p>{slug === "korte" ? "Find a game, bring people together, keep play moving." : "The character of a café, across every page."}</p><span>{project.role}</span></div>
    </article>
    </>
  );
}

export default function Home() {
  const main = useRef<HTMLElement>(null);
  const [simple, setSimple] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setSimple(media.matches);
    updatePreference();
    setHydrated(true);
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!hydrated || simple || !main.current) return;
    const sheets = [...main.current.querySelectorAll<HTMLElement>(".maker-section, .services-section")];
    const cards = [...main.current.querySelectorAll<HTMLElement>(".selected-project")];
    const aboutTitle = sheets[0].querySelector<HTMLElement>(".chapter-title")!;
    const serviceSheet = sheets[1];
    const reveals = [...serviceSheet.querySelectorAll<HTMLElement>(":scope > .section-topline, :scope > .chapter-title, :scope > .services-intro, .service-row")];
    let frame = 0;
    const draw = () => {
      frame = 0;
      const top = serviceSheet.getBoundingClientRect().top;
      // View timelines stretch when an ancestor sticks. Use each row's actual
      // viewport position so its text finishes revealing before the cover arrives.
      const values = reveals.map(element => {
        const distance = Math.min(180, Math.max(90, element.offsetHeight));
        return Math.min(1, Math.max(0, (window.innerHeight * .94 - top - element.offsetTop) / distance));
      });
      const titleProgress = Math.min(1, Math.max(0, (innerHeight * .85 - aboutTitle.getBoundingClientRect().top) / (innerHeight * .35)));
      aboutTitle.style.setProperty("--chapter-reveal", titleProgress.toFixed(3));
      reveals.forEach((element, i) => element.style.setProperty("--service-reveal", values[i].toFixed(3)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const measure = () => {
      // Preserve the same title-rail pile on small screens. Tall compositions
      // finish scrolling into view before their last part pins.
      const rail = cards[0].querySelector<HTMLElement>(".project-heading")!.offsetHeight;
      const cardTop = Math.min(window.innerWidth < 900 ? 16 : 96,
        window.innerHeight - Math.max(...cards.map(card => card.offsetHeight)) - rail - 24);
      cards.forEach((card, i) => card.style.setProperty("--project-top", `${cardTop + i * rail}px`));
      sheets.forEach(sheet => {
        // Let tall sections finish reading before the next sheet covers them.
        sheet.style.setProperty("--folder-top", `${Math.min(0, window.innerHeight - sheet.offsetHeight)}px`);
        sheet.dataset.folderReady = "true";
      });
      schedule();
    };
    const resize = new ResizeObserver(measure);
    sheets.forEach(sheet => resize.observe(sheet));
    cards.forEach(card => resize.observe(card));
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", schedule, { passive: true });
    measure();
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", schedule);
      reveals.forEach(element => element.style.removeProperty("--service-reveal"));
      aboutTitle.style.removeProperty("--chapter-reveal");
      cards.forEach(card => card.style.removeProperty("--project-top"));
      sheets.forEach(sheet => {
        sheet.style.removeProperty("--folder-top");
        delete sheet.dataset.folderReady;
      });
    };
  }, [hydrated, simple]);

  return (
    <div className={`portfolio collage-home ${simple ? "simple-motion" : "full-motion"}`}>
      <ParticleField simple={simple} />
      <Header home />
      <main ref={main}>
        <section className="editorial-hero" id="top" data-chapter="arrival" aria-labelledby="hero-title">
          <div className="hero-byline"><span>Independent designer & developer</span></div>
          <h1 id="hero-title"><span className="hero-greeting">Hi, I’m</span><span className="hero-name">Joshua<span className="hero-dot">.</span></span></h1>
          <div className="editorial-hero-bottom">
            <p>I give ideas a visual identity.<br />Then I build the websites and<br className="desktop-break" /> products that bring them to life.</p>
            <span className="hero-signature" aria-hidden="true">Design.<br />Develop.<br /><em>Make it matter.</em></span>
          </div>
          <div className="hero-caption"><span>Visual identity · Digital design · Development</span><span>Scroll to explore <ArrowDown size={12} aria-hidden="true" /></span></div>
        </section>
        <WorkCollage simple={simple} enabled={hydrated} />
        <div id="about" className="section-anchor" aria-hidden="true" />
        <section className="maker-section" data-chapter="about" aria-labelledby="about-title">
          <p className="eyebrow">The person behind the pixels</p>
          <ChapterTitle id="about-title">About me.</ChapterTitle>
          <p className="maker-statement">I like the space where<br />a good idea becomes<br /><em>something you can use.</em></p>
          <div className="maker-copy"><p>I’m Joshua Sabuero, a designer and developer who enjoys working on both sides of the screen. I move between visual identity, interfaces, and code to give an idea a consistent character.</p><p>I enjoy turning complex ideas into clear, useful experiences. I pay attention to the details, from the first visual impression to the way each interaction works, so the result feels natural to use.</p></div>
          <a className="text-link" href="#services">Here’s what I can help with <ArrowDown size={18} aria-hidden="true" /></a>
        </section>
        <div id="services" className="section-anchor" aria-hidden="true" />
        <section className="services-section" data-chapter="services" aria-labelledby="services-title">
          <div className="section-topline"><span>From the first idea to the final detail</span><span>Design + development</span></div>
          <ChapterTitle id="services-title">Services.</ChapterTitle>
          <div className="services-intro"><p>A clear identity.<br />A thoughtful experience.<br />A working product.</p><span>One person, connected thinking.<br />Bring me in for a part of the process<br />or the whole thing.</span></div>
          <div className="services-list">{services.map((service, i) => <article className="service-row" key={service.title}><span className="service-number" aria-hidden="true">0{i + 1}</span><h3>{service.title}</h3><div><p>{service.text}</p><span>{service.tags}</span></div></article>)}</div>
        </section>
        <section className="selected-projects" aria-labelledby="projects-title" data-chapter="projects">
          <div className="projects-intro"><p className="eyebrow">A closer look at the work</p><ChapterTitle id="projects-title">Projects.</ChapterTitle><p>Two different worlds. Designed and built by me.</p></div>
          <div className="project-stack"><SelectedProject slug="space-arabica" number="01" /><SelectedProject slug="korte" number="02" /><Contact /></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
