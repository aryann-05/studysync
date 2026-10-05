import { getUploadedFile } from "../services/uploadService.js";
import { parseSyllabusDocument } from "../services/nlpService.js";
import { createPlanWithHierarchy } from "../services/schedulingService.js";
import { reshuffleOverdueSessions } from "../services/reshuffleService.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Generate a new study plan with NLP parsing and capacity-checked scheduling:
 * POST /api/v1/plans/generate
 */
export const generatePlan = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { course_name, file_id, start_date, exam_date, daily_max_hours } = req.body;

    const userDailyMax = daily_max_hours || Number(req.user.daily_max_hours) || 4.0;

    // 1. Retrieve file metadata
    const fileRecord = getUploadedFile(file_id);

    // 2. Parse syllabus via Python NLP service (or intelligent fallback)
    const nlpData = await parseSyllabusDocument(fileRecord.file_path, fileRecord.original_name);

    // 3. Atomically generate plan, topics, and initial schedule
    const result = await createPlanWithHierarchy(
      userId,
      {
        course_name,
        start_date,
        exam_date,
        daily_max_hours: userDailyMax,
      },
      nlpData.modules
    );

    return sendSuccess(
      res,
      "Study plan generated successfully",
      {
        plan_id: result.plan.plan_id,
        course_name: result.plan.course_name,
        start_date,
        exam_date,
        daily_max_hours: userDailyMax,
        total_topics: result.totalTopics,
        total_hours: result.totalEffort,
        total_sessions: result.sessions.length,
        sessions: result.sessions,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reshuffle overdue sessions using academic priority algorithm:
 * POST /api/v1/plans/reshuffle
 */
export const reshufflePlan = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const result = await reshuffleOverdueSessions(userId);

    return sendSuccess(
      res,
      "Schedule successfully reshuffled.",
      result,
      200
    );
  } catch (error) {
    next(error);
  }
};

