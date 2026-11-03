import express, { type Application } from "express";
import cors from "cors";
import { config } from "./config/env.js";
import apiRouter from "./routes.js";
import { errorHandler } from "./common/middlewares/error.middleware.js";
import { NotFoundError } from "./common/errors/app-error.js";

const app: Application = express();

// Global Middlewares
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base / Root Endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "Online Exam Management API",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

// API Routes
app.use("/api/v1", apiRouter);

// Catch-all 404 handler
app.use((_req, _res, next) => {
  next(new NotFoundError("Requested endpoint not found"));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

