import { prisma } from "../../prisma.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../common/errors/app-error.js";
import type {
  QueryAuditLogsInput,
  QueryUsersInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from "./admin.schema.js";
import type { AuthenticatedUser } from "../../common/types/index.js";

export class AdminService {
  /**
   * System Overview & Real-Time Performance Analytics (FR-ADMIN, FR-AUD)
   */
  async getOverviewKPIs() {
    const now = new Date();

    const [
      totalStudents,
      totalAdmins,
      totalSuperAdmins,
      activeEntitlements,
      pendingPayments,
      approvedPaymentsAgg,
      totalQuestions,
      totalExams,
      totalAttempts,
      completedAttempts,
      attemptScores,
      departments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
      prisma.entitlement.count({
        where: {
          status: "ACTIVE",
          expiresAt: { gt: now },
        },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.question.count(),
      prisma.exam.count(),
      prisma.examAttempt.count(),
      prisma.examAttempt.count({ where: { status: "COMPLETED" } }),
      prisma.examAttempt.aggregate({
        where: { status: "COMPLETED" },
        _avg: { score: true },
      }),
      prisma.department.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          _count: {
            select: {
              enrollments: true,
              questions: true,
              exams: true,
              resources: true,
            },
          },
        },
      }),
    ]);

    const totalRevenueETB = Number(approvedPaymentsAgg._sum.amount ?? 0);
    const averageScore = attemptScores._avg?.score
      ? Math.round(Number(attemptScores._avg.score) * 100) / 100
      : 0;

    return {
      kpis: {
        users: {
          totalStudents,
          totalAdmins,
          totalSuperAdmins,
          totalUsers: totalStudents + totalAdmins + totalSuperAdmins,
        },
        monetization: {
          activeEntitlements,
          pendingPayments,
          totalApprovedPayments: approvedPaymentsAgg._count.id,
          totalRevenueETB,
          currency: "ETB",
        },
        content: {
          totalQuestions,
          totalExams,
        },
        performance: {
          totalAttempts,
          completedAttempts,
          averageScore,
        },
      },
      departmentBreakdown: departments.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        enrolledStudents: d._count.enrollments,
        questionsCount: d._count.questions,
        examsCount: d._count.exams,
        resourcesCount: d._count.resources,
      })),
      timestamp: now.toISOString(),
    };
  }

  /**
   * Paginated Audit Logs (FR-AUD)
   */
  async listAuditLogs(query: QueryAuditLogsInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action) {
      where.action = { contains: query.action, mode: "insensitive" };
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List users with role filter, department enrollment, and search
   */
  async listUsers(query: QueryUsersInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.q) {
      where.OR = [
        { fullName: { contains: query.q, mode: "insensitive" } },
        { email: { contains: query.q, mode: "insensitive" } },
      ];
    }

    if (query.departmentId) {
      where.enrollments = {
        some: { departmentId: query.departmentId },
      };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
                select: { id: true, name: true, code: true },
              },
            },
          },
          trialUsage: {
            select: { usedCount: true, quotaLimit: true },
          },
          entitlements: {
            where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
            select: { id: true, departmentId: true, expiresAt: true },
          },
        },
      }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        departments: u.enrollments.map((ud) => ud.department),
        trialUsage: u.trialUsage,
        activeEntitlementsCount: u.entitlements.length,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user role (e.g., promote to ADMIN)
   */
  async updateUserRole(actor: AuthenticatedUser, targetUserId: string, data: UpdateUserRoleInput) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) {
      throw new NotFoundError("Target user not found");
    }

    if (actor.id === targetUserId && data.role !== "SUPER_ADMIN" && target.role === "SUPER_ADMIN") {
      throw new BadRequestError("You cannot demote yourself from Super Admin");
    }

    const oldRole = target.role;
    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: data.role },
      select: { id: true, fullName: true, email: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "ROLE_CHANGED",
        entityType: "USER",
        entityId: targetUserId,
        metadata: {
          targetEmail: target.email,
          previousRole: oldRole,
          newRole: data.role,
        },
      },
    });

    return updated;
  }

  /**
   * Activate or suspend user account
   */
  async updateUserStatus(actor: AuthenticatedUser, targetUserId: string, data: UpdateUserStatusInput) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) {
      throw new NotFoundError("Target user not found");
    }

    if (actor.id === targetUserId && data.status !== "ACTIVE") {
      throw new BadRequestError("You cannot deactivate or suspend your own account");
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: data.status },
      select: { id: true, fullName: true, email: true, role: true, status: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "USER_STATUS_UPDATED",
        entityType: "USER",
        entityId: targetUserId,
        metadata: {
          targetEmail: target.email,
          newStatus: data.status,
        },
      },
    });

    return updated;
  }
}

export const adminService = new AdminService();
