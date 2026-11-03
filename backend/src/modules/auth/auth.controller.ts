import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { UnauthorizedError } from "../../common/errors/app-error.js";

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, "Student registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const updated = await authService.updateProfile(req.user.id, req.body);
    sendSuccess(res, updated, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};
