import { z } from "zod";

const optionSchema = z.object({
  optionText: z.string().trim().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const createQuestionSchema = z
  .object({
    departmentId: z.string().uuid("Invalid department identifier"),
    body: z.string().trim().min(5, "Question prompt must be at least 5 characters"),
    topic: z.string().trim().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    marks: z.number().positive().default(1.0),
    explanation: z.string().trim().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
    options: z
      .array(optionSchema)
      .min(2, "Questions must have at least 2 options")
      .max(6, "Questions cannot have more than 6 options"),
  })
  .refine(
    (data) => {
      if (data.status === "PUBLISHED") {
        const correctCount = data.options.filter((opt) => opt.isCorrect).length;
        return correctCount === 1;
      }
      return true;
    },
    {
      message: "Published single-choice questions must have exactly one correct option",
      path: ["options"],
    }
  );

export const updateQuestionSchema = z
  .object({
    body: z.string().trim().min(5).optional(),
    topic: z.string().trim().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    marks: z.number().positive().optional(),
    explanation: z.string().trim().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    options: z
      .array(optionSchema)
      .min(2)
      .max(6)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.options) {
        const correctCount = data.options.filter((opt) => opt.isCorrect).length;
        if (data.status === "PUBLISHED" || !data.status) {
          return correctCount === 1;
        }
      }
      return true;
    },
    {
      message: "Published questions must have exactly one correct option",
      path: ["options"],
    }
  );

export const submitAnswerSchema = z.object({
  selectedOptionId: z.string().uuid("Invalid option identifier"),
});

export const listQuestionsQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const bulkImportQuestionItemSchema = z
  .object({
    body: z.string().trim().min(5, "Question prompt must be at least 5 characters"),
    topic: z.string().trim().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    marks: z.number().positive().default(1.0),
    explanation: z.string().trim().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
    options: z
      .array(optionSchema)
      .min(2, "Questions must have at least 2 options")
      .max(6, "Questions cannot have more than 6 options"),
  })
  .refine(
    (data) => {
      const correctCount = data.options.filter((opt) => opt.isCorrect).length;
      return correctCount === 1;
    },
    {
      message: "Each question must have exactly one correct option",
      path: ["options"],
    }
  );

export const bulkImportSchema = z.object({
  departmentId: z.string().uuid("Invalid department identifier"),
  questions: z.array(bulkImportQuestionItemSchema).min(1, "At least one question is required"),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;

