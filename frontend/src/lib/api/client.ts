// Centralized API Client & Storage Primitives for Assessly Platform
export const API_BASE_URL =
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
export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
