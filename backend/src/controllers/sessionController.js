import { processSessionConfidence } from "../services/adaptiveLearningService.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Handle session completion and confidence rating:
 * POST /api/v1/sessions/confidence
 */
export const submitConfidence = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { session_id, confidence_score } = req.body;

    const result = await processSessionConfidence(userId, session_id, confidence_score);

    return sendSuccess(
      res,
      "Session completed and learning parameters updated",
      result,
      200
    );
  } catch (error) {
    next(error);
  }
};

