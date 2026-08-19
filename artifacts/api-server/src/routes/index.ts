import { Router, type IRouter } from "express";
import healthRouter from "./health";
import varHrRouter from "./var-hr";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(varHrRouter);

export default router;
