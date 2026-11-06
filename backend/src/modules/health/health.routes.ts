import { Router } from "express";
import { getHealth } from "./health.controller.js";
import { globalRateLimiter } from "../../common/middlewares/rate-limiter.middleware.js";

const router = Router();

router.use(globalRateLimiter);
router.get("/", getHealth);

export default router;
