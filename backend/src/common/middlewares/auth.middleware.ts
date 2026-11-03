import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors/app-error.js";
import { verifyToken } from "../utils/jwt.js";
import prisma from "../../prisma.js";
import type { UserRole } from "../types/index.js";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired authentication token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User account no longer exists");
    }

    if (user.status !== "ACTIVE") {
      throw new ForbiddenError("Account is inactive or suspended");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Requires one of the following roles: ${roles.join(", ")}`
        )
      );
    }

    next();
  };
};
