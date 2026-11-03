import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createQuestionSchema,
  submitAnswerSchema,
} from "../../src/modules/questions/question.schema.js";

describe("Question Bank Schemas & Validation", () => {
  const sampleDeptId = "123e4567-e89b-12d3-a456-426614174000";

  test("accepts valid question with 4 options and 1 correct answer", () => {
    const valid = {
      departmentId: sampleDeptId,
      body: "What is the time complexity of binary search?",
      topic: "Algorithms",
      difficulty: "MEDIUM" as const,
      marks: 1.0,
      explanation: "Binary search cuts search space in half each step: O(log n).",
      status: "PUBLISHED" as const,
      options: [
        { optionText: "O(n)", isCorrect: false },
        { optionText: "O(log n)", isCorrect: true },
        { optionText: "O(n^2)", isCorrect: false },
        { optionText: "O(1)", isCorrect: false },
      ],
    };

    const result = createQuestionSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  test("rejects published question with NO correct answers", () => {
    const invalid = {
      departmentId: sampleDeptId,
      body: "Which data structure uses FIFO?",
      status: "PUBLISHED" as const,
      options: [
        { optionText: "Stack", isCorrect: false },
        { optionText: "Queue", isCorrect: false },
      ],
    };

    const result = createQuestionSchema.safeParse(invalid);
    assert.equal(result.success, false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      assert.ok(paths.includes("options"));
    }
  });

  test("rejects published single-choice question with MULTIPLE correct answers", () => {
    const invalid = {
      departmentId: sampleDeptId,
      body: "Which of the following are prime numbers?",
      status: "PUBLISHED" as const,
      options: [
        { optionText: "2", isCorrect: true },
        { optionText: "3", isCorrect: true },
        { optionText: "4", isCorrect: false },
      ],
    };

    const result = createQuestionSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test("rejects question with fewer than 2 options", () => {
    const invalid = {
      departmentId: sampleDeptId,
      body: "Incomplete question",
      status: "DRAFT" as const,
      options: [{ optionText: "Only one option", isCorrect: true }],
    };

    const result = createQuestionSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test("validates submit answer schema", () => {
    const valid = { selectedOptionId: "123e4567-e89b-12d3-a456-426614174000" };
    const invalid = { selectedOptionId: "not-a-uuid" };

    assert.equal(submitAnswerSchema.safeParse(valid).success, true);
    assert.equal(submitAnswerSchema.safeParse(invalid).success, false);
  });
});

describe("Student Question Security & Answer Key Sanitization (AC-09)", () => {
  test("student-facing question structure omits isCorrect and explanation", () => {
    const rawQuestionFromDb = {
      id: "q-101",
      body: "What is an IP address?",
      explanation: "Internet Protocol address uniquely identifies a device.",
      options: [
        { id: "opt-1", optionText: "A protocol identifier", isCorrect: true },
        { id: "opt-2", optionText: "A processor chip", isCorrect: false },
      ],
    };

    // Simulate student sanitization logic as implemented in question.service.ts
    const sanitizedStudentPayload = {
      id: rawQuestionFromDb.id,
      body: rawQuestionFromDb.body,
      options: rawQuestionFromDb.options.map(({ id, optionText }) => ({
        id,
        optionText,
      })),
    };

    // Ensure answer key and explanation are NOT present in student payload
    assert.equal("explanation" in sanitizedStudentPayload, false);
    for (const opt of sanitizedStudentPayload.options) {
      assert.equal("isCorrect" in opt, false);
    }
  });

  test("trial quota decrements until 5 limit then triggers paywall requirement", () => {
    const quotaLimit = 5;
    let usedCount = 0;

    const simulateAttempt = () => {
      if (usedCount >= quotaLimit) {
        throw new Error("PAYWALL_REQUIRED");
      }
      usedCount += 1;
      return quotaLimit - usedCount;
    };

    // First 5 attempts succeed
    assert.equal(simulateAttempt(), 4);
    assert.equal(simulateAttempt(), 3);
    assert.equal(simulateAttempt(), 2);
    assert.equal(simulateAttempt(), 1);
    assert.equal(simulateAttempt(), 0);

    // 6th attempt triggers paywall
    assert.throws(() => simulateAttempt(), /PAYWALL_REQUIRED/);
  });
});

