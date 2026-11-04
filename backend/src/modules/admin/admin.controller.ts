import type { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service.js";
import {
  queryAuditLogsSchema,
  queryUsersSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "./admin.schema.js";

export const getOverviewKPIsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await adminService.getOverviewKPIs();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const listAuditLogsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = queryAuditLogsSchema.parse(req.query);
    const result = await adminService.listAuditLogs(query);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const listUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = queryUsersSchema.parse(req.query);
    const result = await adminService.listUsers(query);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const validatedData = updateUserRoleSchema.parse(req.body);
    const updated = await adminService.updateUserRole(req.user!, id, validatedData);

    res.json({
      success: true,
      message: "User role updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const validatedData = updateUserStatusSchema.parse(req.body);
    const updated = await adminService.updateUserStatus(req.user!, id, validatedData);

    res.json({
      success: true,
      message: `User status updated to ${validatedData.status} successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getSettingsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await adminService.getSettings();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await adminService.updateSettings(req.body);
    res.json({
      success: true,
      message: "Platform settings updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentReportsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await adminService.getDepartmentReports();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
