import { request } from "./client";

export const departmentsApi = {
  async list(): Promise<
    Array<{
      id: string;
      code: string;
      name: string;
      description?: string;
      _count?: { questions: number; resources: number; exams: number };
    }>
  > {
    return request("/departments");
  },

  async create(data: { code: string; name: string; description?: string }): Promise<any> {
    return request("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
