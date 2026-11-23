import { Router } from "express";
import * as planController from "../controllers/planController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validatePlanGeneration } from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/extract-topics", authenticate, planController.extractTopics);
router.get("/active", authenticate, planController.getActivePlan);
router.post("/generate", authenticate, validatePlanGeneration, planController.generatePlan);
router.post("/reshuffle", authenticate, planController.reshufflePlan);

export default router;

