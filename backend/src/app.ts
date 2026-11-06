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

// Whitelisted origins for Cross-Origin Resource Sharing (mitigates Permissive CORS)
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
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow localhost with any development port
      if (config.nodeEnv === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: access denied from this origin"));
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
