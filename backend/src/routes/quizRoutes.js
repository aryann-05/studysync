import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  listQuizzes,
  getQuiz,
  submitQuiz,
} from "../controllers/quizController.js";

const router = Router();

// All quiz routes require authentication
router.use(authenticate);

// GET /api/v1/quizzes – List all quizzes for the user's active plan
router.get("/", listQuizzes);

// GET /api/v1/quizzes/:quiz_id – Get a specific quiz with its questions
router.get("/:quiz_id", getQuiz);

// POST /api/v1/quizzes/:quiz_id/submit – Submit quiz answers, get marks & topic focus feedback
router.post("/:quiz_id/submit", submitQuiz);

export default router;
