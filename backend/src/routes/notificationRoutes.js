import { Router } from "express";
import { registerToken } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateNotificationToken } from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/token", authenticate, validateNotificationToken, registerToken);

export default router;

