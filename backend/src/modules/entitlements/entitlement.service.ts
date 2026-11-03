import prisma from "../../prisma.js";
import { NotFoundError } from "../../common/errors/app-error.js";

export class EntitlementService {
  async getStatus(userId: string) {
    const [trialUsage, entitlements] = await Promise.all([
      prisma.trialUsage.findUnique({
        where: { userId },
      }),
      prisma.entitlement.findMany({
        where: {
          userId,
          status: "ACTIVE",
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          package: {
            select: { id: true, name: true, price: true, currency: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
    ]);

    const quotaLimit = trialUsage?.quotaLimit ?? 5;
    const usedCount = trialUsage?.usedCount ?? 0;
    const remaining = Math.max(0, quotaLimit - usedCount);

    return {
      trial: {
        quotaLimit,
        usedCount,
        remaining,
        isExhausted: usedCount >= quotaLimit,
      },
      hasActiveEntitlement: entitlements.length > 0,
      activeEntitlements: entitlements,
    };
  }
}

export const entitlementService = new EntitlementService();
