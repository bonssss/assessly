import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
  departmentIds: z
    .array(z.string().uuid("Invalid department identifier"))
    .min(1, "Please select at least one department"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .optional(),
  departmentIds: z
    .array(z.string().uuid("Invalid department identifier"))
    .min(1, "Must select at least one department")
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
