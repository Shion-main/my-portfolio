import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: "space-arabica-static-demo",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const rawUrl = req.url?.split("?")[0] ?? "";
          if (rawUrl === "/work/space-arabica/demo") {
            res.writeHead(302, { Location: "/work/space-arabica/demo/" });
            res.end();
            return;
          }
          if (rawUrl.startsWith("/work/space-arabica/demo/")) {
            const subPath = rawUrl.slice("/work/space-arabica/demo/".length) || "index.html";
            if (subPath.endsWith(".html")) {
              try {
                const filePath = resolve(process.cwd(), "public/work/space-arabica/demo", subPath);
                const html = await readFile(filePath, "utf8");
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.end(html);
                return;
              } catch {
                // Fall through if not found
              }
            }
          }
          next();
        });
      },
    },
  ],
  base: process.env.VITE_BASE_PATH || "/",
});
