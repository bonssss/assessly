import { Router } from "express";
import {
  createResourceHandler,
  listResourcesHandler,
  getResourceByIdHandler,
  getDownloadUrlHandler,
  updateResourceHandler,
  deleteResourceHandler,
  serveLocalResourceFileHandler,
} from "./resource.controller.js";
import { requireAuth, requireRoles } from "../../common/middlewares/auth.middleware.js";
import { resourceRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";
import { uploadResourceFile } from "../../common/storage/index.js";

const router = Router();

// Apply learning resources rate limiter
router.use(resourceRateLimiter);

// ==========================================
// FILE STREAMING ENDPOINT (Local Storage, Authenticated with Paywall Guard)
// ==========================================
router.get("/files/:filename", requireAuth, serveLocalResourceFileHandler);

// ==========================================
// AUTHENTICATED ENDPOINTS (Students & Admins)
// ==========================================
router.get("/", requireAuth, listResourcesHandler);
router.get("/:id", requireAuth, getResourceByIdHandler);
router.get("/:id/download", requireAuth, getDownloadUrlHandler);

// ==========================================
// ADMIN MANAGEMENT ENDPOINTS
// ==========================================
router.post(
  "/",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  uploadResourceFile.single("file"),
  createResourceHandler
);

router.patch(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  updateResourceHandler
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  deleteResourceHandler
);

export default router;
