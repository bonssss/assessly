import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { config } from "../../config/env.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // Handle Prisma Database Errors (P2002 Unique Constraint, P2025 Not Found)
  const prismaErr = err as any;
  if (prismaErr.code === "P2002") {
    const fields = prismaErr.meta?.target ? ` (${Array.isArray(prismaErr.meta.target) ? prismaErr.meta.target.join(", ") : prismaErr.meta.target})` : "";
    return res.status(409).json({
      success: false,
      message: `A record with this unique identifier already exists${fields}.`,
    });
  }

  if (prismaErr.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "The requested record was not found or has been deleted.",
    });
  }

  // Unhandled / Internal Server Error
  console.error("Unhandled Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(config.nodeEnv === "development" ? { stack: err.stack } : {}),
  });
};
