import { request } from "./client";

export const paymentsApi = {
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

  async listAdminPayments(params?: { status?: string }): Promise<any[]> {
    const search = new URLSearchParams();
    if (params?.status && params.status !== "All") {
      search.set("status", params.status.toUpperCase());
    }
    const queryStr = search.toString();
    return request(`/payments/admin/queue${queryStr ? `?${queryStr}` : ""}`);
  },

  async getReceiptUrl(paymentId: string): Promise<{ previewUrl: string }> {
    return request(`/payments/${paymentId}/receipt-url`);
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
};

