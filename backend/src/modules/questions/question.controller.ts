import type { Request, Response, NextFunction } from "express";
import { questionService } from "./question.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { UnauthorizedError, BadRequestError } from "../../common/errors/app-error.js";
import { bulkImportSchema, type ListQuestionsQuery } from "./question.schema.js";

function parseCsvQuestions(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new BadRequestError("CSV must contain a header row and at least one data row");
  }

  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const rows = lines.slice(1).map(parseLine);
  return rows.map((cols, idx) => {
    const body = cols[0];
    const topic = cols[1] || "General";
    const difficulty = (["EASY", "MEDIUM", "HARD"].includes(cols[2]?.toUpperCase())
      ? cols[2].toUpperCase()
      : "MEDIUM") as "EASY" | "MEDIUM" | "HARD";
    const marks = Number(cols[3]) > 0 ? Number(cols[3]) : 1.0;
    const explanation = cols[4] || "";
    const optA = cols[5] || "";
    const optB = cols[6] || "";
    const optC = cols[7] || "";
    const optD = cols[8] || "";
    const correctIndicator = (cols[9] || "A").trim().toUpperCase();

    if (!body || !optA || !optB) {
      throw new BadRequestError(
        `Row ${idx + 2}: Question body and at least Option A and Option B are required`
      );
    }

    const options = [
      { optionText: optA, isCorrect: correctIndicator === "A" || correctIndicator === "1", sortOrder: 0 },
      { optionText: optB, isCorrect: correctIndicator === "B" || correctIndicator === "2", sortOrder: 1 },
    ];
    if (optC) {
      options.push({
        optionText: optC,
        isCorrect: correctIndicator === "C" || correctIndicator === "3",
        sortOrder: 2,
      });
    }
    if (optD) {
      options.push({
        optionText: optD,
        isCorrect: correctIndicator === "D" || correctIndicator === "4",
        sortOrder: 3,
      });
    }

    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      options[0].isCorrect = true;
    }

    return {
      body,
      topic,
      difficulty,
      marks,
      explanation,
      status: "PUBLISHED" as const,
      options,
    };
  });
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

