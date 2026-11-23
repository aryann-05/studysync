import { registerDeviceToken } from "../services/notificationService.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Handle device FCM token registration: POST /api/v1/notifications/token
 */
export const registerToken = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { token } = req.body;

    const record = await registerDeviceToken(userId, token);

    return sendSuccess(
      res,
      "FCM device token registered successfully",
      {
        token_id: record.token_id,
        user_id: record.user_id,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

