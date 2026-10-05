import { getUserAnalytics } from "../services/analyticsService.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Handle analytics retrieval: GET /api/v1/analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const analytics = await getUserAnalytics(userId);

    return sendSuccess(
      res,
      "Analytics retrieved successfully",
      analytics,
      200
    );
  } catch (error) {
    next(error);
  }
};

