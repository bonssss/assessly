import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createResourceSchema,
  updateResourceSchema,
  queryResourceSchema,
} from "../../src/modules/resources/resource.schema.js";

describe("Learning Resource Validation Schemas (FR-RES)", () => {
  const sampleDeptId = "123e4567-e89b-12d3-a456-426614174000";

  test("accepts valid resource upload metadata", () => {
    const valid = {
      title: "Data Structures & Algorithms Course Syllabus 2026",
      description: "Official course syllabus and lecture notes outline",
      topic: "Algorithms",
      departmentId: sampleDeptId,
      accessLevel: "FREE" as const,
      status: "PUBLISHED" as const,
    };

    const result = createResourceSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  test("rejects resource with missing title or title < 3 characters", () => {
    const invalid = {
      title: "AB",
      departmentId: sampleDeptId,
    };

    const result = createResourceSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test("rejects invalid department UUID format", () => {
    const invalid = {
      title: "Valid Title Here",
      departmentId: "not-a-uuid",
    };

    const result = createResourceSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test("accepts update resource with partial fields", () => {
    const validUpdate = {
      title: "Updated Lecture Slides",
      accessLevel: "PAID" as const,
      status: "ARCHIVED" as const,
    };

    const result = updateResourceSchema.safeParse(validUpdate);
    assert.equal(result.success, true);
  });

  test("populates default query parameters correctly", () => {
    const parsed = queryResourceSchema.parse({});
    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 20);
  });
});

describe("Resource Access Control Logic (FR-RES-03, FR-ACCESS)", () => {
  const deptA = "dept-cs-01";
  const deptB = "dept-med-02";

  function evaluateStudentAccess(
    resource: { departmentId: string; accessLevel: "FREE" | "TRIAL" | "PAID" },
    activeEntitlements: Array<{ departmentId: string | null }>
  ): boolean {
    if (resource.accessLevel === "FREE" || resource.accessLevel === "TRIAL") {
      return true;
    }

    if (resource.accessLevel === "PAID") {
      return activeEntitlements.some(
        (e) => e.departmentId === null || e.departmentId === resource.departmentId
      );
    }

    return false;
  }

  test("FREE and TRIAL resources are accessible to any student", () => {
    const freeRes = { departmentId: deptA, accessLevel: "FREE" as const };
    const trialRes = { departmentId: deptA, accessLevel: "TRIAL" as const };

    assert.equal(evaluateStudentAccess(freeRes, []), true);
    assert.equal(evaluateStudentAccess(trialRes, []), true);
  });

  test("PAID resource is blocked when student has no active entitlement", () => {
    const paidRes = { departmentId: deptA, accessLevel: "PAID" as const };
    assert.equal(evaluateStudentAccess(paidRes, []), false);
  });

  test("PAID resource is accessible when student has department-specific entitlement", () => {
    const paidRes = { departmentId: deptA, accessLevel: "PAID" as const };
    const entitlements = [{ departmentId: deptA }];
    assert.equal(evaluateStudentAccess(paidRes, entitlements), true);
  });

  test("PAID resource for Dept A is blocked when entitlement is only for Dept B", () => {
    const paidRes = { departmentId: deptA, accessLevel: "PAID" as const };
    const entitlements = [{ departmentId: deptB }];
    assert.equal(evaluateStudentAccess(paidRes, entitlements), false);
  });

  test("PAID resource is accessible when student has universal platform-wide entitlement", () => {
    const paidRes = { departmentId: deptA, accessLevel: "PAID" as const };
    const entitlements = [{ departmentId: null }];
    assert.equal(evaluateStudentAccess(paidRes, entitlements), true);
  });
});

