import { sendError } from "../utils/response.js";
import { daysDifference } from "../utils/dateUtils.js";

/**
 * Validate user registration payload
 */
export const validateRegister = (req, res, next) => {
  const { full_name, email, password } = req.body;

  if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
    return sendError(res, "full_name is required and must be at least 2 characters.", "VALIDATION_ERROR", 422);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return sendError(res, "A valid email address is required.", "VALIDATION_ERROR", 422);
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return sendError(res, "Password must be at least 8 characters long.", "VALIDATION_ERROR", 422);
  }

  req.body.full_name = full_name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate user login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Both email and password are required.", "VALIDATION_ERROR", 422);
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate study plan generation payload
 */
export const validatePlanGeneration = (req, res, next) => {
  const { course_name, file_id, start_date, exam_date, daily_max_hours } = req.body;

  if (!course_name || typeof course_name !== "string" || course_name.trim().length === 0) {
    return sendError(res, "course_name is required.", "VALIDATION_ERROR", 422);
  }

  if (!file_id || typeof file_id !== "string") {
    return sendError(res, "file_id is required.", "VALIDATION_ERROR", 422);
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!start_date || !dateRegex.test(start_date)) {
    return sendError(res, "start_date is required in YYYY-MM-DD format.", "VALIDATION_ERROR", 422);
  }

  if (!exam_date || !dateRegex.test(exam_date)) {
    return sendError(res, "exam_date is required in YYYY-MM-DD format.", "VALIDATION_ERROR", 422);
  }

  const daysDiff = daysDifference(start_date, exam_date);
  if (daysDiff <= 0) {
    return sendError(res, "exam_date must be strictly after start_date.", "VALIDATION_ERROR", 400);
  }

  if (daily_max_hours !== undefined) {
    const hours = Number(daily_max_hours);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      return sendError(res, "daily_max_hours must be a positive number between 0.5 and 24.", "VALIDATION_ERROR", 422);
    }
    req.body.daily_max_hours = hours;
  }

  next();
};

/**
 * Validate confidence rating submission
 */
export const validateConfidence = (req, res, next) => {
  const { session_id, confidence_score } = req.body;

  if (!session_id || typeof session_id !== "string") {
    return sendError(res, "session_id is required.", "VALIDATION_ERROR", 422);
  }

  const score = Number(confidence_score);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return sendError(res, "confidence_score must be an integer between 1 and 5.", "VALIDATION_ERROR", 400);
  }

  req.body.confidence_score = score;
  next();
};

/**
 * Validate FCM device token registration
 */
export const validateNotificationToken = (req, res, next) => {
  const { token } = req.body;

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return sendError(res, "token is required.", "VALIDATION_ERROR", 422);
  }

  req.body.token = token.trim();
  next();
};

