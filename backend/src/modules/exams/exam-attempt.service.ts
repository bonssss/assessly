import prisma from "../../prisma.js";
import { AttemptStatus } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  PaywallError,
} from "../../common/errors/app-error.js";

export class ExamAttemptService {
  /**
   * Student: Start a timed exam attempt (FR-EXAM-08, AC-09, AC-10)
   * Calculates and locks server-side deadlineAt. Returns sanitized questions.
   */
  async startExamAttempt(userId: string, examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
          orderBy: { sequence: "asc" },
        },
      },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    if (exam.status !== "PUBLISHED") {
      throw new BadRequestError("Exam is not currently published");
    }

    // 1. Verify student is enrolled in the exam's department
    const enrollment = await prisma.userDepartment.findUnique({
      where: {
        userId_departmentId: {
          userId,
          departmentId: exam.departmentId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      throw new ForbiddenError("You are not enrolled in this department");
    }

    const now = new Date();

    // 2. Check for an active IN_PROGRESS attempt that hasn't expired yet
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId,
        examId,
        status: "IN_PROGRESS",
        deadlineAt: { gt: now },
      },
    });

    // 3. Entitlement & access check (if not resuming an ongoing attempt)
    if (!existingAttempt) {
      const activeEntitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          OR: [{ departmentId: exam.departmentId }, { departmentId: null }],
          AND: [
            { startsAt: { lte: now } },
            { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          ],
        },
      });

      if (!activeEntitlement) {
        // Check free trial quota
        const trial = await prisma.trialUsage.findUnique({ where: { userId } });
        if (!trial || trial.usedCount >= trial.quotaLimit) {
          throw new PaywallError(
            "Free trial quota exhausted. An active package entitlement is required to take exams."
          );
        }
      }
    }

    // Determine attempt
    let attempt = existingAttempt;
    let selectedQuestions: Array<{
      id: string;
      body: string;
      difficulty: any;
      marks: number;
      options: any[];
    }> = [];

    if (existingAttempt) {
      // Reload questions already assigned to this in-progress attempt
      const existingAnswers = await prisma.studentAnswer.findMany({
        where: { attemptId: existingAttempt.id },
        include: {
          question: {
            include: {
              options: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      });

      if (existingAnswers.length > 0) {
        selectedQuestions = existingAnswers.map((a) => ({
          id: a.question.id,
          body: a.question.body,
          difficulty: a.question.difficulty,
          marks: Number(a.question.marks || 1),
          options: a.question.options,
        }));
      }
    }

    if (!attempt || selectedQuestions.length === 0) {
      // 1. Gather question pool from directly linked exam questions
      const linkedQuestions = exam.questions.map((eq) => ({
        id: eq.question.id,
        body: eq.question.body,
        difficulty: eq.question.difficulty,
        marks: Number(eq.marks || eq.question.marks || 1),
        options: eq.question.options,
      }));

      // 2. Also gather published questions from the department / subject bank
      const bankQuestions = await prisma.question.findMany({
        where: {
          departmentId: exam.departmentId,
          status: "PUBLISHED",
        },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      });

      // Merge into a deduplicated pool
      const poolMap = new Map<string, any>();
      for (const q of linkedQuestions) poolMap.set(q.id, q);
      for (const q of bankQuestions) {
        if (!poolMap.has(q.id)) {
          poolMap.set(q.id, {
            id: q.id,
            body: q.body,
            difficulty: q.difficulty,
            marks: Number(q.marks || 1),
            options: q.options,
          });
        }
      }

      const pool = Array.from(poolMap.values());

      // Randomize selection using Fisher-Yates shuffle
      for (let poolIdx = pool.length - 1; poolIdx > 0; poolIdx--) {
        const swapIdx = Math.floor(Math.random() * (poolIdx + 1));
        [pool[poolIdx], pool[swapIdx]] = [pool[swapIdx], pool[poolIdx]];
      }

      // Randomly select up to 60 questions from bank (or all if <= 60)
      const count = Math.min(60, pool.length);
      selectedQuestions = pool.slice(0, count);

      if (!attempt) {
        const deadlineAt = new Date(now.getTime() + exam.durationMinutes * 60 * 1000);
        attempt = await prisma.examAttempt.create({
          data: {
            userId,
            examId: exam.id,
            startedAt: now,
            deadlineAt,
            status: "IN_PROGRESS",
            score: 0.0,
            answers: {
              create: selectedQuestions.map((q) => ({
                questionId: q.id,
                selectedOptionId: null,
                isCorrect: false,
                awardedMarks: 0,
              })),
            },
          },
        });
      } else {
        const activeAttempt: typeof attempt = attempt;
        await prisma.studentAnswer.createMany({
          data: selectedQuestions.map((q) => ({
            attemptId: activeAttempt.id,
            questionId: q.id,
            selectedOptionId: null,
            isCorrect: false,
            awardedMarks: 0,
          })),
        });
      }
    }

    if (!attempt) {
      throw new BadRequestError("Failed to initialize exam attempt");
    }

    const deadlineTime = attempt.deadlineAt ? new Date(attempt.deadlineAt).getTime() : 0;
    const remainingSeconds = Math.max(0, Math.floor((deadlineTime - now.getTime()) / 1000));

    // 4. SANITIZE QUESTIONS: Strip correct answer keys and explanations before submission (AC-09)
    const sanitizedQuestions = selectedQuestions.map((q, index) => ({
      sequence: index + 1,
      marks: q.marks,
      question: {
        id: q.id,
        body: q.body,
        difficulty: q.difficulty,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          optionText: opt.optionText,
          sortOrder: opt.sortOrder,
        })),
      },
    }));

    return {
      attemptId: attempt.id,
      examId: exam.id,
      examTitle: exam.title,
      title: exam.title,
      instructions: exam.instructions,
      durationMinutes: exam.durationMinutes,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      remainingSeconds,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Background Worker / Auto-Timeout: Automatically close and grade attempts whose deadline has passed (FR-EXAM-08)
   */
  async closeExpiredAttempts(): Promise<number> {
    const graceBufferMs = 30 * 1000;
    const threshold = new Date(Date.now() - graceBufferMs);

    const expiredAttempts = await prisma.examAttempt.findMany({
      where: {
        status: AttemptStatus.IN_PROGRESS,
        deadlineAt: { lt: threshold },
      },
      include: {
        answers: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (expiredAttempts.length === 0) return 0;

    for (const attempt of expiredAttempts) {
      let totalScore = 0;
      for (const ans of attempt.answers) {
        if (ans.selectedOptionId && ans.question) {
          const correctOption = ans.question.options.find((opt) => opt.isCorrect);
          const isCorrect = Boolean(correctOption && ans.selectedOptionId === correctOption.id);
          const questionMarks = Number(ans.question.marks || 1);
          const awardedMarks = isCorrect ? questionMarks : 0;
          totalScore += awardedMarks;

          await prisma.studentAnswer.update({
            where: { id: ans.id },
            data: { isCorrect, awardedMarks },
          });
        }
      }

      await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          status: AttemptStatus.TIMED_OUT,
          submittedAt: attempt.deadlineAt || new Date(),
          score: totalScore,
        },
      });
    }

    return expiredAttempts.length;
  }
}

