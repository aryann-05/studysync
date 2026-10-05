import { Router } from "express";
import { getCalendarSessions } from "../controllers/calendarController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getCalendarSessions);

export default router;

