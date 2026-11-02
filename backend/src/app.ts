import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { inquiriesRouter } from "./routes/inquiries.js";
import { postsRouter } from "./routes/posts.js";
import { projectsRouter } from "./routes/projects.js";
import { servicesRouter } from "./routes/services.js";
import { settingsRouter } from "./routes/settings.js";
import { testimonialsRouter } from "./routes/testimonials.js";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json({ limit: "20kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/inquiries", inquiriesRouter);
app.use("/api/posts", postsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/settings", settingsRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("API request failed:", error);
  if (res.headersSent) return;
  res.status(500).json({ error: "The request could not be completed. Please try again later." });
};
app.use(errorHandler);

export { app };
