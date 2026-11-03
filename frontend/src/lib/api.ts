// Centralized API Client for Assessly Platform
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

// Token & Session Storage Utilities
export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("assessly_token");
  },
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("assessly_token", token);
    }
  },
  getUser(): ApiUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("assessly_user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user: ApiUser) {
    if (typeof window !== "undefined") {
      localStorage.setItem("assessly_user", JSON.stringify(user));
    }
  },
  clear() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("assessly_token");
      localStorage.removeItem("assessly_user");
    }
  },
};

// Generic Request Wrapper
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = new Error(json.message || "An error occurred with the API");
    error.status = response.status;
    error.code = json.code;
    error.errors = json.errors;
    throw error;
  }

  return (json.data !== undefined ? json.data : json) as T;
}

// Module API Services
export const api = {
  // Authentication & Profile (FR-AUTH)
  auth: {
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

    async getMe(): Promise<{ user: ApiUser; departments: any[]; trialUsage: any; activeEntitlements: any[] }> {
      const res = await request<any>("/auth/me");
      if (res.user) {
        authStorage.setUser(res.user);
      }
      return res;
    },

    logout() {
      authStorage.clear();
    },
  },

  // Academic Departments (FR-DEPT)
  departments: {
    async list(): Promise<Array<{ id: string; code: string; name: string; description?: string }>> {
      return request("/departments");
    },
  },

  // Questions & Practice Engine (FR-Q, AC-09)
  questions: {
    async list(params?: {
      departmentId?: string;
      topic?: string;
      difficulty?: string;
      page?: number;
      limit?: number;
    }): Promise<{ total: number; page: number; limit: number; totalPages: number; questions: any[] }> {
      const search = new URLSearchParams();
      if (params?.departmentId) search.set("departmentId", params.departmentId);
      if (params?.topic) search.set("topic", params.topic);
      if (params?.difficulty) search.set("difficulty", params.difficulty);
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));

      const queryStr = search.toString();
      return request(`/questions${queryStr ? `?${queryStr}` : ""}`);
    },

    async submitPractice(
      questionId: string,
      selectedOptionId: string
    ): Promise<{
      isCorrect: boolean;
      score: number;
      quotaRemaining: number;
      correctOptionId?: string;
      explanation?: string;
    }> {
      return request(`/questions/${questionId}/practice`, {
        method: "POST",
        body: JSON.stringify({ selectedOptionId }),
      });
    },

    async createQuestion(data: any): Promise<any> {
      return request("/questions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  // Timed Exam Engine (FR-EXAM)
  exams: {
    async list(params?: { departmentId?: string; page?: number; limit?: number }): Promise<{
      total: number;
      exams: any[];
    }> {
      const search = new URLSearchParams();
      if (params?.departmentId) search.set("departmentId", params.departmentId);
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));
      const queryStr = search.toString();
      return request(`/exams${queryStr ? `?${queryStr}` : ""}`);
    },

    async start(examId: string): Promise<{
      attemptId: string;
      examTitle: string;
      durationMinutes: number;
      deadlineAt: string;
      remainingSeconds: number;
      questions: Array<{
        sequence: number;
        marks: number;
        question: {
          id: string;
          body: string;
          difficulty: string;
          options: Array<{ id: string; optionText: string; sortOrder: number }>;
        };
      }>;
    }> {
      return request(`/exams/${examId}/start`, {
        method: "POST",
      });
    },

    async submitAttempt(
      attemptId: string,
      answers: Array<{ questionId: string; selectedOptionId?: string }>
    ): Promise<{
      attemptId: string;
      status: string;
      totalQuestions: number;
      correctAnswers: number;
      obtainedMarks: number;
      totalMarks: number;
      percentage: number;
      results?: any[];
    }> {
      return request(`/exams/attempts/${attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
    },

    async getHistory(): Promise<any[]> {
      return request("/exams/history/my-attempts");
    },
  },

  // Entitlements & Subscription Status (FR-ACCESS)
  entitlements: {
    async getStatus(): Promise<{
      hasActiveEntitlement: boolean;
      activeEntitlements: any[];
      trialUsage?: { usedCount: number; quotaLimit: number; remaining: number };
    }> {
      return request("/entitlements/status");
    },
  },

  // Payments (Telebirr & CBE) (FR-PAY)
  payments: {
    async getInstructions(): Promise<any[]> {
      return request("/payments/instructions");
    },

    async getPackages(): Promise<any[]> {
      return request("/payments/packages");
    },

    async submitPayment(formData: FormData): Promise<any> {
      return request("/payments", {
        method: "POST",
        body: formData,
      });
    },

    async listMyPayments(): Promise<any[]> {
      return request("/payments/my-payments");
    },

    async listPendingPayments(params?: { page?: number; limit?: number }): Promise<any> {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));
      const queryStr = search.toString();
      return request(`/payments/admin/pending${queryStr ? `?${queryStr}` : ""}`);
    },

    async approve(paymentId: string, note?: string): Promise<any> {
      return request(`/payments/${paymentId}/approve`, {
        method: "POST",
        body: JSON.stringify({ note }),
      });
    },

    async reject(paymentId: string, rejectionReason: string): Promise<any> {
      return request(`/payments/${paymentId}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
      });
    },
  },

  // Learning Resources (FR-RES)
  resources: {
    async list(params?: { departmentId?: string; accessLevel?: string }): Promise<any> {
      const search = new URLSearchParams();
      if (params?.departmentId) search.set("departmentId", params.departmentId);
      if (params?.accessLevel) search.set("accessLevel", params.accessLevel);
      const queryStr = search.toString();
      return request(`/resources${queryStr ? `?${queryStr}` : ""}`);
    },

    async getDownloadUrl(resourceId: string): Promise<{ downloadUrl: string; title: string }> {
      return request(`/resources/${resourceId}/download`);
    },
  },

  // Admin Analytics & Audits (FR-ADMIN, FR-AUD)
  admin: {
    async getOverviewKPIs(): Promise<any> {
      return request("/admin/reports/overview");
    },

    async listAuditLogs(params?: { page?: number; limit?: number; action?: string }): Promise<any> {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));
      if (params?.action) search.set("action", params.action);
      const queryStr = search.toString();
      return request(`/admin/audit-logs${queryStr ? `?${queryStr}` : ""}`);
    },

    async listUsers(params?: { page?: number; limit?: number; q?: string; role?: string }): Promise<any> {
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
  },
};

