
import prisma from "../../prisma.js";
import { AttemptStatus } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  PaywallError,
} from "../../common/errors/app-error.js";
import type {
  CreateExamInput,
  UpdateExamInput,
  SubmitExamAttemptInput,
  ListExamsQuery,
} from "./exam.schema.js";

import { ExamAttemptService } from "./exam-attempt.service.js";
import { ExamScoringService } from "./exam-scoring.service.js";

export class ExamService {
  constructor(
    private readonly attemptService = new ExamAttemptService(),
    private readonly scoringService = new ExamScoringService()
  ) {}

  /**
   * Admin: Create a timed exam and link questions
   */
  async createExam(data: CreateExamInput) {
    const { departmentId, title, instructions, durationMinutes, feedbackPolicy, status, questionIds } = data;

    // 1. Verify department exists
    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!dept) {
      throw new NotFoundError("Department not found");
    }

    // 2. Validate all questions exist and belong to this department
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        departmentId,
      },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestError(
        "One or more selected questions do not exist or belong to a different department"
      );
    }

    // 3. Create exam and question associations atomically
    return prisma.$transaction(async (tx) => {
      const exam = await tx.exam.create({
        data: {
          departmentId,
          title,
          instructions,
          durationMinutes,
          feedbackPolicy,
          status,
        },
      });

      await tx.examQuestion.createMany({
        data: questionIds.map((qId, index) => {
          const matchedQuestion = questions.find((item) => item.id === qId);
          return {
            examId: exam.id,
            questionId: qId,
            marks: matchedQuestion?.marks ?? 1.0,
            sequence: index + 1,
          };
        }),
      });

      return tx.exam.findUnique({
        where: { id: exam.id },
        include: {
          department: { select: { id: true, name: true, code: true } },
          questions: {
            include: {
              question: {
                select: { id: true, body: true, difficulty: true, marks: true },
              },
            },
            orderBy: { sequence: "asc" },
          },
        },
      });
    });
  }

  /**
   * Admin: Update exam details
   */
  async updateExam(id: string, data: UpdateExamInput) {
    const exam = await prisma.exam.findUnique({
      where: { id },
    });
    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    const { questionIds, ...fields } = data;

    return prisma.$transaction(async (tx) => {
      if (questionIds) {
        // Remove existing associations and re-link
        await tx.examQuestion.deleteMany({
          where: { examId: id },
        });

        const questions = await tx.question.findMany({
          where: { id: { in: questionIds } },
        });

        await tx.examQuestion.createMany({
          data: questionIds.map((qId, index) => {
            const matchedQuestion = questions.find((item) => item.id === qId);
            return {
              examId: id,
              questionId: qId,
              marks: matchedQuestion?.marks ?? 1.0,
              sequence: index + 1,
            };
          }),
        });
      }

      return tx.exam.update({
        where: { id },
        data: fields,
        include: {
          department: { select: { id: true, name: true, code: true } },
          questions: {
            include: {
              question: {
                select: { id: true, body: true, difficulty: true, marks: true },
              },
            },
            orderBy: { sequence: "asc" },
          },
        },
      });
    });
  }

  /**
   * Admin: Delete an exam
   */
  async deleteExam(id: string) {
    const exam = await prisma.exam.findUnique({
      where: { id },
    });
    if (!exam) {
      throw new NotFoundError("Exam not found");
    }
    return prisma.exam.delete({
      where: { id },
    });
  }

  /**
   * List exams for student (filtered by enrolled departments and PUBLISHED status)
   */
  async listExamsForStudent(userId: string, query: ListExamsQuery) {
    const { departmentId, page, limit } = query;
    const skip = (page - 1) * limit;

    const enrollments = await prisma.userDepartment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { departmentId: true },
    });

    const enrolledDeptIds = enrollments.map((e) => e.departmentId);

    if (enrolledDeptIds.length === 0) {
      return { total: 0, page, limit, totalPages: 0, exams: [] };
    }

    if (departmentId && !enrolledDeptIds.includes(departmentId)) {
      throw new ForbiddenError("You are not enrolled in this department");
    }

    const where: any = {
      status: "PUBLISHED",
      departmentId: departmentId ? departmentId : { in: enrolledDeptIds },
    };

    const [total, exams] = await Promise.all([
      prisma.exam.count({ where }),
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          instructions: true,
          durationMinutes: true,
          feedbackPolicy: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
              _count: { select: { questions: true } },
            },
          },
          _count: { select: { questions: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      exams: exams.map((e) => {
        const bankCount = e.department?._count?.questions ?? 0;
        const linkedCount = e._count.questions;
        const questionCount = Math.max(linkedCount, bankCount);
        return {
          id: e.id,
          title: e.title,
          instructions: e.instructions,
          durationMinutes: e.durationMinutes,
          questionCount,
          linkedQuestionCount: linkedCount,
          bankQuestionCount: bankCount,
          feedbackPolicy: e.feedbackPolicy,
          department: e.department,
          createdAt: e.createdAt,
        };
      }),
    };
  }

  /**
   * List exams for admin
   */
  async listExamsForAdmin(query: ListExamsQuery) {
    const { departmentId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const [total, exams] = await Promise.all([
      prisma.exam.count({ where }),
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
              _count: { select: { questions: true } },
            },
          },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      exams: exams.map((e) => {
        const bankCount = e.department?._count?.questions ?? 0;
        const linkedCount = e._count.questions;
        const questionCount = Math.max(linkedCount, bankCount);
        return {
          id: e.id,
          title: e.title,
          instructions: e.instructions,
          durationMinutes: e.durationMinutes,
          questionCount,
          linkedQuestionCount: linkedCount,
          bankQuestionCount: bankCount,
          questionsCount: questionCount,
          questions: Array.from({ length: questionCount }),
          attemptsCount: e._count.attempts,
          feedbackPolicy: e.feedbackPolicy,
          status: e.status,
          department: e.department,
          createdAt: e.createdAt,
        };
      }),
    };
  }

  /**
   * Student: Start a timed exam attempt (FR-EXAM-08, AC-09, AC-10)
   */
  async startExamAttempt(userId: string, examId: string) {
    return this.attemptService.startExamAttempt(userId, examId);
  }

  /**
   * Student: Submit complete exam attempt for server-side scoring (FR-EXAM-07..09, AC-10)
   */
  async submitExamAttempt(
    userId: string,
    attemptId: string,
    data: SubmitExamAttemptInput
  ) {
    return this.scoringService.submitExamAttempt(userId, attemptId, data);
  }

  /**
   * View attempt results & review
   */
  async getAttemptResults(userId: string, userRole: string, attemptId: string) {
    return this.scoringService.getAttemptResults(userId, userRole, attemptId);
  }

  /**
   * Background Worker / Auto-Timeout: Automatically close and grade attempts whose deadline has passed (FR-EXAM-08)
   */
  async closeExpiredAttempts(): Promise<number> {
    return this.attemptService.closeExpiredAttempts();
  }

  /**
   * Student: List previous exam attempts history (FR-EXAM-10)
   */
  async listStudentExamHistory(userId: string) {
    // Automatically close any expired in-progress attempts first
    await this.closeExpiredAttempts().catch(() => {});

    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId,
        examId: { not: null }, // Only configured exams
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            department: { select: { id: true, name: true, code: true } },
            questions: { select: { marks: true } },
          },
        },
        answers: {
          select: {
            isCorrect: true,
            awardedMarks: true,
            question: { select: { marks: true } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return attempts.map((a) => {
      let maxPossibleMarks = 0;
      if (a.answers && a.answers.length > 0) {
        maxPossibleMarks = a.answers.reduce(
          (sum, ans) => sum + Number(ans.question?.marks || 1),
          0
        );
      } else if (a.exam?.questions && a.exam.questions.length > 0) {
        maxPossibleMarks = a.exam.questions.reduce(
          (sum, q) => sum + Number(q.marks || 1),
          0
        );
      } else {
        maxPossibleMarks = 100;
      }

      const score = Number(a.score || 0);
      const percentage =
        a.status === "COMPLETED" || a.status === "TIMED_OUT"
          ? maxPossibleMarks > 0
            ? Math.round((score / maxPossibleMarks) * 100 * 10) / 10
            : 0
          : null;

      return {
        id: a.id,
        attemptId: a.id,
        examId: a.examId,
        examTitle: a.exam?.title ?? "Exam",
        exam: a.exam
          ? {
              id: a.exam.id,
              title: a.exam.title,
              department: a.exam.department,
            }
          : undefined,
        department: a.exam?.department,
        score,
        obtainedMarks: score,
        totalMarks: maxPossibleMarks,
        maxPossibleScore: maxPossibleMarks,
        percentage,
        status: a.status,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
      };
    });
  }
}

export const examService = new ExamService();

