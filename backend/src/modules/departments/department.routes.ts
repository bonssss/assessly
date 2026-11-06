import { Router } from "express";
import {
  listDepartmentsHandler,
  createDepartmentHandler,
} from "./department.controller.js";
import { requireAuth, requireRoles } from "../../common/middlewares/auth.middleware.js";
import { globalRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";

const router = Router();

router.use(globalRateLimiter);

// Public: Guests can view active departments during registration
router.get("/", listDepartmentsHandler);

// Admin only: Create a department
router.post("/", requireAuth, requireRoles("ADMIN", "SUPER_ADMIN"), createDepartmentHandler);

export default router;
