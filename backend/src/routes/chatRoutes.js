import express from "express";
import chatController from "../controllers/chatController.js";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/v1/chat
 * @desc    Generate AI chatbot response with conversation history context
 * @access  Public / Optional Authenticated
 */
router.post("/", optionalAuthenticate, chatController.sendMessage);

export default router;

