import { StudyPlan } from "../models/StudyPlan.js";
import {
  getQuizzesForUser,
  getQuizDetails,
  gradeAndSubmitQuiz,
  getAggregatedFocusTopics,
} from "../services/quizService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { formatDateOnly } from "../utils/dateUtils.js";

/**
 * List all quizzes for the user's active study plan
 * GET /api/v1/quizzes
 */
export const listQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    let planId = req.query.plan_id;

    if (!planId) {
      const activePlan = await StudyPlan.findOne({ user_id: userId, is_active: true }).sort({ created_at: -1 });
      if (!activePlan) {
        return sendSuccess(res, "No active study plan found", {
          plan: null,
          quizzes: [],
          focus_topics: [],
        });
      }
      planId = activePlan.plan_id;
    }

    const plan = await StudyPlan.findOne({ plan_id: planId });
    if (!plan) {
      return sendError(res, "Study plan not found", "PLAN_NOT_FOUND", 404);
    }

    const quizzes = await getQuizzesForUser(userId, planId);
    const focusTopics = await getAggregatedFocusTopics(userId, planId);

    return sendSuccess(res, "Quizzes retrieved successfully", {
      plan: {
        plan_id: plan.plan_id,
        course_name: plan.course_name,
        start_date: formatDateOnly(plan.start_date),
        exam_date: formatDateOnly(plan.exam_date),
      },
      quizzes,
      focus_topics: focusTopics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single quiz details and questions
 * GET /api/v1/quizzes/:quiz_id
 */
export const getQuiz = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { quiz_id } = req.params;

    const quiz = await getQuizDetails(quiz_id, userId);
    return sendSuccess(res, "Quiz details retrieved successfully", quiz);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit quiz answers, calculate marks, and generate focus feedback
 * POST /api/v1/quizzes/:quiz_id/submit
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { quiz_id } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return sendError(res, "Answers array is required", "VALIDATION_ERROR", 422);
    }

    const result = await gradeAndSubmitQuiz(userId, quiz_id, answers);
    return sendSuccess(res, "Quiz evaluated successfully", result);
  } catch (error) {
    next(error);
  }
};

export default {
  listQuizzes,
  getQuiz,
  submitQuiz,
};
