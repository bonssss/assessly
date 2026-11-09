import { request } from "./client";

export const examsApi = {
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

  async create(data: {
    departmentId: string;
    title: string;
    instructions?: string;
    durationMinutes: number;
    feedbackPolicy?: string;
    status?: string;
    questionIds: string[];
  }): Promise<any> {
    return request("/exams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<any> {
    return request(`/exams/${id}`, {
      method: "DELETE",
    });
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
    answers: Array<{ questionId: string; selectedOptionId?: string }>,
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
};

