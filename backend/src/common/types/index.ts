export type UserRole = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
