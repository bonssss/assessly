import type { Request, Response, NextFunction } from "express";
import { departmentService } from "./department.service.js";
import { sendSuccess } from "../../common/utils/response.js";

export const listDepartmentsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departments = await departmentService.listActive();
    sendSuccess(res, departments);
  } catch (error) {
    next(error);
  }
};

export const createDepartmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dept = await departmentService.create(req.body);
    sendSuccess(res, dept, "Department created successfully", 201);
  } catch (error) {
    next(error);
  }
};

