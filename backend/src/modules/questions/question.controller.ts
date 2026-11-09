import type { Request, Response, NextFunction } from "express";
import { questionService } from "./question.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { UnauthorizedError, BadRequestError } from "../../common/errors/app-error.js";
import { bulkImportSchema, type ListQuestionsQuery } from "./question.schema.js";

const VALID_DIFFICULTIES: Record<string, "EASY" | "MEDIUM" | "HARD"> = {
  EASY: "EASY",
  HARD: "HARD",
  MEDIUM: "MEDIUM",
};

const OPTION_INDEX_MAP: Record<string, number> = {
  A: 0,
  "1": 0,
  B: 1,
  "2": 1,
  C: 2,
  "3": 2,
  D: 3,
  "4": 3,
};

function parseCsvLine(text: string): string[] {
  return text.split(",").map((col) => col.replace(/^["']|["']$/g, "").trim());
}

function parseDifficulty(val?: string): "EASY" | "MEDIUM" | "HARD" {
  return VALID_DIFFICULTIES[String(val).toUpperCase()] ?? "MEDIUM";
}

interface QuestionOptionItem {
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
}

function buildQuestionOptions(rawOptions: string[], indicator: string): QuestionOptionItem[] {
  const correctIdx = OPTION_INDEX_MAP[indicator.toUpperCase()] ?? 0;
  const activeOptions = rawOptions.filter((opt) => opt.length > 0);

  return activeOptions.map((text, idx) => ({
    optionText: text,
    isCorrect: idx === correctIdx,
    sortOrder: idx,
  }));
}

function parseCsvRow(cols: string[], idx: number) {
  const [
    body = "",
    topic = "General",
    diff = "MEDIUM",
    marksStr = "1",
    explanation = "",
    optA = "",
    optB = "",
    optC = "",
    optD = "",
    indicator = "A",
  ] = cols;

  if (!body || !optA || !optB) {
    throw new BadRequestError(
      `Row ${idx + 2}: Question body and at least Option A and Option B are required`
    );
  }

  const marks = parseFloat(marksStr) || 1.0;
  const options = buildQuestionOptions([optA, optB, optC, optD], indicator);

  return {
    body,
    topic,
    difficulty: parseDifficulty(diff),
    marks,
    explanation,
    status: "PUBLISHED" as const,
    options,
  };
}

function parseCsvQuestions(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new BadRequestError("CSV must contain a header row and at least one data row");
  }

  const rows = lines.slice(1).map(parseCsvLine);
  return rows.map((cols, idx) => parseCsvRow(cols, idx));
}

export const bulkImportQuestionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { departmentId, questions, csvText } = req.body;
    if (!departmentId) {
      throw new BadRequestError("Department identifier is required");
    }

    let parsedQuestions = questions;
    if (typeof csvText === "string" && csvText.trim().length > 0) {
      parsedQuestions = parseCsvQuestions(csvText);
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new BadRequestError("No questions provided for import");
    }

    const validated = bulkImportSchema.parse({
      departmentId,
      questions: parsedQuestions,
    });

    const result = await questionService.bulkImportQuestions(validated);
    sendSuccess(res, result, `Successfully imported ${result.importedCount} questions`, 201);
  } catch (error) {
    next(error);
  }
};

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

export const deleteQuestionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await questionService.deleteQuestion(id as string);
    sendSuccess(res, { message: "Question deleted successfully" });
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

