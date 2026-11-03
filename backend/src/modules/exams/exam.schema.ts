import { z } from "zod";

export const examQuestionItemSchema = z.object({
  questionId: z.string().uuid("Invalid question identifier"),
  marks: z.number().positive().default(1.0),
  sequence: z.number().int().nonnegative().optional(),
});

export const createExamSchema = z.object({
  departmentId: z.string().uuid("Invalid department identifier"),
  title: z
    .string()
    .trim()
    .min(3, "Exam title must be at least 3 characters")
    .max(200, "Exam title must not exceed 200 characters"),
  instructions: z.string().trim().optional(),
  durationMinutes: z
    .number()
    .int()
    .min(1, "Exam duration must be at least 1 minute")
    .max(300, "Exam duration cannot exceed 300 minutes (5 hours)"),
  feedbackPolicy: z
    .enum(["IMMEDIATE", "AFTER_SUBMISSION", "AFTER_EXAM_CLOSES"])
    .default("AFTER_SUBMISSION"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  questionIds: z
    .array(z.string().uuid())
    .min(1, "An exam must have at least one question"),
});

export const updateExamSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  instructions: z.string().trim().optional(),
  durationMinutes: z.number().int().min(1).max(300).optional(),
  feedbackPolicy: z
    .enum(["IMMEDIATE", "AFTER_SUBMISSION", "AFTER_EXAM_CLOSES"])
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  questionIds: z.array(z.string().uuid()).min(1).optional(),
});

export const studentAnswerSubmissionItemSchema = z.object({
  questionId: z.string().uuid("Invalid question identifier"),
  selectedOptionId: z.string().uuid("Invalid option identifier").nullable().optional(),
});

export const submitExamAttemptSchema = z.object({
  answers: z.array(studentAnswerSubmissionItemSchema),
});

export const listExamsQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type SubmitExamAttemptInput = z.infer<typeof submitExamAttemptSchema>;
export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>;
