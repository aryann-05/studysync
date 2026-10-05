import { sendError } from "../utils/response.js";

/**
 * Centralized error-handling middleware complying with StudySync SRS format
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("❌ Application Error:", {
    name: err.name,
    message: err.message,
    status: err.status || err.statusCode,
    code: err.code,
    path: req.originalUrl,
    method: req.method,
  });

  // Handle Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, "File size exceeds the 15 MB limit.", "FILE_TOO_LARGE", 400);
    }
    return sendError(res, `Upload error: ${err.message}`, "UPLOAD_ERROR", 400);
  }

  // Handle SyntaxError (JSON parse errors)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(res, "Invalid JSON payload in request body.", "BAD_REQUEST", 400);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token.", "INVALID_TOKEN", 401);
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token has expired.", "TOKEN_EXPIRED", 401);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000 || (err.name === "MongoServerError" && err.code === 11000)) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    const message =
      field === "email"
        ? "An account with this email address already exists."
        : `A record with this ${field} already exists.`;
    return sendError(res, message, "DUPLICATE_EMAIL", 409);
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const firstMessage = Object.values(err.errors)[0]?.message || "Validation error";
    return sendError(res, firstMessage, "VALIDATION_ERROR", 422);
  }

  // Handle Mongoose Cast Error (Invalid ObjectId or format)
  if (err.name === "CastError") {
    return sendError(res, `Invalid format for field '${err.path}'`, "INVALID_FORMAT", 400);
  }

  // Default custom or internal server error
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected internal server error occurred.";

  return sendError(res, message, errorCode, statusCode, err.details || null);
};

export default errorHandler;
