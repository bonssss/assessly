import { Router } from "express";
import {
  getInstructionsHandler,
  createPaymentSettingHandler,
  listPackagesHandler,
  createPackageHandler,
  submitPaymentHandler,
  getReceiptPreviewHandler,
  serveLocalReceiptFileHandler,
  listStudentPaymentsHandler,
  listAdminPaymentsHandler,
  approvePaymentHandler,
  rejectPaymentHandler,
} from "./payment.controller.js";
import { requireAuth, requireRoles } from "../../common/middlewares/auth.middleware.js";
import { validateBody } from "../../common/middlewares/validate.middleware.js";
import { paymentRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";
import { uploadReceipt } from "../../common/storage/index.js";
import {
  submitPaymentSchema,
  approvePaymentSchema,
  rejectPaymentSchema,
  createPackageSchema,
  paymentSettingSchema,
} from "./payment.schema.js";

const router = Router();

// Apply payment operations rate limiter across all payment endpoints
router.use(paymentRateLimiter);

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// View active bank / Telebirr payment instructions
router.get("/instructions", getInstructionsHandler);

// View purchasable access packages
router.get("/packages", listPackagesHandler);

// Local file preview/download (strictly authenticated with ownership verification)
router.get("/receipts/:filename", requireAuth, serveLocalReceiptFileHandler);

// ==========================================
// STUDENT & AUTHENTICATED ENDPOINTS
// ==========================================

// Student submits payment receipt and transaction code
router.post(
  "/",
  requireAuth,
  requireRoles("STUDENT"),
  uploadReceipt.single("receipt"),
  validateBody(submitPaymentSchema),
  submitPaymentHandler
);

// Student reviews personal payment history and status
router.get("/me", requireAuth, listStudentPaymentsHandler);

// Get short-lived signed preview URL for receipt (owner or admin only - AC-11)
router.get("/:id/receipt-url", requireAuth, getReceiptPreviewHandler);

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// Admin review queue for submitted payments (supports ?status=PENDING | APPROVED | REJECTED)
router.get(
  ["/admin/queue", "/admin/pending", "/admin/all"],
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  listAdminPaymentsHandler
);

// Admin approves payment & activates access entitlement (supports both /admin/:id/approve and /:id/approve)
router.post(
  ["/admin/:id/approve", "/:id/approve"],
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(approvePaymentSchema),
  approvePaymentHandler
);

// Admin declines/rejects payment with feedback note (supports both /admin/:id/reject and /:id/reject)
router.post(
  ["/admin/:id/reject", "/:id/reject"],
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(rejectPaymentSchema),
  rejectPaymentHandler
);

// Admin creates packages
router.post(
  "/admin/packages",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(createPackageSchema),
  createPackageHandler
);

// Admin configures payment method details (Telebirr/CBE)
router.post(
  "/admin/settings",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(paymentSettingSchema),
  createPaymentSettingHandler
);

export default router;
