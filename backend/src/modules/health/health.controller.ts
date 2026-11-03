import type { Request, Response } from "express";
import { sendSuccess } from "../../common/utils/response.js";

export const getHealth = (_req: Request, res: Response): Response => {
  return sendSuccess(
    res,
    {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    "Service is healthy"
  );
};

