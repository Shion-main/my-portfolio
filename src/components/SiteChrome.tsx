import { asset, EMAIL } from "../work/asset";
import "./chrome.css";

/** Site header. Its text colour follows the chapter on screen through --head; case pages get a solid backdrop. */
export function Header({ solid = false }: { solid?: boolean; showEmail?: boolean }) {
  return (
    <header className={`site-head${solid ? " site-head--solid" : ""}`}>
      <a className="site-head__name" href={asset("")}>Joshua Sabuero</a>
      <nav aria-label="Main">
        <a href={asset("#work")}>Work</a>
        <a href={asset("#about")}>About</a>
        <a href={asset("#contact")}>Contact</a>
      </nav>
    </header>
  );
}

export function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <p className="label">Contact</p>
      <h2 id="contact-title">Let’s make<br />something.</h2>
      <a className="contact-mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
    </section>
  );
}

export function Footer(_props: { showEmail?: boolean }) {
  return (
    <footer className="site-foot">
      <p className="label">© 2026 Joshua Sabuero</p>
      <a className="label" href={`mailto:${EMAIL}`}>{EMAIL}</a>
    </footer>
  );
}
