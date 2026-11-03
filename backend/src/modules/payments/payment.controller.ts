import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { paymentService } from "./payment.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { UnauthorizedError, NotFoundError } from "../../common/errors/app-error.js";

export const getInstructionsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const instructions = await paymentService.getInstructions();
    sendSuccess(res, instructions);
  } catch (error) {
    next(error);
  }
};

export const createPaymentSettingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const setting = await paymentService.createPaymentSetting(req.body);
    sendSuccess(res, setting, "Payment method configured", 201);
  } catch (error) {
    next(error);
  }
};

export const listPackagesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const packages = await paymentService.listPackages();
    sendSuccess(res, packages);
  } catch (error) {
    next(error);
  }
};

export const createPackageHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pkg = await paymentService.createPackage(req.body);
    sendSuccess(res, pkg, "Package created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const submitPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const result = await paymentService.submitPayment(
      req.user.id,
      req.body,
      req.file
    );
    sendSuccess(
      res,
      result,
      "Payment submitted successfully and pending admin verification",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getReceiptPreviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const result = await paymentService.getReceiptPreviewUrl(
      req.user.id,
      req.user.role,
      id as string
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const serveLocalReceiptFileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    // Prevent directory traversal
    const safeFilename = path.basename(filename as string);
    const filePath = path.resolve(process.cwd(), "uploads", "receipts", safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("Receipt file not found");
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

export const listStudentPaymentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const payments = await paymentService.listStudentPayments(req.user.id);
    sendSuccess(res, payments);
  } catch (error) {
    next(error);
  }
};

export const listAdminPaymentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query as { status?: "PENDING" | "APPROVED" | "REJECTED" };
    const queue = await paymentService.listAdminPayments(status);
    sendSuccess(res, queue);
  } catch (error) {
    next(error);
  }
};

export const approvePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const { decisionNote } = req.body;
    const result = await paymentService.approvePayment(
      req.user.id,
      id as string,
      decisionNote
    );
    sendSuccess(res, result, "Payment approved and access entitlement unlocked");
  } catch (error) {
    next(error);
  }
};

export const rejectPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const { decisionNote } = req.body;
    const result = await paymentService.rejectPayment(
      req.user.id,
      id as string,
      decisionNote
    );
    sendSuccess(res, result, "Payment rejected");
  } catch (error) {
    next(error);
  }
};
