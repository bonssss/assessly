import { Router } from "express";
import {
  getOverviewKPIsHandler,
  listAuditLogsHandler,
  listUsersHandler,
  updateUserRoleHandler,
  updateUserStatusHandler,
  getSettingsHandler,
  updateSettingsHandler,
  getDepartmentReportsHandler,
} from "./admin.controller.js";
import { requireAuth, requireRoles } from "../../common/middlewares/auth.middleware.js";
import { adminRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";

const router = Router();

// Protect all admin routes with authentication, role checks, and administrative rate limiting
router.use(adminRateLimiter);
router.use(requireAuth, requireRoles("ADMIN", "SUPER_ADMIN"));

// System Overview & Real-Time Performance Analytics (FR-ADMIN)
router.get("/reports/overview", getOverviewKPIsHandler);

// Department Performance & Pass Rate Analytics
router.get("/reports/departments", getDepartmentReportsHandler);

// Paginated Audit Logs (FR-AUD)
router.get("/audit-logs", listAuditLogsHandler);

// User Management
router.get("/users", listUsersHandler);

// Role modification (SUPER_ADMIN only)
router.patch("/users/:id/role", requireRoles("SUPER_ADMIN"), updateUserRoleHandler);

// User status (activation / deactivation)
router.patch("/users/:id/status", updateUserStatusHandler);

// Platform Settings (Telebirr, CBE, Trial Quota, Pass Mark)
router.get("/settings", getSettingsHandler);
router.patch("/settings", updateSettingsHandler);
router.post("/settings", updateSettingsHandler);

export default router;
