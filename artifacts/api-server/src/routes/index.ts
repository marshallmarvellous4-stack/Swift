import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import doctorsRouter from "./doctors.js";
import hospitalsRouter from "./hospitals.js";
import labsRouter from "./labs.js";
import pharmaciesRouter from "./pharmacies.js";
import educationRouter from "./education.js";
import chatRouter from "./chat.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(doctorsRouter);
router.use(hospitalsRouter);
router.use(labsRouter);
router.use(pharmaciesRouter);
router.use(educationRouter);
router.use(chatRouter);

export default router;
