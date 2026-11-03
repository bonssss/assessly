import { Router } from "express";
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import questionRoutes from "./modules/questions/question.routes.js";
import examRoutes from "./modules/exams/exam.routes.js";
import entitlementRoutes from "./modules/entitlements/entitlement.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import resourceRoutes from "./modules/resources/resource.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/departments", departmentRoutes);
apiRouter.use("/questions", questionRoutes);
apiRouter.use("/exams", examRoutes);
apiRouter.use("/entitlements", entitlementRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/resources", resourceRoutes);
apiRouter.use("/admin", adminRoutes);

export default apiRouter;

