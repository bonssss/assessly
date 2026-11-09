import { authStorage, request, type ApiUser, type AuthResponse } from "./client";

export const authApi = {
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    departmentIds: string[];
  }): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async getMe(): Promise<{
    user: ApiUser;
    departments: any[];
    trialUsage: any;
    activeEntitlements: any[];
  }> {
    const res = await request<any>("/auth/me");
    if (res.user) {
      authStorage.setUser(res.user);
    }
    return res;
  },

  logout() {
    authStorage.clear();
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    return request<{ message: string; resetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
