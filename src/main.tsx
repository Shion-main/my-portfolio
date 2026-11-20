import { createRoot, hydrateRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import App from "./App.tsx";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "@fontsource-variable/anybody/wdth.css";
import "@fontsource-variable/instrument-sans/wdth.css";
import "./styles/base.css";
import "./portfolio.css";
import "./collage.css";
import "./korte-case.css";
import "./project-transitions.css";

const root = document.getElementById("root")!;
const app = <App path={window.location.pathname} />;
if (root.hasChildNodes()) hydrateRoot(root, app);
// Vite serves an empty root in development. Complete that first render before
// the render-blocking module releases the incoming page's transition snapshot.
else flushSync(() => createRoot(root).render(app));
