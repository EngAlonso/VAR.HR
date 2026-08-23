import { Router, type IRouter } from "express";
import healthRouter from "./health";
import varHrRouter from "./var-hr";
import authRouter from "./auth";
import backupsRouter from "./backups";
import platformAdminRouter from "./platform-admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(backupsRouter);
router.use(platformAdminRouter);
router.use(varHrRouter);

export default router;
