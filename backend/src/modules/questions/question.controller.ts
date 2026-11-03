import type { Request, Response, NextFunction } from "express";
import { questionService } from "./question.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { UnauthorizedError } from "../../common/errors/app-error.js";
import type { ListQuestionsQuery } from "./question.schema.js";

export const createQuestionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const question = await questionService.createQuestion(req.body);
    sendSuccess(res, question, "Question created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const updateQuestionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await questionService.updateQuestion(id as string, req.body);
    sendSuccess(res, updated, "Question updated successfully");
  } catch (error) {
    next(error);
  }
};

export const listQuestionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const query = req.query as unknown as ListQuestionsQuery;

    if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
      const result = await questionService.listQuestionsForAdmin(query);
      sendSuccess(res, result);
    } else {
      const result = await questionService.listQuestionsForStudent(req.user.id, query);
      sendSuccess(res, result);
    }
  } catch (error) {
    next(error);
  }
};

export const submitPracticeAnswerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const result = await questionService.submitPracticeAnswer(
      req.user.id,
      id as string,
      req.body
    );
    sendSuccess(res, result, "Answer submitted and scored");
  } catch (error) {
    next(error);
  }
};
