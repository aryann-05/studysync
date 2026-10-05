import { StudySession } from "../models/StudySession.js";
import { Topic } from "../models/Topic.js";
import { parseDateOnly, formatDateOnly } from "../utils/dateUtils.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Get calendar study sessions for the authenticated user (MongoDB):
 * GET /api/v1/calendar?date=YYYY-MM-DD OR ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
export const getCalendarSessions = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { date, start_date, end_date } = req.query;

    const query = {
      user_id: userId,
    };

    if (date) {
      const targetDate = parseDateOnly(date);
      query.scheduled_date = targetDate;
    } else if (start_date && end_date) {
      const start = parseDateOnly(start_date);
      const end = parseDateOnly(end_date);

      if (start > end) {
        return sendError(res, "start_date cannot be greater than end_date.", "INVALID_DATE_RANGE", 400);
      }

      query.scheduled_date = {
        $gte: start,
        $lte: end,
      };
    }

    const sessions = await StudySession.find(query).sort({ scheduled_date: 1, session_id: 1 });

    const formattedSessions = [];
    for (const s of sessions) {
      const topic = await Topic.findOne({ topic_id: s.topic_id });
      formattedSessions.push({
        session_id: s.session_id,
        topic_id: s.topic_id,
        topic_title: topic?.title || "Untitled Topic",
        scheduled_date: formatDateOnly(s.scheduled_date),
        duration_hours: Number(s.duration_hours),
        session_type: s.session_type,
        is_completed: s.is_completed,
        confidence_score: s.confidence_score,
        completed_at: s.completed_at ? s.completed_at.toISOString() : null,
      });
    }

    return sendSuccess(res, "Calendar sessions retrieved successfully", {
      sessions: formattedSessions,
    });
  } catch (error) {
    next(error);
  }
};
