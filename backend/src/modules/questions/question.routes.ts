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

// Student: submit practice answer (with atomic trial decrement & scoring)
router.post(
  "/:id/answer",
  requireAuth,
  requireRoles("STUDENT"),
  validateBody(submitAnswerSchema),
  submitPracticeAnswerHandler
);

export default router;
