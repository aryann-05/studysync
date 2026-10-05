/**
 * Standard API response helper functions adhering to StudySync SRS format
 */

export const sendSuccess = (res, message = "Success", data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (res, message = "An error occurred", errorCode = "INTERNAL_SERVER_ERROR", statusCode = 500, details = null) => {
  const payload = {
    status: "error",
    message,
    error: {
      code: errorCode,
    },
  };

  if (details && process.env.NODE_ENV !== "production") {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

