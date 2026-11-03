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
import { uploadResourceFile } from "../../common/storage/index.js";

const router = Router();

// ==========================================
// FILE STREAMING ENDPOINT (Local Storage)
// ==========================================
router.get("/files/:filename", serveLocalResourceFileHandler);

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
