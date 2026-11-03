import prisma from "../../prisma.js";
import { config } from "../../config/env.js";
import { hashPassword, comparePassword } from "../../common/utils/password.js";
import { signToken } from "../../common/utils/jwt.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "../../common/errors/app-error.js";
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "./auth.schema.js";
import type { UserRole } from "../../common/types/index.js";

export class AuthService {
  async register(data: RegisterInput) {
    const { fullName, email, password, departmentIds } = data;

    // 1. Check for duplicate email
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictError("An account with this email address already exists");
    }

    // 2. Verify all selected departments exist and are active
    const activeDepartments = await prisma.department.findMany({
      where: {
        id: { in: departmentIds },
        status: "ACTIVE",
      },
    });

    if (activeDepartments.length !== departmentIds.length) {
      throw new BadRequestError("One or more selected departments are invalid or inactive");
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Create user, enrollments, and free trial quota atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          role: "STUDENT",
          status: "ACTIVE",
        },
      });

      // Create department enrollments
      await tx.userDepartment.createMany({
        data: departmentIds.map((deptId) => ({
          userId: user.id,
          departmentId: deptId,
        })),
      });

      // Initialize 5-question trial ledger (SRS FR-ACCESS-01)
      await tx.trialUsage.create({
        data: {
          userId: user.id,
          quotaLimit: config.freeTrialQuota,
          usedCount: 0,
        },
      });

      return user;
    });

    // 5. Generate JWT token
    const token = signToken({
      userId: result.id,
      email: result.email,
      role: result.role as UserRole,
    });

    return {
      user: {
        id: result.id,
        fullName: result.fullName,
        email: result.email,
        role: result.role,
        status: result.status,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    // 1. Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 2. Check account status
    if (user.status !== "ACTIVE") {
      throw new ForbiddenError("Your account has been deactivated or suspended");
    }

    // 3. Verify password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 4. Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        enrollments: {
          include: {
            department: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
        },
        trialUsage: {
          select: {
            quotaLimit: true,
            usedCount: true,
          },
        },
        entitlements: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            departmentId: true,
            packageId: true,
            startsAt: true,
            expiresAt: true,
            remainingCredits: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const { fullName, departmentIds } = data;

    await prisma.$transaction(async (tx) => {
      if (fullName) {
        await tx.user.update({
          where: { id: userId },
          data: { fullName },
        });
      }

      if (departmentIds && departmentIds.length > 0) {
        // Validate departments
        const depts = await tx.department.findMany({
          where: { id: { in: departmentIds }, status: "ACTIVE" },
        });
        if (depts.length !== departmentIds.length) {
          throw new BadRequestError("One or more selected departments are invalid");
        }

        // Replace enrollments
        await tx.userDepartment.deleteMany({
          where: { userId },
        });

        await tx.userDepartment.createMany({
          data: departmentIds.map((deptId) => ({
            userId,
            departmentId: deptId,
          })),
        });
      }
    });

    return this.getMe(userId);
  }
}

export const authService = new AuthService();

