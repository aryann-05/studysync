import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";
import User from "../models/User.js";

/**
 * Authentication Middleware: Enforces valid Bearer JWT on protected endpoints
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        "Authentication required. Missing or malformed Authorization header.",
        "UNAUTHORIZED",
        401
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendError(res, "Access token has expired. Please refresh your session.", "TOKEN_EXPIRED", 401);
      }
      return sendError(res, "Invalid authentication token.", "INVALID_TOKEN", 401);
    }

    if (!decoded || !decoded.user_id) {
      return sendError(res, "Invalid token payload.", "INVALID_TOKEN", 401);
    }

    // Attach authenticated identity to req.user
    let user = null;
    try {
      user = await User.findOne({ user_id: decoded.user_id }).select("user_id email full_name daily_max_hours");
    } catch (dbErr) {
      // If DB lookup fails or in decoupled mode
    }

    req.user = user
      ? {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          daily_max_hours: Number(user.daily_max_hours) || 4.0,
        }
      : {
          user_id: decoded.user_id,
          email: decoded.email,
          full_name: decoded.full_name || "User",
          daily_max_hours: 4.0,
        };

    next();
  } catch (error) {
    return sendError(res, "Authentication error", "AUTHENTICATION_FAILED", 401, error.message);
  }
};

export default authenticate;
