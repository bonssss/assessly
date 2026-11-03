import { z } from "zod";

export const submitPaymentSchema = z.object({
  packageId: z.string().uuid("Invalid package identifier"),
  channel: z
    .string()
    .trim()
    .min(2, "Payment channel must be specified (e.g., Telebirr, CBE)"),
  transactionRef: z
    .string()
    .trim()
    .min(3, "Transaction reference or confirmation code is required"),
});

export const approvePaymentSchema = z.object({
  decisionNote: z.string().trim().max(500).optional(),
});

export const rejectPaymentSchema = z.object({
  decisionNote: z
    .string()
    .trim()
    .min(3, "A rejection reason is required so the student knows why their payment was declined")
    .max(500),
});

export const createPackageSchema = z.object({
  name: z.string().trim().min(2, "Package name is required"),
  price: z.number().positive("Price must be greater than zero"),
  currency: z.string().default("ETB"),
  scope: z.enum(["ALL_DEPARTMENTS", "DEPARTMENT"]).default("DEPARTMENT"),
  durationDays: z.number().int().positive().optional(),
  questionLimit: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const paymentSettingSchema = z.object({
  method: z.string().trim().min(2, "Payment method key is required"),
  displayName: z.string().trim().min(2, "Display name is required"),
  accountDetails: z.string().trim().min(2, "Account number or phone is required"),
  instructions: z.string().trim().optional(),
  active: z.boolean().default(true),
});

export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;
export type ApprovePaymentInput = z.infer<typeof approvePaymentSchema>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type PaymentSettingInput = z.infer<typeof paymentSettingSchema>;
