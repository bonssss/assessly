import { request } from "./client";

export const questionsApi = {
  async list(params?: {
    departmentId?: string;
    topic?: string;
    difficulty?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    questions: any[];
  }> {
    const search = new URLSearchParams();
    if (params?.departmentId) search.set("departmentId", params.departmentId);
    if (params?.topic) search.set("topic", params.topic);
    if (params?.difficulty) search.set("difficulty", params.difficulty);
    if (params?.status) search.set("status", params.status);
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));

    const queryStr = search.toString();
    return request(`/questions${queryStr ? `?${queryStr}` : ""}`);
  },

  async submitPractice(
    questionId: string,
    selectedOptionId: string,
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

  async bulkImport(data: {
    departmentId: string;
    questions?: any[];
    csvText?: string;
  }): Promise<any> {
    return request("/questions/bulk-import", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateQuestion(id: string, data: any): Promise<any> {
    return request(`/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteQuestion(id: string): Promise<any> {
    return request(`/questions/${id}`, {
      method: "DELETE",
    });
  },
};

