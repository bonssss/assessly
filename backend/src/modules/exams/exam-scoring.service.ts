import prisma from "../../prisma.js";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../../common/errors/app-error.js";
import type { SubmitExamAttemptInput } from "./exam.schema.js";

export class ExamScoringService {
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
      const currentQuestion = item.question;
      maxPossibleScore += item.maxMarks;
      const correctOption = currentQuestion.options.find((opt: any) => opt.isCorrect);

      review.push({
        questionId: currentQuestion.id,
        body: currentQuestion.body,
        selectedOptionId: item.selectedOptionId,
        correctOptionId: correctOption?.id ?? null,
        isCorrect: item.isCorrect,
        awardedMarks: item.awardedMarks,
        maxMarks: item.maxMarks,
        explanation: currentQuestion.explanation,
        options: currentQuestion.options.map((opt: any) => ({
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
}
