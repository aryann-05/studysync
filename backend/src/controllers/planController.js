import { StudyPlan } from "../models/StudyPlan.js";
import { Topic } from "../models/Topic.js";
import { StudySession } from "../models/StudySession.js";
import { formatDateOnly } from "../utils/dateUtils.js";
import { getUploadedFile } from "../services/uploadService.js";
import { parseSyllabusDocument } from "../services/nlpService.js";
import { createPlanWithHierarchy } from "../services/schedulingService.js";
import { reshuffleOverdueSessions } from "../services/reshuffleService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Extract topics and curriculum overview from an uploaded file:
 * POST /api/v1/plans/extract-topics
 */
export const extractTopics = async (req, res, next) => {
  try {
    const { file_id } = req.body;
    if (!file_id) {
      return sendError(res, "file_id is required.", "VALIDATION_ERROR", 422);
    }

    const fileRecord = getUploadedFile(file_id);
    const nlpData = await parseSyllabusDocument(fileRecord.file_path, fileRecord.original_name);

    return sendSuccess(res, "Topics and curriculum extracted successfully", {
      file_id,
      original_name: fileRecord.original_name,
      summary: nlpData.summary,
      modules: nlpData.modules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active study plan, topics, and schedule for authenticated user:
 * GET /api/v1/plans/active
 */
export const getActivePlan = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const plan = await StudyPlan.findOne({ user_id: userId, is_active: true }).sort({ created_at: -1 });
    if (!plan) {
      return sendSuccess(res, "No active study plan found", { plan: null });
    }

    const topics = await Topic.find({ plan_id: plan.plan_id });
    const sessions = await StudySession.find({ user_id: userId }).sort({ scheduled_date: 1 });

    const formattedSessions = sessions.map((s) => {
      const topic = topics.find((t) => t.topic_id === s.topic_id);
      return {
        session_id: s.session_id,
        topic_id: s.topic_id,
        topic_title: topic?.title || "Untitled Topic",
        scheduled_date: formatDateOnly(s.scheduled_date),
        duration_hours: Number(s.duration_hours),
        session_type: s.session_type,
        is_completed: s.is_completed,
        confidence_score: s.confidence_score,
        completed_at: s.completed_at ? s.completed_at.toISOString() : null,
      };
    });

    return sendSuccess(res, "Active study plan retrieved successfully", {
      plan: {
        plan_id: plan.plan_id,
        course_name: plan.course_name,
        start_date: formatDateOnly(plan.start_date),
        exam_date: formatDateOnly(plan.exam_date),
        is_active: plan.is_active,
        created_at: plan.created_at,
        topics: topics.map((t) => ({
          topic_id: t.topic_id,
          parent_topic_id: t.parent_topic_id,
          title: t.title,
          estimated_hours: Number(t.estimated_hours),
          difficulty_weight: Number(t.difficulty_weight),
          ease_factor: Number(t.ease_factor),
          repetition_number: t.repetition_number,
        })),
        sessions: formattedSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a new study plan with NLP parsing and capacity-checked scheduling:
 * POST /api/v1/plans/generate
 */
export const generatePlan = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { course_name, file_id, modules, start_date, exam_date, daily_max_hours } = req.body;

    const userDailyMax = daily_max_hours || Number(req.user.daily_max_hours) || 4.0;

    let targetModules = modules;
    if (!targetModules || !Array.isArray(targetModules) || targetModules.length === 0) {
      // 1. Retrieve file metadata
      const fileRecord = getUploadedFile(file_id);

      // 2. Parse syllabus via Python NLP service (or intelligent fallback)
      const nlpData = await parseSyllabusDocument(fileRecord.file_path, fileRecord.original_name);
      targetModules = nlpData.modules;
    }

    // 3. Atomically generate plan, topics, and initial schedule
    const result = await createPlanWithHierarchy(
      userId,
      {
        course_name,
        start_date,
        exam_date,
        daily_max_hours: userDailyMax,
      },
      targetModules
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

