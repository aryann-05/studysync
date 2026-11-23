import { Router } from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getAnalytics);

export default router;

