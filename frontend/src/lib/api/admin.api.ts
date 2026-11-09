import { request } from "./client";

export const adminApi = {
  async getOverviewKPIs(): Promise<any> {
    return request("/admin/reports/overview");
  },

  async getDepartmentReports(): Promise<any[]> {
    return request("/admin/reports/departments");
  },

  async getSettings(): Promise<any> {
    return request("/admin/settings");
  },

  async updateSettings(data: any): Promise<any> {
    return request("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async listAuditLogs(params?: { page?: number; limit?: number; action?: string }): Promise<any> {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.action) search.set("action", params.action);
    const queryStr = search.toString();
    return request(`/admin/audit-logs${queryStr ? `?${queryStr}` : ""}`);
  },

  async listUsers(params?: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
  }): Promise<any> {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.q) search.set("q", params.q);
    if (params?.role) search.set("role", params.role);
    const queryStr = search.toString();
    return request(`/admin/users${queryStr ? `?${queryStr}` : ""}`);
  },

  async updateUserRole(userId: string, role: string): Promise<any> {
    return request(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async updateUserStatus(userId: string, status: string): Promise<any> {
    return request(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

