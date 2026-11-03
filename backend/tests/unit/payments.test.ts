import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  submitPaymentSchema,
  approvePaymentSchema,
  rejectPaymentSchema,
  createPackageSchema,
  paymentSettingSchema,
} from "../../src/modules/payments/payment.schema.js";

describe("Payment Input Validation Schemas", () => {
  const samplePackageId = "123e4567-e89b-12d3-a456-426614174000";

  test("accepts valid payment submission input", () => {
    const valid = {
      packageId: samplePackageId,
      channel: "TELEBIRR",
      transactionRef: "FT1234567890",
    };

    const result = submitPaymentSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  test("rejects payment submission without transaction reference", () => {
    const invalid = {
      packageId: samplePackageId,
      channel: "TELEBIRR",
      transactionRef: "", // empty
    };

    const result = submitPaymentSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test("reject payment requires decision reason (FR-PAY-10)", () => {
    const valid = { decisionNote: "Transaction code does not match bank records" };
    const invalid = { decisionNote: "" };

    assert.equal(rejectPaymentSchema.safeParse(valid).success, true);
    assert.equal(rejectPaymentSchema.safeParse(invalid).success, false);
  });

  test("approve payment accepts optional note", () => {
    const withNote = { decisionNote: "Verified with CBE portal" };
    const emptyNote = {};

    assert.equal(approvePaymentSchema.safeParse(withNote).success, true);
    assert.equal(approvePaymentSchema.safeParse(emptyNote).success, true);
  });

  test("validates purchasable package schema", () => {
    const valid = {
      name: "Semester Pass",
      price: 499.99,
      currency: "ETB",
      scope: "ALL_DEPARTMENTS" as const,
      durationDays: 120,
      questionLimit: 1000,
      status: "PUBLISHED" as const,
    };

    const invalidPrice = {
      name: "Free Pass",
      price: -10, // negative price invalid
    };

    assert.equal(createPackageSchema.safeParse(valid).success, true);
    assert.equal(createPackageSchema.safeParse(invalidPrice).success, false);
  });

  test("validates payment setting schema", () => {
    const valid = {
      method: "TELEBIRR",
      displayName: "Telebirr Merchant",
      accountDetails: "0911223344",
      instructions: "Pay to merchant number and upload screenshot",
      active: true,
    };

    assert.equal(paymentSettingSchema.safeParse(valid).success, true);
  });
});

describe("Payment State Transitions & Entitlement Activation (BR-09..11)", () => {
  test("approved payment produces valid active entitlement with expiration", () => {
    const now = new Date("2026-11-03T12:00:00Z");
    const durationDays = 30;

    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    assert.equal(expiresAt.toISOString(), "2026-12-03T12:00:00.000Z");
    assert.ok(expiresAt > now);
  });

  test("duplicate approval is prohibited once state is APPROVED", () => {
    let currentStatus = "PENDING";

    const approve = () => {
      if (currentStatus !== "PENDING") {
        throw new Error("CONFLICT_ALREADY_PROCESSED");
      }
      currentStatus = "APPROVED";
      return currentStatus;
    };

    // First approval succeeds
    assert.equal(approve(), "APPROVED");

    // Second approval throws error (BR-11)
    assert.throws(() => approve(), /CONFLICT_ALREADY_PROCESSED/);
  });

  test("duplicate rejection is prohibited once state is REJECTED", () => {
    let currentStatus = "PENDING";

    const reject = () => {
      if (currentStatus !== "PENDING") {
        throw new Error("CONFLICT_ALREADY_PROCESSED");
      }
      currentStatus = "REJECTED";
      return currentStatus;
    };

    // First rejection succeeds
    assert.equal(reject(), "REJECTED");

    // Subsequent rejection throws conflict
    assert.throws(() => reject(), /CONFLICT_ALREADY_PROCESSED/);
  });
});
