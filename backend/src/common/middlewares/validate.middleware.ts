import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      Object.defineProperty(req, "query", {
        value: parsed,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.params);
      Object.defineProperty(req, "params", {
        value: parsed,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};
