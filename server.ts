import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDb } from "./server/db";
import { apiRouter } from "./server/api";

async function startServer() {
  // Initialize the persistent database before starting the web server
  await initDb();

  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API router prefix
  app.use("/api", apiRouter);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", database: "connected" });
  });

  // Serve Frontend with Vite in development, or Static build in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring dev mode server with hot-reload support...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring production mode static asset server...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodShare full-stack server actively listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical server boot failure:", error);
});
