import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

// Simpel logger så vi ikke henter noget fra vite.ts i prod
const log = (...args: any[]) => console.log("[sqp]", ...args);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request-timer + kompakt API-log
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-expect-error - vi wrapper res.json for at logge payload kort
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          /* ignore JSON stringify errors */
        }
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  // registerRoutes forventes at returnere en Node HTTP server-instans
  const server = await registerRoutes(app);

  // Central error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status ?? err?.statusCode ?? 500;
    const message = err?.message ?? "Internal Server Error";
    res.status(status).json({ message });
    // Log til stdout så container logs fanger den
    console.error(err);
  });

  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    // DEV: Lazy-load Vite så pakken aldrig kræves i prod
    const viteMod = await import("vite");
    const vite = await viteMod.createServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    log("Vite dev middleware enabled");
  } else {
    // PROD: Servér statiske filer fra dist/public
    const path = await import("node:path");
    const fs = await import("node:fs");

    const distDir = path.resolve(process.cwd(), "dist");
    const publicDir = path.join(distDir, "public");

    app.use(express.static(publicDir, { index: false }));

    // Catch-all til SPA: send index.html hvis den findes
    app.get("*", (_req: Request, res: Response) => {
      const indexHtml = path.join(publicDir, "index.html");
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(500).send("Build mangler: dist/public/index.html");
      }
    });

    log("Serving static build from dist/public");
  }

  // Lyt altid på 0.0.0.0:5000 (matcher Dockerfile/compose)
  const port = Number(process.env.PORT ?? 5000);
  const host = process.env.HOST ?? "0.0.0.0";

  server.listen(
    {
      port,
      host,
      // reusePort true hvis din server understøtter det; ellers kan det droppes
      // @ts-ignore - ikke alle typer har reusePort
      reusePort: true,
    },
    () => {
      log(`serving on http://${host}:${port} (${isProd ? "prod" : "dev"})`);
    }
  );
})();
