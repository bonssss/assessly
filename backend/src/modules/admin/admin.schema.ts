import { z } from "zod";

export const queryAuditLogsSchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  actorId: z.string().uuid("Invalid actor UUID").optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const queryUsersSchema = z.object({
  q: z.string().optional(), // search name, email
  role: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]).optional(),
  departmentId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]),
});

export type QueryAuditLogsInput = z.infer<typeof queryAuditLogsSchema>;
export type QueryUsersInput = z.infer<typeof queryUsersSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
