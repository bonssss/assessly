import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  getMeHandler,
  updateProfileHandler,
} from "./auth.controller.js";
import { validateBody } from "../../common/middlewares/validate.middleware.js";
import { requireAuth } from "../../common/middlewares/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "./auth.schema.js";

const router = Router();

router.post("/register", validateBody(registerSchema), registerHandler);
router.post("/login", validateBody(loginSchema), loginHandler);
router.get("/me", requireAuth, getMeHandler);
router.patch("/me", requireAuth, validateBody(updateProfileSchema), updateProfileHandler);

export default router;
