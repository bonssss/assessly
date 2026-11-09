// Centralized API Client & Storage Exports for Assessly Platform
import { authStorage, request, type ApiUser, type AuthResponse } from "./api/client";
import { authApi } from "./api/auth.api";
import { departmentsApi } from "./api/departments.api";
import { questionsApi } from "./api/questions.api";
import { examsApi } from "./api/exams.api";
import { entitlementsApi } from "./api/entitlements.api";
import { paymentsApi } from "./api/payments.api";
import { resourcesApi } from "./api/resources.api";
import { adminApi } from "./api/admin.api";

export { authStorage, request, type ApiUser, type AuthResponse };

// Domain API services
export const api = {
  auth: authApi,
  departments: departmentsApi,
  questions: questionsApi,
  exams: examsApi,
  entitlements: entitlementsApi,
  payments: paymentsApi,
  resources: resourcesApi,
  admin: adminApi,
};
