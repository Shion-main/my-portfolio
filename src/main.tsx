import { createRoot, hydrateRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import App from "./App.tsx";
import "@fontsource/syne/latin-600.css";
import "@fontsource/syne/latin-700.css";
import "@fontsource/syne/latin-800.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
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
