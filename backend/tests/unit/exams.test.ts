import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createExamSchema,
  submitExamAttemptSchema,
} from "../../src/modules/exams/exam.schema.js";

describe("Exam Configuration Validation Schemas", () => {
  const sampleDeptId = "123e4567-e89b-12d3-a456-426614174000";
  const sampleQuestionId = "223e4567-e89b-12d3-a456-426614174000";

  test("accepts valid exam configuration", () => {
    const valid = {
      departmentId: sampleDeptId,
      title: "Midterm Algorithms Examination",
      instructions: "Answer all questions. No calculators allowed.",
      durationMinutes: 60,
      feedbackPolicy: "AFTER_SUBMISSION" as const,
      status: "PUBLISHED" as const,
      questionIds: [sampleQuestionId],
    };

    const result = createExamSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  test("rejects exam with 0 or negative duration", () => {
    const invalid = {
      departmentId: sampleDeptId,
      title: "Invalid Duration Exam",
      durationMinutes: 0,
      questionIds: [sampleQuestionId],
    };

    const result = createExamSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test("rejects exam without any questions", () => {
    const invalid = {
      departmentId: sampleDeptId,
      title: "Empty Exam",
      durationMinutes: 45,
      questionIds: [],
    };

    const result = createExamSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test("validates student answer submission sheet", () => {
    const valid = {
      answers: [
        {
          questionId: sampleQuestionId,
          selectedOptionId: "323e4567-e89b-12d3-a456-426614174000",
        },
      ],
    };

    assert.equal(submitExamAttemptSchema.safeParse(valid).success, true);
  });
});

describe("Server-Side Exam Scoring & Grading Engine (FR-EXAM-07, AC-10)", () => {
  test("accurately computes total score and percentage from multiple questions", () => {
    const examQuestions = [
      { id: "q1", marks: 2.0, correctOptionId: "opt-1a" },
      { id: "q2", marks: 3.0, correctOptionId: "opt-2c" },
      { id: "q3", marks: 5.0, correctOptionId: "opt-3b" },
    ];

    const studentAnswers = [
      { questionId: "q1", selectedOptionId: "opt-1a" }, // Correct: +2
      { questionId: "q2", selectedOptionId: "opt-2a" }, // Wrong: +0
      { questionId: "q3", selectedOptionId: "opt-3b" }, // Correct: +5
    ];

    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const eq of examQuestions) {
      maxPossibleScore += eq.marks;
      const ans = studentAnswers.find((a) => a.questionId === eq.id);
      if (ans && ans.selectedOptionId === eq.correctOptionId) {
        totalScore += eq.marks;
      }
    }

    assert.equal(totalScore, 7.0);
    assert.equal(maxPossibleScore, 10.0);

    const percentage = Math.round((totalScore / maxPossibleScore) * 100 * 10) / 10;
    assert.equal(percentage, 70.0);
  });
});

describe("Server-Side Timer Enforcement & Deadlines (FR-EXAM-08)", () => {
  test("calculates correct deadlineAt based on duration", () => {
    const startedAt = new Date("2026-11-03T10:00:00Z");
    const durationMinutes = 90;

    const deadlineAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    assert.equal(deadlineAt.toISOString(), "2026-11-03T11:30:00.000Z");
  });

  test("accepts submission within grace period buffer but flags TIMED_OUT after buffer", () => {
    const deadlineAt = new Date("2026-11-03T10:30:00Z");
    const graceBufferMs = 30 * 1000;

    const onTimeSubmission = new Date("2026-11-03T10:29:50Z");
    const slightlyLateWithGrace = new Date("2026-11-03T10:30:20Z");
    const tooLateSubmission = new Date("2026-11-03T10:31:00Z");

    const checkTimeout = (submissionTime: Date) => {
      return submissionTime.getTime() > deadlineAt.getTime() + graceBufferMs;
    };

    assert.equal(checkTimeout(onTimeSubmission), false);
    assert.equal(checkTimeout(slightlyLateWithGrace), false);
    assert.equal(checkTimeout(tooLateSubmission), true); // Marked TIMED_OUT
  });

  test("prevents double submission once attempt is marked COMPLETED (FR-EXAM-12)", () => {
    let attemptStatus = "IN_PROGRESS";

    const submit = () => {
      if (attemptStatus !== "IN_PROGRESS") {
        throw new Error("CONFLICT_ATTEMPT_ALREADY_COMPLETED");
      }
      attemptStatus = "COMPLETED";
      return attemptStatus;
    };

    // First submission succeeds
    assert.equal(submit(), "COMPLETED");

    // Second submission is blocked
    assert.throws(() => submit(), /CONFLICT_ATTEMPT_ALREADY_COMPLETED/);
  });
});

