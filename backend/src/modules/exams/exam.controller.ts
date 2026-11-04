import type { Request, Response, NextFunction } from "express";
import { examService } from "./exam.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { UnauthorizedError } from "../../common/errors/app-error.js";
import type { ListExamsQuery } from "./exam.schema.js";

export const createExamHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const exam = await examService.createExam(req.body);
    sendSuccess(res, exam, "Exam created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const updateExamHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const exam = await examService.updateExam(id as string, req.body);
    sendSuccess(res, exam, "Exam updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteExamHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await examService.deleteExam(id as string);
    sendSuccess(res, { message: "Exam deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const listExamsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const query = req.query as unknown as ListExamsQuery;

    if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
      const result = await examService.listExamsForAdmin(query);
      sendSuccess(res, result);
    } else {
      const result = await examService.listExamsForStudent(req.user.id, query);
      sendSuccess(res, result);
    }
  } catch (error) {
    next(error);
  }
};

export const startExamAttemptHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const attempt = await examService.startExamAttempt(req.user.id, id as string);
    sendSuccess(res, attempt, "Exam started. Good luck!");
  } catch (error) {
    next(error);
  }
};

export const submitExamAttemptHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const result = await examService.submitExamAttempt(
      req.user.id,
      id as string,
      req.body
    );
    sendSuccess(res, result, "Exam submitted and graded");
  } catch (error) {
    next(error);
  }
};

export const getAttemptResultsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const result = await examService.getAttemptResults(
      req.user.id,
      req.user.role,
      id as string
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const listStudentExamHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const history = await examService.listStudentExamHistory(req.user.id);
    sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
};

