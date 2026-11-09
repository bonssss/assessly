import prisma from "../../prisma.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  PaywallError,
} from "../../common/errors/app-error.js";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  SubmitAnswerInput,
  ListQuestionsQuery,
  BulkImportInput,
} from "./question.schema.js";

import { practiceSessionService } from "./practice-session.service.js";

export class QuestionService {
  constructor(
    private readonly practiceService = practiceSessionService
  ) {}

  /**
   * Admin: Create a question with answer options
   */
  async createQuestion(data: CreateQuestionInput) {
    const { departmentId, body, topic, difficulty, marks, explanation, status, options } = data;

    // Verify department exists
    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!dept) {
      throw new NotFoundError("Department not found");
    }

    return prisma.question.create({
      data: {
        departmentId,
        body,
        topic,
        difficulty,
        marks,
        explanation,
        status,
        options: {
          create: options.map((opt, index) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            sortOrder: opt.sortOrder ?? index,
          })),
        },
      },
      include: {
        options: true,
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  /**
   * Admin: Bulk import questions into a department
   */
  async bulkImportQuestions(data: BulkImportInput) {
    const { departmentId, questions } = data;

    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!dept) {
      throw new NotFoundError("Department not found");
    }

    const createdQuestions = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const q of questions) {
        const created = await tx.question.create({
          data: {
            departmentId,
            body: q.body,
            topic: q.topic || "General",
            difficulty: q.difficulty || "MEDIUM",
            marks: q.marks || 1.0,
            explanation: q.explanation || null,
            status: q.status || "PUBLISHED",
            options: {
              create: q.options.map((opt, idx) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                sortOrder: opt.sortOrder ?? idx,
              })),
            },
          },
          include: { options: true },
        });
        results.push(created);
      }
      return results;
    });

    return {
      success: true,
      departmentId,
      departmentName: dept.name,
      importedCount: createdQuestions.length,
      questions: createdQuestions,
    };
  }

  /**
   * Admin: Delete question
   */
  async deleteQuestion(id: string) {
    const question = await prisma.question.findUnique({
      where: { id },
    });
    if (!question) {
      throw new NotFoundError("Question not found");
    }
    return prisma.question.delete({
      where: { id },
    });
  }

  /**
   * Admin: Update question details and options
   */
  async updateQuestion(id: string, data: UpdateQuestionInput) {
    const question = await prisma.question.findUnique({
      where: { id },
    });
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    const { options, ...fields } = data;

    return prisma.$transaction(async (tx) => {
      if (options) {
        // Delete old options and recreate
        await tx.questionOption.deleteMany({
          where: { questionId: id },
        });

        await tx.questionOption.createMany({
          data: options.map((opt, index) => ({
            questionId: id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            sortOrder: opt.sortOrder ?? index,
          })),
        });
      }

      return tx.question.update({
        where: { id },
        data: {
          ...fields,
          version: { increment: 1 },
        },
        include: {
          options: true,
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      });
    });
  }

  /**
   * Admin: List questions with full administrative visibility
   */
  async listQuestionsForAdmin(query: ListQuestionsQuery) {
    const { departmentId, topic, difficulty, status, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (topic) where.topic = { contains: topic, mode: "insensitive" };
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (search) {
      where.body = { contains: search, mode: "insensitive" };
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: {
          options: {
            orderBy: { sortOrder: "asc" },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      questions,
    };
  }

  /**
   * Student: List published questions filtered by enrolled department.
   * Strips correct answers (isCorrect) and explanations for exam integrity (AC-09).
   */
  async listQuestionsForStudent(userId: string, query: ListQuestionsQuery) {
    const { departmentId, topic, difficulty, search, page, limit } = query;
    const skip = (page - 1) * limit;

    // 1. Get student's active department enrollments
    const enrollments = await prisma.userDepartment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { departmentId: true },
    });

    const enrolledDeptIds = enrollments.map((e) => e.departmentId);

    if (enrolledDeptIds.length === 0) {
      return {
        total: 0,
        page,
        limit,
        totalPages: 0,
        questions: [],
      };
    }

    // 2. Validate department query parameter if provided
    if (departmentId && !enrolledDeptIds.includes(departmentId)) {
      throw new ForbiddenError("You are not enrolled in the requested department");
    }

    const where: any = {
      status: "PUBLISHED",
      departmentId: departmentId ? departmentId : { in: enrolledDeptIds },
    };

    if (topic) where.topic = { contains: topic, mode: "insensitive" };
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.body = { contains: search, mode: "insensitive" };
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip: query.random ? 0 : skip,
        take: query.random ? Math.max(limit * 3, 20) : limit,
        select: {
          id: true,
          departmentId: true,
          topic: true,
          type: true,
          body: true,
          difficulty: true,
          marks: true,
          // explanation is omitted for security before submission
          options: {
            select: {
              id: true,
              optionText: true,
              sortOrder: true,
              // isCorrect is omitted for security before submission
            },
            orderBy: { sortOrder: "asc" },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: query.random ? undefined : { createdAt: "desc" },
      }),
    ]);

    let finalQuestions = questions;
    if (query.random) {
      // Dynamic random shuffle
      for (let itemIdx = finalQuestions.length - 1; itemIdx > 0; itemIdx--) {
        const swapIdx = Math.floor(Math.random() * (itemIdx + 1));
        [finalQuestions[itemIdx], finalQuestions[swapIdx]] = [finalQuestions[swapIdx], finalQuestions[itemIdx]];
      }
      finalQuestions = finalQuestions.slice(0, limit);
    }

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      questions: finalQuestions,
    };
  }

  /**
   * Student: Submit practice answer, verify trial quota / entitlement, score, and return feedback.
   */
  async submitPracticeAnswer(
    userId: string,
    questionId: string,
    input: SubmitAnswerInput
  ) {
    return this.practiceService.submitPracticeAnswer(userId, questionId, input);
  }
}

export const questionService = new QuestionService();

