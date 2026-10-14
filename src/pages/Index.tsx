import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Menu,
  X,
} from "lucide-react";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const projects = [
  {
    name: "Korte",
    category: "Community product · Self-initiated",
    status: "In progress",
    description:
      "A community app for Davao pickleball players. Smart Queue pairs players by DUPR-based tier; live sessions, leaderboards, and shareable results keep the community connected.",
    contribution:
      "Product direction, design system, 60+ screens, and front-end development",
    tools: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Capacitor"],
  },
  {
    name: "Spacely",
    category: "Rental search · School project",
    status: "Case study",
    description:
      "Helping people in Davao find affordable rental spaces through searchable listings, useful filters, and a credibility verification layer.",
    contribution: "UI/UX design and development",
    tools: ["Search & filtering", "Verified listings", "Web app"],
    image: "Images/Projects/SPACELY.png",
    imageAlt: "Spacely rental search interface showing listing previews",
    github: "https://github.com/Shion-main/spacely",
  },
  {
    name: "J&H Apartment",
    category: "Property management · School project",
    status: "Case study",
    description:
      "A central place for staff to monitor rooms, generate bills, send billing emails, and review past transactions.",
    contribution: "UI/UX design and development",
    tools: ["Room monitoring", "Automated billing", "Transaction history"],
    image: "Images/Projects/J-H-APARTMENT.png",
    imageAlt: "J&H Apartment management dashboard interface",
    github: "https://github.com/Shion-main/j-h-apartment",
  },
  {
    name: "FluxTrack",
    category: "Facility & attendance · School capstone",
    status: "In progress",
    description:
      "A progressive web app for Mapúa Malayan Colleges Mindanao that makes facility bookings and hybrid faculty attendance easier to verify.",
    contribution: "UI/UX design and development",
    tools: ["PWA", "Facility booking", "Attendance visibility"],
  },
];

const credentials = [
  {
    name: "AWS Certified AI Practitioner",
    issuer: "Amazon Web Services",
    date: "Apr 2026",
  },
  {
    name: "Business Analysis & Process Management",
    issuer: "Coursera",
    date: "Oct 2025",
  },
  {
    name: "Microsoft Office Specialist: Excel Associate",
    issuer: "Certiport",
    date: "Oct 2023",
  },
];

const navigation = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a
          className="wordmark"
          href="#top"
          aria-label="Joshua Sabuero, back to top"
          onClick={() => setMenuOpen(false)}
        >
          <span className="wordmark-symbol" aria-hidden="true">
            JS<span>.</span>
          </span>
          <span className="wordmark-name">Joshua Sabuero</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="header-contact"
          href="mailto:joshuasabuero.main@gmail.com"
        >
          Let’s talk <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className="mobile-nav"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        {navigation.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="shell hero-layout">
        <div className="hero-copy">
          <p className="hero-intro">
            <span className="status-dot" /> UI/UX designer & front-end developer
          </p>
          <h1 id="hero-title">
            Digital products built for <span>people who use them.</span>
          </h1>
          <p className="hero-description">
            I’m Joshua Sabuero. I design and build clear, useful experiences for
            communities — from the first wireframe to a working interface.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              Explore my work <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a className="text-link" href="mailto:joshuasabuero.main@gmail.com">
              Get in touch <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="Preview of Spacely, a rental search project"
        >
          <div className="hero-visual-top">
            <span>Selected work / Spacely</span>
            <span>01 — 04</span>
          </div>
          <div className="hero-shot">
            <img
              src={asset("Images/Projects/SPACELY.png")}
              alt="Spacely rental search interface"
              fetchPriority="high"
            />
          </div>
          <div className="hero-visual-bottom">
            <span>Design meets real-world utility.</span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="shell hero-bottom">
        <span>Based in the Philippines · Working across design and code</span>
        <a href="#work">
          Scroll to work <ArrowDown size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section
      id="work"
      className="work-section section-pad"
      aria-labelledby="work-title"
    >
      <div className="shell">
        <div className="section-heading work-heading">
          <div>
            <p className="section-label">Selected work</p>
            <h2 id="work-title">Ideas made useful.</h2>
          </div>
          <p>
            Community tools, search experiences, and systems that make everyday
            tasks simpler.
          </p>
        </div>
        <article className="project-feature" aria-labelledby="korte-title">
          <div className="project-feature-copy">
            <div className="project-meta">
              <span>{projects[0].category}</span>
              <span>{projects[0].status}</span>
            </div>
            <h3 id="korte-title" className="korte-title">
              <img
                src={asset("Images/Projects/Korte/korte-logo.svg")}
                alt="Korte"
                width="2502"
                height="564"
              />
            </h3>
            <p className="project-lead">A better way to find your next game.</p>
            <p>{projects[0].description}</p>
            <p className="project-contribution">
              <strong>My role</strong> {projects[0].contribution}
            </p>
            <ul className="tag-list" aria-label="Korte technologies">
              {projects[0].tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </div>
          <figure className="korte-showcase">
            <figcaption className="korte-showcase-caption">
              <span>Product in practice</span>
              <span>01 / 02</span>
            </figcaption>
            <p className="korte-showcase-headline">
              Find a game.
              <br />
              Run a meet.
            </p>
            <div className="korte-screens">
              <img
                className="korte-screen"
                src={asset("Images/Projects/Korte/organizer-dashboard.png")}
                alt="Korte organizer dashboard with an upcoming pickleball meet and create a meet action"
                width="1170"
                height="2532"
                loading="lazy"
                decoding="async"
              />
              <img
                className="korte-screen korte-screen-secondary"
                src={asset("Images/Projects/Korte/share-meet.png")}
                alt="Korte meet page showing session details and a join meet action"
                width="1170"
                height="2532"
                loading="lazy"
                decoding="async"
              />
            </div>
          </figure>
        </article>
        <section className="school-projects" aria-labelledby="school-projects-title">
          <div className="school-projects-heading">
            <div>
              <p className="section-label">More selected work</p>
              <h3 id="school-projects-title">School projects</h3>
            </div>
            <p>Coursework and capstone work shaped by practical problems.</p>
          </div>
          <div className="project-grid">
            {projects.slice(1, 3).map((project) => (
              <article className="project-card" key={project.name}>
                <a
                  className="project-image"
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.name} on GitHub`}
                >
                  <img
                    src={asset(project.image!)}
                    alt={project.imageAlt}
                    loading="lazy"
                  />
                  <span className="image-action">
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </span>
                </a>
                <div className="project-card-body">
                  <div className="project-meta">
                    <span>{project.category}</span>
                    <span>{project.status}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p className="project-contribution">
                    <strong>My role</strong> {project.contribution}
                  </p>
                  <ul
                    className="tag-list"
                    aria-label={`${project.name} features`}
                  >
                    {project.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                  <a
                    className="project-link"
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View repository <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <article className="project-next" aria-labelledby="fluxtrack-title">
            <div>
              <p className="project-meta">
                {projects[3].category} <span>{projects[3].status}</span>
              </p>
              <h3 id="fluxtrack-title">FluxTrack</h3>
            </div>
            <div>
              <p>{projects[3].description}</p>
              <p className="project-contribution">
                <strong>My role</strong> {projects[3].contribution}
              </p>
            </div>
            <span className="project-next-arrow" aria-hidden="true">
              <ArrowUpRight size={24} />
            </span>
          </article>
        </section>
      </div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="about-section section-pad"
      aria-labelledby="about-title"
    >
      <div className="shell about-layout">
        <div>
          <p className="section-label">About Joshua</p>
          <h2 id="about-title">I make complex things feel approachable.</h2>
        </div>
        <div className="about-body">
          <p className="about-lead">
            My work sits where product thinking, interface design, and front-end
            development meet.
          </p>
          <p>
            I’m pursuing a BS in Information Systems at Mapúa Malayan Colleges
            Mindanao (2022–present). I enjoy understanding the people behind a
            problem, shaping a clear experience, and building the details that
            make it work.
          </p>
          <p>
            Outside product work, I’ve led creative direction for student events
            and organized community pickleball sessions. Those experiences keep
            my design grounded in real people and real constraints.
          </p>
          <div className="capabilities">
            <div>
              <h3>Design</h3>
              <p>Research, wireframes, prototypes, design systems, Figma</p>
            </div>
            <div>
              <h3>Development</h3>
              <p>
                Next.js, React, TypeScript, Tailwind CSS, Supabase, Capacitor
              </p>
            </div>
            <div>
              <h3>Collaboration</h3>
              <p>Creative direction, teamwork, community organizing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section
      id="experience"
      className="experience-section section-pad"
      aria-labelledby="experience-title"
    >
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="section-label">Beyond the screen</p>
            <h2 id="experience-title">Built with people.</h2>
          </div>
          <p>Leadership and community work shape how I approach design.</p>
        </div>
        <div className="experience-list">
          <article>
            <span className="experience-date">2024 — Present</span>
            <div>
              <h3>
                Creative Head <span>· ISSA, MMCM</span>
              </h3>
              <p>
                Lead event design across presentations, signage, booth
                materials, and branding for the Information Systems Students
                Association.
              </p>
            </div>
          </article>
          <article>
            <span className="experience-date">Mar 2026 — Present</span>
            <div>
              <h3>
                Founder & Organizer{" "}
                <span>· Seven Society / Prosperidad Pickleball Club</span>
              </h3>
              <p>
                Organize open-play sessions for 34–48 players, handling
                communications, event logistics, and marketing materials.
              </p>
            </div>
          </article>
        </div>
        <div className="credentials">
          <h3>Selected credentials</h3>
          <ul>
            {credentials.map((item) => (
              <li key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.issuer}</span>
                </div>
                <time>{item.date}</time>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="contact-section section-pad"
      aria-labelledby="contact-title"
    >
      <div className="shell contact-layout">
        <div>
          <p className="section-label">Start a conversation</p>
          <h2 id="contact-title">Have something useful in mind?</h2>
          <p>
            For product design, front-end work, or a thoughtful collaboration,
            I’d like to hear about it.
          </p>
        </div>
        <a
          className="contact-email"
          href="mailto:joshuasabuero.main@gmail.com?subject=Let%27s%20work%20together"
        >
          joshuasabuero.main@gmail.com{" "}
          <ArrowUpRight size={30} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <a className="footer-name" href="#top">
          Joshua Sabuero<span>.</span>
        </a>
        <p>Designing and building for people, one useful detail at a time.</p>
        <div className="footer-links">
          <a
            href="https://github.com/Shion-main"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Joshua on GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/joshua-robert-sabuero-6b3677373/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Joshua on LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="mailto:joshuasabuero.main@gmail.com"
            aria-label="Email Joshua"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Joshua Sabuero</span>
        <span>Made in the Philippines</span>
      </div>
    </footer>
  );
}

export default function Index() {
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <Header />
      <main>
        <Hero />
        <Work />
        <About />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
