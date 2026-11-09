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
      rejectedPayments,
      approvedPaymentsAgg,
      totalQuestions,
      totalExams,
      totalAttempts,
      completedAttempts,
      attemptScores,
      departments,
      completedAttemptsList,
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
      prisma.payment.count({ where: { status: "REJECTED" } }),
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
              students: true,
              questions: true,
              exams: true,
              resources: true,
            },
          },
        },
      }),
      prisma.examAttempt.findMany({
        where: { status: { in: ["COMPLETED", "TIMED_OUT"] } },
        select: {
          score: true,
          answers: {
            select: {
              question: { select: { marks: true } },
            },
          },
          exam: {
            select: {
              questions: { select: { marks: true } },
            },
          },
        },
      }),
    ]);

    const totalRevenueETB = Number(approvedPaymentsAgg._sum.amount ?? 0);

    // Compute platform-wide percentage average score
    let averageScore = 0;
    if (completedAttemptsList && completedAttemptsList.length > 0) {
      const allPercentages: number[] = completedAttemptsList.map((a: any) => {
        let maxMarks = 0;
        if (a.answers && a.answers.length > 0) {
          maxMarks = a.answers.reduce(
            (sum: number, ans: any) => sum + Number(ans.question?.marks || 1),
            0
          );
        } else if (a.exam?.questions && a.exam.questions.length > 0) {
          maxMarks = a.exam.questions.reduce(
            (sum: number, q: any) => sum + Number(q.marks || 1),
            0
          );
        } else {
          maxMarks = 100;
        }
        const raw = Number(a.score || 0);
        return maxMarks > 0 ? Math.round((raw / maxMarks) * 100 * 10) / 10 : 0;
      });
      averageScore =
        Math.round((allPercentages.reduce((s: number, p: number) => s + p, 0) / allPercentages.length) * 10) / 10;
    } else if (attemptScores._avg?.score) {
      averageScore = Math.round(Number(attemptScores._avg.score) * 100) / 100;
    }

    // Last 7 days exam activity telemetry
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentAttempts = await prisma.examAttempt.findMany({
      where: { startedAt: { gte: sevenDaysAgo } },
      select: { startedAt: true, status: true },
    });

    const daysMap: Record<string, { date: string; attempts: number; completed: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      daysMap[dateStr] = { date: dateStr, attempts: 0, completed: 0 };
    }
    for (const att of recentAttempts) {
      const dateStr = att.startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (daysMap[dateStr]) {
        daysMap[dateStr].attempts += 1;
        if (att.status === "COMPLETED" || att.status === "TIMED_OUT") {
          daysMap[dateStr].completed += 1;
        }
      }
    }
    const recentActivity = Object.values(daysMap);

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
          rejectedPayments,
          totalApprovedPayments: approvedPaymentsAgg._count.id,
          totalRevenueETB,
          currency: "ETB",
          paymentBreakdown: [
            { status: "Approved", count: approvedPaymentsAgg._count.id, fill: "#10b981" },
            { status: "Pending", count: pendingPayments, fill: "#f59e0b" },
            { status: "Rejected", count: rejectedPayments, fill: "#ef4444" },
          ],
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
      recentActivity,
      departmentBreakdown: departments.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        enrolledStudents: d._count.students,
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

  /**
   * Platform Settings: Retrieve payment settings and policy thresholds
   */
  async getSettings() {
    const settings = await prisma.paymentSetting.findMany({
      orderBy: { createdAt: "asc" },
    });

    const telebirr = settings.find((s) => s.method === "TELEBIRR");
    const cbe = settings.find((s) => s.method === "BANK_TRANSFER");

    return {
      freeTrialQuestions: 5,
      passMarkPercentage: 50,
      telebirr: {
        accountNumber: telebirr?.accountDetails || "0911 234 567",
        displayName: telebirr?.displayName || "Assessly Telebirr",
        instructions: telebirr?.instructions || "Pay via Telebirr merchant/account and attach receipt.",
        active: telebirr?.active ?? true,
      },
      cbe: {
        accountNumber: cbe?.accountDetails || "1000 2345 6789 0",
        displayName: cbe?.displayName || "Commercial Bank of Ethiopia",
        instructions: cbe?.instructions || "Transfer to CBE account and attach screenshot/SMS confirmation.",
        active: cbe?.active ?? true,
      },
    };
  }

  /**
   * Platform Settings: Update payment settings and policy thresholds
   */
  async updateSettings(data: {
    telebirrNumber?: string;
    telebirrInstructions?: string;
    cbeAccount?: string;
    cbeInstructions?: string;
    freeTrialQuestions?: number;
    passMarkPercentage?: number;
  }) {
    if (data.telebirrNumber !== undefined) {
      const existing = await prisma.paymentSetting.findFirst({
        where: { method: "TELEBIRR" },
      });
      let instructions = data.telebirrInstructions ?? existing?.instructions ?? "";
      if (existing?.accountDetails && instructions.includes(existing.accountDetails)) {
        instructions = instructions.split(existing.accountDetails).join(data.telebirrNumber);
      }
      if (!instructions) {
        instructions = `1. Open Telebirr app.\n2. Send money to merchant/phone ${data.telebirrNumber}.\n3. Take a screenshot of the confirmation receipt.\n4. Submit receipt image and transaction code here.`;
      }
      if (existing) {
        await prisma.paymentSetting.update({
          where: { id: existing.id },
          data: {
            accountDetails: data.telebirrNumber,
            instructions,
          },
        });
      } else {
        await prisma.paymentSetting.create({
          data: {
            method: "TELEBIRR",
            displayName: "Telebirr",
            accountDetails: data.telebirrNumber,
            instructions,
            active: true,
          },
        });
      }
    }

    if (data.cbeAccount !== undefined) {
      const existing = await prisma.paymentSetting.findFirst({
        where: { method: "BANK_TRANSFER" },
      });
      let instructions = data.cbeInstructions ?? existing?.instructions ?? "";
      if (existing?.accountDetails && instructions.includes(existing.accountDetails)) {
        instructions = instructions.split(existing.accountDetails).join(data.cbeAccount);
      }
      if (!instructions) {
        instructions = `1. Transfer to CBE account ${data.cbeAccount}.\n2. Upload mobile banking transfer receipt or bank slip.\n3. Enter the transaction reference number.`;
      }
      if (existing) {
        await prisma.paymentSetting.update({
          where: { id: existing.id },
          data: {
            accountDetails: data.cbeAccount,
            instructions,
          },
        });
      } else {
        await prisma.paymentSetting.create({
          data: {
            method: "BANK_TRANSFER",
            displayName: "Commercial Bank of Ethiopia (CBE)",
            accountDetails: data.cbeAccount,
            instructions,
            active: true,
          },
        });
      }
    }

    if (data.freeTrialQuestions !== undefined) {
      await prisma.trialUsage.updateMany({
        data: {
          quotaLimit: data.freeTrialQuestions,
        },
      });
    }

    return this.getSettings();
  }

  /**
   * Reports: Detailed department breakdown with attempt counts, average scores, and pass rates
   */
  async getDepartmentReports() {
    const departments = await prisma.department.findMany({
      where: { status: "ACTIVE" },
      include: {
        _count: {
          select: {
            students: true,
            questions: true,
            exams: true,
          },
        },
        exams: {
          select: {
            id: true,
            questions: {
              select: {
                marks: true,
              },
            },
            attempts: {
              select: {
                id: true,
                status: true,
                score: true,
                answers: {
                  select: {
                    awardedMarks: true,
                    question: {
                      select: { marks: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return departments.map((dept) => {
      const allAttempts = dept.exams.flatMap((e) =>
        e.attempts.map((a) => ({ ...a, defaultExamQuestions: e.questions }))
      );
      const completed = allAttempts.filter(
        (a) => a.status === "COMPLETED" || a.status === "TIMED_OUT"
      );

      const percentages: number[] = completed.map(computeAttemptPercentage);
      const totalPercentage = percentages.reduce((sum: number, p: number) => sum + p, 0);
      const avgScore =
        percentages.length > 0
          ? Math.round((totalPercentage / percentages.length) * 10) / 10
          : 0;
      const passedCount = percentages.filter((p) => p >= 50).length;
      const passRate =
        percentages.length > 0 ? Math.round((passedCount / percentages.length) * 100) : 0;

      return {
        id: dept.id,
        code: dept.code,
        name: dept.name,
        students: dept._count.students,
        questions: dept._count.questions,
        exams: dept._count.exams,
        examsTaken: completed.length,
        avgScore,
        passRate,
      };
    });
  }
}

function computeAttemptPercentage(attempt: any): number {
  let maxMarks = 0;
  if (attempt.answers && attempt.answers.length > 0) {
    maxMarks = attempt.answers.reduce(
      (sum: number, ans: any) => sum + Number(ans.question?.marks || 1),
      0
    );
  } else if (attempt.defaultExamQuestions && attempt.defaultExamQuestions.length > 0) {
    maxMarks = attempt.defaultExamQuestions.reduce(
      (sum: number, q: any) => sum + Number(q.marks || 1),
      0
    );
  } else {
    maxMarks = 100;
  }

  const raw = Number(attempt.score || 0);
  return maxMarks > 0 ? Math.round((raw / maxMarks) * 100 * 10) / 10 : 0;
}

export const adminService = new AdminService();
