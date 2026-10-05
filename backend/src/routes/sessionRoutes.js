import { Router } from "express";
import { submitConfidence } from "../controllers/sessionController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateConfidence } from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/confidence", authenticate, validateConfidence, submitConfidence);

export default router;

