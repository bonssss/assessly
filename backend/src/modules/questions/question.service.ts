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
} from "./question.schema.js";

export class QuestionService {
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
        skip,
        take: limit,
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
   * Student: Submit practice answer, verify trial quota / entitlement, score, and return feedback.
   */
  async submitPracticeAnswer(
    userId: string,
    questionId: string,
    input: SubmitAnswerInput
  ) {
    const { selectedOptionId } = input;

    // 1. Fetch question with options
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.status !== "PUBLISHED") {
      throw new BadRequestError("Question is not currently published for practice");
    }

    // 2. Verify student enrollment in this question's department (BR-13)
    const enrollment = await prisma.userDepartment.findUnique({
      where: {
        userId_departmentId: {
          userId,
          departmentId: question.departmentId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      throw new ForbiddenError("You are not enrolled in this department");
    }

    // 3. Verify selected option belongs to question
    const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
    if (!selectedOption) {
      throw new BadRequestError("Invalid option selected for this question");
    }

    // 4. Access Control & Trial Quota Verification (BR-04, BR-05, BR-06, FR-ACCESS)
    const now = new Date();
    const activeEntitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [
          { departmentId: question.departmentId },
          { departmentId: null }, // covers all departments
        ],
        AND: [
          { startsAt: { lte: now } },
          {
            OR: [
              { expiresAt: null }, // Permanent access
              { expiresAt: { gt: now } }, // Time-limited access
            ],
          },
        ],
      },
    });

    let trialRemaining: number | null = null;

    // If user has no active paid entitlement, enforce free-trial quota
    if (!activeEntitlement) {
      const trialUsage = await prisma.trialUsage.findUnique({
        where: { userId },
      });

      if (!trialUsage) {
        throw new NotFoundError("Trial usage ledger not found for user");
      }

      if (trialUsage.usedCount >= trialUsage.quotaLimit) {
        throw new PaywallError(
          "Free trial quota exhausted (5/5 attempts used). Please subscribe to continue."
        );
      }

      // Atomically consume 1 trial attempt
      const updatedTrial = await prisma.trialUsage.update({
        where: { userId },
        data: {
          usedCount: { increment: 1 },
        },
      });

      trialRemaining = Math.max(0, updatedTrial.quotaLimit - updatedTrial.usedCount);
    }

    // 5. Server-side scoring (FR-EXAM-07)
    const isCorrect = selectedOption.isCorrect;
    const marksValue = Number(question.marks);
    const awardedMarks = isCorrect ? marksValue : 0;

    const correctOption = question.options.find((opt) => opt.isCorrect);

    // 6. Record attempt & answer history (FR-EXAM-09)
    await prisma.$transaction(async (tx) => {
      const attempt = await tx.examAttempt.create({
        data: {
          userId,
          startedAt: now,
          submittedAt: now,
          status: "COMPLETED",
          score: awardedMarks,
        },
      });

      await tx.studentAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          selectedOptionId: selectedOption.id,
          isCorrect,
          awardedMarks,
        },
      });
    });

    // 7. Return feedback according to policy (FR-EXAM-06)
    return {
      isCorrect,
      awardedMarks,
      totalMarks: marksValue,
      selectedOptionId: selectedOption.id,
      correctOptionId: correctOption?.id ?? null,
      explanation: question.explanation,
      trialRemaining,
      hasActiveEntitlement: Boolean(activeEntitlement),
    };
  }
}

export const questionService = new QuestionService();

