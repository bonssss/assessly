import { Router } from "express";
import {
  createExamHandler,
  updateExamHandler,
  deleteExamHandler,
  listExamsHandler,
  startExamAttemptHandler,
  submitExamAttemptHandler,
  getAttemptResultsHandler,
  listStudentExamHistoryHandler,
} from "./exam.controller.js";
import { requireAuth, requireRoles } from "../../common/middlewares/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../common/middlewares/validate.middleware.js";
import {
  createExamSchema,
  updateExamSchema,
  submitExamAttemptSchema,
  listExamsQuerySchema,
} from "./exam.schema.js";

const router = Router();

// ==========================================
// EXAM DISCOVERY & STUDENT WORKFLOW
// ==========================================

// List exams (filtered by enrolled departments for students, complete for admin)
router.get("/", requireAuth, validateQuery(listExamsQuerySchema), listExamsHandler);

// Student: View past exam attempt history (supports both /history/my-attempts and /me/history)
router.get("/me/history", requireAuth, listStudentExamHistoryHandler);
router.get("/history/my-attempts", requireAuth, listStudentExamHistoryHandler);

// Student: Start a timed exam attempt (starts countdown & returns sanitized questions, supports /:id/start and /:id/attempts)
router.post(
  "/:id/attempts",
  requireAuth,
  requireRoles("STUDENT", "ADMIN", "SUPER_ADMIN"),
  startExamAttemptHandler
);
router.post(
  "/:id/start",
  requireAuth,
  requireRoles("STUDENT", "ADMIN", "SUPER_ADMIN"),
  startExamAttemptHandler
);

// Student: Submit complete exam attempt for server-side scoring
router.post(
  "/attempts/:id/submit",
  requireAuth,
  requireRoles("STUDENT"),
  validateBody(submitExamAttemptSchema),
  submitExamAttemptHandler
);

// Student & Admin: View specific attempt score and feedback review
router.get("/attempts/:id", requireAuth, getAttemptResultsHandler);

// ==========================================
// ADMIN CONFIGURATION
// ==========================================

// Admin creates a timed exam
router.post(
  "/",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(createExamSchema),
  createExamHandler
);

// Admin updates exam configuration
router.patch(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(updateExamSchema),
  updateExamHandler
);

// Admin deletes exam configuration
router.delete(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  deleteExamHandler
);

export default router;
