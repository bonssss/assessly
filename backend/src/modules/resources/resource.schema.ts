import { z } from "zod";

export const createResourceSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  description: z.string().max(2000).optional(),
  topic: z.string().max(100).optional(),
  departmentId: z.string().uuid("Invalid department UUID"),
  accessLevel: z.enum(["FREE", "TRIAL", "PAID"]).default("FREE"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const updateResourceSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters")
    .optional(),
  description: z.string().max(2000).optional(),
  topic: z.string().max(100).optional(),
  accessLevel: z.enum(["FREE", "TRIAL", "PAID"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const queryResourceSchema = z.object({
  departmentId: z.string().uuid("Invalid department UUID").optional(),
  topic: z.string().optional(),
  accessLevel: z.enum(["FREE", "TRIAL", "PAID"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type QueryResourceInput = z.infer<typeof queryResourceSchema>;
