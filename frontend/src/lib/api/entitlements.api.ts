import { request } from "./client";

export const entitlementsApi = {
  async getStatus(): Promise<{
    hasActiveEntitlement: boolean;
    activeEntitlements: any[];
    trialUsage?: { usedCount: number; quotaLimit: number; remaining: number };
  }> {
    return request("/entitlements/status");
  },
};
