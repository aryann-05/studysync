import { FcmToken } from "../models/FcmToken.js";
import messaging from "../config/firebase.js";

/**
 * Register or update an FCM device token for an authenticated user (MongoDB)
 */
export const registerDeviceToken = async (userId, token) => {
  const existing = await FcmToken.findOne({
    user_id: userId,
    token,
  });

  if (existing) {
    return existing;
  }

  const record = await FcmToken.create({
    user_id: userId,
    token,
  });

  return record;
};

/**
 * Send study session reminder push notification (e.g. 30 minutes before session)
 */
export const sendSessionReminder = async (userId, session) => {
  const tokens = await FcmToken.find({ user_id: userId }).select("token");

  if (tokens.length === 0) {
    return { success: false, reason: "No device tokens registered for this user." };
  }

  const registrationTokens = tokens.map((t) => t.token);
  const topicTitle = session?.topic?.title || "Upcoming Topic";

  const messagePayload = {
    notification: {
      title: "StudySync Reminder ⏰",
      body: `Your study session for "${topicTitle}" starts in 30 minutes!`,
    },
    data: {
      sessionId: String(session?.session_id || ""),
      topicTitle: String(topicTitle),
      scheduledDate: String(session?.scheduled_date || ""),
    },
  };

  if (messaging) {
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: registrationTokens,
        ...messagePayload,
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (err) {
      console.error("FCM dispatch error:", err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(
      `[FCM SIMULATION] Push notification sent to user ${userId} for session '${topicTitle}':`,
      messagePayload.notification
    );
    return {
      success: true,
      simulated: true,
      tokensTargeted: registrationTokens.length,
    };
  }
};

export default {
  registerDeviceToken,
  sendSessionReminder,
};
