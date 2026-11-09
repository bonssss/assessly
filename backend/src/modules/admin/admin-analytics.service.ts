import { prisma } from "../../prisma.js";

export function computeAttemptPercentage(attempt: any): number {
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

export function computeDepartmentStats(dept: any) {
  const completedAttempts: any[] = [];
  for (const exam of dept.exams) {
    for (const attempt of exam.attempts) {
      if (attempt.status === "COMPLETED" || attempt.status === "TIMED_OUT") {
        completedAttempts.push({ ...attempt, defaultExamQuestions: exam.questions });
      }
    }
  }

  const percentages: number[] = [];
  for (const att of completedAttempts) {
    percentages.push(computeAttemptPercentage(att));
  }

  const totalPercentage = percentages.reduce((sum: number, p: number) => sum + p, 0);
  const count = percentages.length;
  const avgScore = count > 0 ? Math.round((totalPercentage / count) * 10) / 10 : 0;
  const passedCount = percentages.filter((p) => p >= 50).length;
  const passRate = count > 0 ? Math.round((passedCount / count) * 100) : 0;

  return {
    id: dept.id,
    code: dept.code,
    name: dept.name,
    students: dept._count.students,
    questions: dept._count.questions,
    exams: dept._count.exams,
    examsTaken: count,
    avgScore,
    passRate,
  };
}

export class AdminAnalyticsService {
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
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const dayDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

    return departments.map(computeDepartmentStats);
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
