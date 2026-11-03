import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, comparePassword } from "../../src/common/utils/password.js";
import { signToken, verifyToken } from "../../src/common/utils/jwt.js";
import { registerSchema, loginSchema } from "../../src/modules/auth/auth.schema.js";

describe("Password Utility", () => {
  test("hashes password securely and verifies match", async () => {
    const raw = "SuperSecure123!";
    const hashed = await hashPassword(raw);

    assert.notEqual(raw, hashed);
    assert.ok(hashed.startsWith("$2"));

    const isMatch = await comparePassword(raw, hashed);
    assert.equal(isMatch, true);

    const isWrong = await comparePassword("WrongPassword", hashed);
    assert.equal(isWrong, false);
  });
});

describe("JWT Utility", () => {
  test("generates and verifies valid token", () => {
    const payload = {
      userId: "test-user-id-123",
      email: "student@example.com",
      role: "STUDENT" as const,
    };

    const token = signToken(payload);
    assert.ok(typeof token === "string");
    assert.ok(token.length > 20);

    const decoded = verifyToken(token);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, payload.role);
  });

  test("fails on tampered token", () => {
    const payload = {
      userId: "test-user-id-123",
      email: "student@example.com",
      role: "STUDENT" as const,
    };

    const token = signToken(payload);
    const tampered = token + "xyz";

    assert.throws(() => {
      verifyToken(tampered);
    });
  });
});

describe("Auth Input Validation Schemas", () => {
  test("accepts valid student registration input", () => {
    const valid = {
      fullName: "Abebe Bikila",
      email: "abebe@example.com",
      password: "strongpassword123",
      departmentIds: ["123e4567-e89b-12d3-a456-426614174000"],
    };

    const result = registerSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  test("rejects invalid email and weak password", () => {
    const invalid = {
      fullName: "A",
      email: "not-an-email",
      password: "123", // too short
      departmentIds: [], // empty
    };

    const result = registerSchema.safeParse(invalid);
    assert.equal(result.success, false);
    if (!result.success) {
      const errorPaths = result.error.issues.map((i) => i.path[0]);
      assert.ok(errorPaths.includes("fullName"));
      assert.ok(errorPaths.includes("email"));
      assert.ok(errorPaths.includes("password"));
      assert.ok(errorPaths.includes("departmentIds"));
    }
  });

  test("validates login schema properly", () => {
    const valid = {
      email: "TEST@EXAMPLE.COM",
      password: "anypassword",
    };

    const result = loginSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "test@example.com"); // normalized to lower case
    }
  });
});

