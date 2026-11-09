import { request } from "./client";

export const resourcesApi = {
  async list(params?: { departmentId?: string; accessLevel?: string }): Promise<any> {
    const search = new URLSearchParams();
    if (params?.departmentId) search.set("departmentId", params.departmentId);
    if (params?.accessLevel) search.set("accessLevel", params.accessLevel);
    const queryStr = search.toString();
    return request(`/resources${queryStr ? `?${queryStr}` : ""}`);
  },

  async upload(formData: FormData): Promise<any> {
    return request("/resources", {
      method: "POST",
      body: formData,
    });
  },

  async delete(id: string): Promise<any> {
    return request(`/resources/${id}`, {
      method: "DELETE",
    });
  },

  async getDownloadUrl(resourceId: string): Promise<{ downloadUrl: string; title: string }> {
    return request(`/resources/${resourceId}/download`);
  },
};

