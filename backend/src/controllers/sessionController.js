import { processSessionConfidence } from "../services/adaptiveLearningService.js";
import { sendSuccess } from "../utils/response.js";
import { logActivity } from "../services/activityService.js";

/**
 * Handle session completion and confidence rating:
 * POST /api/v1/sessions/confidence
 */
export const submitConfidence = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { session_id, confidence_score } = req.body;

    const result = await processSessionConfidence(userId, session_id, confidence_score);

    logActivity({
      userId,
      activityType: "study_session_complete",
      description: `Completed study session with confidence rating ${confidence_score}/5.`,
      metadata: { session_id, confidence_score, session_type: result?.session?.session_type },
    }).catch(() => {});

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

