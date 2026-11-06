
import { Router } from "express";
import {
  createQuestionHandler,
  bulkImportQuestionsHandler,
  updateQuestionHandler,
  deleteQuestionHandler,
  listQuestionsHandler,
  submitPracticeAnswerHandler,
} from "./question.controller.js";
import { requireAuth, requireRoles } from "../../common/middlewares/auth.middleware.js";
import { questionRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../common/middlewares/validate.middleware.js";
import {
  createQuestionSchema,
  updateQuestionSchema,
  submitAnswerSchema,
  listQuestionsQuerySchema,
} from "./question.schema.js";

const router = Router();

// Apply question rate limiter across practice and question bank routes
router.use(questionRateLimiter);

// Both students and admins can list questions (filtered & sanitized per role)
router.get(
  "/",
  requireAuth,
  validateQuery(listQuestionsQuerySchema),
  listQuestionsHandler
);

// Admin only: create a new question with options
router.post(
  "/",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(createQuestionSchema),
  createQuestionHandler
);

// Admin only: bulk import questions (JSON array or CSV text)
router.post(
  "/bulk-import",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  bulkImportQuestionsHandler
);

// Admin only: edit an existing question
router.patch(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(updateQuestionSchema),
  updateQuestionHandler
);

// Admin only: delete a question
router.delete(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  deleteQuestionHandler
);

// Student and Admin: submit practice answer (with atomic trial decrement & scoring)
// Accepts both /:id/answer and /:id/practice
router.post(
  ["/:id/answer", "/:id/practice"],
  requireAuth,
  requireRoles("STUDENT", "ADMIN", "SUPER_ADMIN"),
  validateBody(submitAnswerSchema),
  submitPracticeAnswerHandler
);

export default router;
