import Home from "./pages/Home";
import CaseStudy from "./pages/CaseStudy";
import KorteCaseStudy from "./pages/KorteCaseStudy";

const App = ({ path = "/" }: { path?: string }) => {
  if (/\/work\/space-arabica\/?$/.test(path))
    return <CaseStudy slug="space-arabica" />;
  if (/\/work\/korte\/?$/.test(path)) return <KorteCaseStudy />;
  return <Home />;
};

export default App;
