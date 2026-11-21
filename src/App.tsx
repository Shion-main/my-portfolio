import Home from "./pages/Home";
import ProjectCase from "./pages/ProjectCase";
import type { ProjectSlug } from "./work/projects";

const App = ({ path = "/" }: { path?: string }) => {
  const match = path.match(/\/work\/(space-arabica|korte|fluxtrack|atlas-accountancy)\/?$/);
  if (match) return <ProjectCase slug={match[1] as ProjectSlug} />;
  return <Home />;
};

export default App;
