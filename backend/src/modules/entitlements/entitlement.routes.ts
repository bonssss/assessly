import { Router } from "express";
import { entitlementService } from "./entitlement.service.js";
import { requireAuth } from "../../common/middlewares/auth.middleware.js";
import { globalRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";
import { sendSuccess } from "../../common/utils/response.js";
import { UnauthorizedError } from "../../common/errors/app-error.js";

const router = Router();

router.use(globalRateLimiter);

// Student: Check remaining free trial attempts and active paid entitlements
router.get("/status", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const status = await entitlementService.getStatus(req.user.id);
    sendSuccess(res, status);
  } catch (error) {
    next(error);
  }
});

export default router;
