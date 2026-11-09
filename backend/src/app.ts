import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.js";
import apiRouter from "./routes.js";
import { globalRateLimiter } from "./common/middlewares/rate-limiter.middleware.js";
import { errorHandler } from "./common/middlewares/error.middleware.js";
import { NotFoundError } from "./common/errors/app-error.js";

const app: Application = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Whitelisted origins for Cross-Origin Resource Sharing
const defaultAllowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:3000",
];

const configuredOrigins =
  config.corsOrigin && config.corsOrigin !== "*"
    ? config.corsOrigin.split(",").map((o) => o.trim())
    : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...configuredOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health probes)
      if (!origin) {
        return callback(null, true);
      }

      // If configured to wildcard '*', permit the request
      if (config.corsOrigin === "*") {
        return callback(null, true);
      }

      // Check explicit allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Automatically allow Vercel deployments (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Automatically allow Render deployments (*.onrender.com)
      if (/^https:\/\/.*\.onrender\.com$/.test(origin)) {
        return callback(null, true);
      }

      // Allow localhost with any development port
      if (config.nodeEnv === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Gracefully reject without throwing unhandled server errors
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Base / Root Endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "Online Exam Management API",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

// API Routes protected with global rate limiting
app.use("/api/v1", globalRateLimiter, apiRouter);

// Catch-all 404 handler
app.use((_req, _res, next) => {
  next(new NotFoundError("Requested endpoint not found"));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
