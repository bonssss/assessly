import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  getMeHandler,
  updateProfileHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler,
} from "./auth.controller.js";
import { validateBody } from "../../common/middlewares/validate.middleware.js";
import { requireAuth } from "../../common/middlewares/auth.middleware.js";
import { authRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.schema.js";

const router = Router();

// Rate limit all auth and credential endpoints against brute-force attacks
router.use(authRateLimiter);

router.post("/register", validateBody(registerSchema), registerHandler);
router.post("/login", validateBody(loginSchema), loginHandler);
router.get("/me", requireAuth, getMeHandler);
router.patch("/me", requireAuth, validateBody(updateProfileSchema), updateProfileHandler);

// Password recovery & credential management
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPasswordHandler);
router.post("/reset-password", validateBody(resetPasswordSchema), resetPasswordHandler);
router.post("/change-password", requireAuth, validateBody(changePasswordSchema), changePasswordHandler);

export default router;
