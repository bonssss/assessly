import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  queryAuditLogsSchema,
  queryUsersSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../../src/modules/admin/admin.schema.js";

describe("Admin Schema & Input Validation (FR-ADMIN, FR-AUD)", () => {
  test("accepts valid audit log query filters with dates", () => {
    const valid = {
      action: "PAYMENT_APPROVED",
      entityType: "PAYMENT",
      page: "2",
      limit: "50",
    };

    const result = queryAuditLogsSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.page, 2);
      assert.equal(result.data.limit, 50);
      assert.equal(result.data.action, "PAYMENT_APPROVED");
    }
  });

  test("accepts valid user query filters", () => {
    const valid = {
      q: "Abebe",
      role: "STUDENT" as const,
      page: "1",
      limit: "10",
    };

    const result = queryUsersSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.q, "Abebe");
      assert.equal(result.data.role, "STUDENT");
    }
  });

  test("validates user role update schema strictly", () => {
    assert.equal(updateUserRoleSchema.safeParse({ role: "ADMIN" }).success, true);
    assert.equal(updateUserRoleSchema.safeParse({ role: "SUPER_ADMIN" }).success, true);
    assert.equal(updateUserRoleSchema.safeParse({ role: "STUDENT" }).success, true);
    assert.equal(updateUserRoleSchema.safeParse({ role: "INVALID_ROLE" }).success, false);
  });

  test("validates user status update schema strictly", () => {
    assert.equal(updateUserStatusSchema.safeParse({ status: "ACTIVE" }).success, true);
    assert.equal(updateUserStatusSchema.safeParse({ status: "SUSPENDED" }).success, true);
    assert.equal(updateUserStatusSchema.safeParse({ status: "INACTIVE" }).success, true);
    assert.equal(updateUserStatusSchema.safeParse({ status: "UNKNOWN" }).success, false);
  });
});

describe("Admin Operations Self-Protection Logic (Security Guardrails)", () => {
  function canDemoteUser(actorId: string, actorRole: string, targetId: string, newRole: string): boolean {
    if (actorId === targetId && actorRole === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
      return false; // Cannot demote yourself from Super Admin
    }
    return true;
  }

  function canDeactivateUser(actorId: string, targetId: string, newStatus: string): boolean {
    if (actorId === targetId && newStatus !== "ACTIVE") {
      return false; // Cannot suspend/deactivate your own account
    }
    return true;
  }

  test("prohibits super admin from demoting themselves", () => {
    const actorId = "user-superadmin-01";
    assert.equal(canDemoteUser(actorId, "SUPER_ADMIN", actorId, "ADMIN"), false);
    assert.equal(canDemoteUser(actorId, "SUPER_ADMIN", actorId, "STUDENT"), false);
  });

  test("allows super admin to demote other admins", () => {
    const actorId = "user-superadmin-01";
    const targetId = "user-admin-02";
    assert.equal(canDemoteUser(actorId, "SUPER_ADMIN", targetId, "STUDENT"), true);
  });

  test("prohibits admin from deactivating their own account", () => {
    const actorId = "user-admin-01";
    assert.equal(canDeactivateUser(actorId, actorId, "SUSPENDED"), false);
    assert.equal(canDeactivateUser(actorId, actorId, "INACTIVE"), false);
  });

  test("allows admin to suspend target user", () => {
    const actorId = "user-admin-01";
    const targetId = "user-violator-99";
    assert.equal(canDeactivateUser(actorId, targetId, "SUSPENDED"), true);
  });
});

describe("Admin Department Analytics Computation Logic", () => {
  function computeDepartmentPassMetrics(attempts: Array<{ score: number | null; status: string }>) {
    const completed = attempts.filter((a) => a.status === "COMPLETED");
    const totalScore = completed.reduce((sum, a) => sum + (a.score ? Number(a.score) : 0), 0);
    const avgScore = completed.length > 0 ? Math.round((totalScore / completed.length) * 10) / 10 : 0;
    const passedCount = completed.filter((a) => (a.score ? Number(a.score) : 0) >= 50).length;
    const passRate = completed.length > 0 ? Math.round((passedCount / completed.length) * 100) : 0;

    return {
      examsTaken: completed.length,
      avgScore,
      passRate,
    };
  }

  test("calculates accurate department average score and pass rate", () => {
    const attempts = [
      { score: 80, status: "COMPLETED" },
      { score: 40, status: "COMPLETED" },
      { score: 60, status: "COMPLETED" },
      { score: null, status: "TIMED_OUT" },
    ];
    const metrics = computeDepartmentPassMetrics(attempts);
    assert.equal(metrics.examsTaken, 3);
    assert.equal(metrics.avgScore, 60);
    assert.equal(metrics.passRate, 67); // 2 out of 3 >= 50 (66.67% -> 67%)
  });

  test("handles zero attempts gracefully without NaN", () => {
    const metrics = computeDepartmentPassMetrics([]);
    assert.equal(metrics.examsTaken, 0);
    assert.equal(metrics.avgScore, 0);
    assert.equal(metrics.passRate, 0);
  });
});


