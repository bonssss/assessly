import prisma from "../../prisma.js";
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

export class ExamService {
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
          const q = questions.find((item) => item.id === qId);
          return {
            examId: exam.id,
            questionId: qId,
            marks: q?.marks ?? 1.0,
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
            const q = questions.find((item) => item.id === qId);
            return {
              examId: id,
              questionId: qId,
              marks: q?.marks ?? 1.0,
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
          department: { select: { id: true, name: true, code: true } },
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
      exams: exams.map((e) => ({
        id: e.id,
        title: e.title,
        instructions: e.instructions,
        durationMinutes: e.durationMinutes,
        questionCount: e._count.questions,
        feedbackPolicy: e.feedbackPolicy,
        department: e.department,
        createdAt: e.createdAt,
      })),
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
          department: { select: { id: true, name: true, code: true } },
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
      exams: exams.map((e) => ({
        id: e.id,
        title: e.title,
        instructions: e.instructions,
        durationMinutes: e.durationMinutes,
        questionCount: e._count.questions,
        attemptsCount: e._count.attempts,
        feedbackPolicy: e.feedbackPolicy,
        status: e.status,
        department: e.department,
        createdAt: e.createdAt,
      })),
    };
  }

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
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
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
        await prisma.studentAnswer.createMany({
          data: selectedQuestions.map((q) => ({
            attemptId: attempt.id,
            questionId: q.id,
            selectedOptionId: null,
            isCorrect: false,
            awardedMarks: 0,
          })),
        });
      }
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
   * Student: Submit complete exam attempt for server-side scoring (FR-EXAM-07..09, AC-10)
   */
  async submitExamAttempt(
    userId: string,
    attemptId: string,
    data: SubmitExamAttemptInput
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                question: {
                  include: { options: true },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundError("Exam attempt record not found");
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenError("You are not authorized to submit this exam attempt");
    }

    // Prevent double submission (FR-EXAM-12)
    if (attempt.status !== "IN_PROGRESS") {
      throw new ConflictError(
        `Exam attempt has already been submitted or completed (Status: ${attempt.status})`
      );
    }

    const exam = attempt.exam;
    if (!exam) {
      throw new NotFoundError("Associated exam configuration not found");
    }

    const now = new Date();
    let isTimedOut = false;

    // Server-Side Timer Enforcement with 30-second grace buffer for network latency (FR-EXAM-08)
    if (attempt.deadlineAt) {
      const gracePeriodMs = 30 * 1000;
      if (now.getTime() > new Date(attempt.deadlineAt).getTime() + gracePeriodMs) {
        isTimedOut = true;
      }
    }

    // 1. Grade the student's submission on the server using stored answer keys (FR-EXAM-07)
    let questionsToGrade: Array<{
      id: string;
      marks: number;
      body: string;
      explanation: string | null;
      options: any[];
    }> = [];

    const attemptAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId: attempt.id },
      include: {
        question: {
          include: { options: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });

    if (attemptAnswers.length > 0) {
      questionsToGrade = attemptAnswers.map((a) => ({
        id: a.question.id,
        marks: Number(a.question.marks || 1),
        body: a.question.body,
        explanation: a.question.explanation,
        options: a.question.options,
      }));
    } else if (exam.questions && exam.questions.length > 0) {
      questionsToGrade = exam.questions.map((eq) => ({
        id: eq.question.id,
        marks: Number(eq.marks || 1),
        body: eq.question.body,
        explanation: eq.question.explanation,
        options: eq.question.options,
      }));
    }

    let totalScore = 0;
    let maxPossibleScore = 0;

    const answersToPersist: Array<{
      attemptId: string;
      questionId: string;
      selectedOptionId: string | null;
      isCorrect: boolean;
      awardedMarks: number;
    }> = [];

    const reviewQuestions: Array<any> = [];

    for (const q of questionsToGrade) {
      const questionMarks = Number(q.marks);
      maxPossibleScore += questionMarks;

      const studentAnswer = data.answers.find((a) => a.questionId === q.id);
      const selectedOptionId = studentAnswer?.selectedOptionId ?? null;

      const correctOption = q.options.find((opt: any) => opt.isCorrect);
      const isCorrect = Boolean(
        selectedOptionId && correctOption && selectedOptionId === correctOption.id
      );

      const awardedMarks = isCorrect ? questionMarks : 0;
      totalScore += awardedMarks;

      answersToPersist.push({
        attemptId: attempt.id,
        questionId: q.id,
        selectedOptionId,
        isCorrect,
        awardedMarks,
      });

      // Prepare feedback data including explanation for each question
      reviewQuestions.push({
        questionId: q.id,
        body: q.body,
        selectedOptionId,
        correctOptionId: correctOption?.id ?? null,
        isCorrect,
        awardedMarks,
        maxMarks: questionMarks,
        explanation: q.explanation,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
      });
    }

    const finalStatus = isTimedOut ? "TIMED_OUT" : "COMPLETED";

    // 2. Persist answers & update attempt in a single database transaction (FR-EXAM-09)
    await prisma.$transaction(async (tx) => {
      // Clean any partial records if retrying
      await tx.studentAnswer.deleteMany({
        where: { attemptId: attempt.id },
      });

      await tx.studentAnswer.createMany({
        data: answersToPersist,
      });

      await tx.examAttempt.update({
        where: { id: attempt.id },
        data: {
          submittedAt: now,
          score: totalScore,
          status: finalStatus,
        },
      });
    });

    const percentage =
      maxPossibleScore > 0
        ? Math.round((totalScore / maxPossibleScore) * 100 * 10) / 10
        : 0;

    // 3. Apply exam Feedback Policy (FR-EXAM-11)
    const showReview =
      exam.feedbackPolicy === "IMMEDIATE" ||
      exam.feedbackPolicy === "AFTER_SUBMISSION";

    return {
      attemptId: attempt.id,
      examId: exam.id,
      title: exam.title,
      status: finalStatus,
      score: totalScore,
      obtainedMarks: totalScore,
      totalMarks: maxPossibleScore,
      maxPossibleScore,
      totalQuestions: questionsToGrade.length,
      correctAnswers: reviewQuestions.filter((r) => r.isCorrect).length,
      percentage,
      submittedAt: now,
      feedbackPolicy: exam.feedbackPolicy,
      review: showReview ? reviewQuestions : null,
      results: showReview ? reviewQuestions : null,
    };
  }

  /**
   * View attempt results & review
   */
  async getAttemptResults(userId: string, userRole: string, attemptId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                question: {
                  include: { options: true },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && attempt.userId !== userId) {
      throw new ForbiddenError("You are not authorized to view this attempt result");
    }

    const exam = attempt.exam;
    let maxPossibleScore = 0;
    const review: any[] = [];

    const attemptAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId: attempt.id },
      include: {
        question: {
          include: { options: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });

    let questionsToReview: Array<{
      question: any;
      maxMarks: number;
      selectedOptionId: string | null;
      awardedMarks: number;
      isCorrect: boolean;
    }> = [];

    if (attemptAnswers.length > 0) {
      questionsToReview = attemptAnswers.map((a) => ({
        question: a.question,
        maxMarks: Number(a.question.marks || 1),
        selectedOptionId: a.selectedOptionId,
        awardedMarks: Number(a.awardedMarks || 0),
        isCorrect: a.isCorrect,
      }));
    } else if (exam?.questions) {
      questionsToReview = exam.questions.map((eq) => {
        const ans = attempt.answers.find((a) => a.questionId === eq.question.id);
        return {
          question: eq.question,
          maxMarks: Number(eq.marks || 1),
          selectedOptionId: ans?.selectedOptionId ?? null,
          awardedMarks: ans ? Number(ans.awardedMarks) : 0,
          isCorrect: ans?.isCorrect ?? false,
        };
      });
    }

    for (const item of questionsToReview) {
      const q = item.question;
      maxPossibleScore += item.maxMarks;
      const correctOption = q.options.find((opt: any) => opt.isCorrect);

      review.push({
        questionId: q.id,
        body: q.body,
        selectedOptionId: item.selectedOptionId,
        correctOptionId: correctOption?.id ?? null,
        isCorrect: item.isCorrect,
        awardedMarks: item.awardedMarks,
        maxMarks: item.maxMarks,
        explanation: q.explanation,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
      });
    }

    const score = Number(attempt.score);
    const percentage =
      maxPossibleScore > 0
        ? Math.round((score / maxPossibleScore) * 100 * 10) / 10
        : 0;

    return {
      attemptId: attempt.id,
      examTitle: exam?.title ?? "Practice Session",
      status: attempt.status,
      score,
      obtainedMarks: score,
      totalMarks: maxPossibleScore,
      maxPossibleScore,
      totalQuestions: questionsToReview.length,
      correctAnswers: review.filter((r) => r.isCorrect).length,
      percentage,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      review,
      results: review,
    };
  }

  /**
   * Student: List previous exam attempts history (FR-EXAM-10)
   */
  async listStudentExamHistory(userId: string) {
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
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return attempts.map((a) => ({
      attemptId: a.id,
      examId: a.examId,
      examTitle: a.exam?.title ?? "Exam",
      department: a.exam?.department,
      score: Number(a.score),
      status: a.status,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    }));
  }
}

export const examService = new ExamService();

