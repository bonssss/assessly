import prisma from "../../prisma.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  PaywallError,
} from "../../common/errors/app-error.js";
import type { SubmitAnswerInput } from "./question.schema.js";

export class PracticeSessionService {
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

    // 2. Verify student enrollment or admin privileges (BR-13)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    if (!isAdmin) {
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

    // If user has no active paid entitlement and is not admin, enforce free-trial quota
    if (!isAdmin && !activeEntitlement) {
      let trialUsage = await prisma.trialUsage.findUnique({
        where: { userId },
      });

      if (!trialUsage) {
        trialUsage = await prisma.trialUsage.create({
          data: {
            userId,
            usedCount: 0,
            quotaLimit: 5,
          },
        });
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
      score: awardedMarks,
      selectedOptionId: selectedOption.id,
      correctOptionId: correctOption?.id ?? null,
      explanation: question.explanation,
      trialRemaining,
      quotaRemaining: trialRemaining ?? 999,
      hasActiveEntitlement: Boolean(activeEntitlement),
      hasActiveSubscription: Boolean(activeEntitlement),
    };
  }
}

export const practiceSessionService = new PracticeSessionService();
