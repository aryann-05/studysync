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
      user = await User.findOne({ user_id: decoded.user_id }).select(
        "user_id email full_name daily_max_hours role status account_type"
      );
    } catch (dbErr) {
      // If DB lookup fails or in decoupled mode
    }

    if (user && (user.status === "inactive" || user.status === "suspended")) {
      const msg = user.status === "suspended"
        ? "Your account has been suspended by an administrator."
        : "Your account has been deactivated. Please contact an administrator.";
      return sendError(
        res,
        msg,
        user.status === "suspended" ? "ACCOUNT_SUSPENDED" : "ACCOUNT_INACTIVE",
        403
      );
    }

    // Touch last_active_at asynchronously
    if (user && typeof User.updateOne === "function") {
      User.updateOne({ user_id: user.user_id }, { $set: { last_active_at: new Date() } }).catch(() => {});
    }

    req.user = user
      ? {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role || decoded.role || "user",
          status: user.status || "active",
          account_type: user.account_type || "student",
          daily_max_hours: Number(user.daily_max_hours) || 4.0,
          course_name: user.course_name || "Computer Science",
          specialization: user.specialization || "Computer Science & Engineering",
          university_college: user.university_college || "",
        }
      : {
          user_id: decoded.user_id,
          email: decoded.email,
          full_name: decoded.full_name || "User",
          role: decoded.role || "user",
          status: "active",
          account_type: "student",
          daily_max_hours: 4.0,
          course_name: "Computer Science",
          specialization: "Computer Science & Engineering",
          university_college: "",
        };

    next();
  } catch (error) {
    return sendError(res, "Authentication error", "AUTHENTICATION_FAILED", 401, error.message);
  }
};

/**
 * Optional Authentication: Attaches req.user if a valid token is present,
 * but allows unauthenticated visitors to proceed with req.user = null.
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      req.user = null;
      return next();
    }

    if (decoded && decoded.user_id) {
      let user = null;
      try {
        user = await User.findOne({ user_id: decoded.user_id }).select(
          "user_id email full_name daily_max_hours role status account_type"
        );
      } catch {
        // DB lookup failure fallback
      }

      req.user = user
        ? {
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name,
            role: user.role || decoded.role || "user",
            status: user.status || "active",
            account_type: user.account_type || "student",
            daily_max_hours: Number(user.daily_max_hours) || 4.0,
          }
        : {
            user_id: decoded.user_id,
            email: decoded.email,
            full_name: decoded.full_name || "User",
            role: decoded.role || "user",
            status: "active",
            account_type: "student",
            daily_max_hours: 4.0,
          };
    } else {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Role-Based Authorization Middleware: Enforces that req.user has admin-tier privileges.
 * Supports: "super_admin", "admin", "moderator".
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(
      res,
      "Authentication required. Please log in.",
      "UNAUTHORIZED",
      401
    );
  }

  const allowedRoles = ["admin", "super_admin", "moderator"];
  if (!allowedRoles.includes(req.user.role)) {
    return sendError(
      res,
      "Access denied. Admin privileges required.",
      "FORBIDDEN",
      403
    );
  }

  next();
};

/**
 * Super Admin Authorization: Restricts access exclusively to "super_admin" and full "admin"
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(
      res,
      "Authentication required. Please log in.",
      "UNAUTHORIZED",
      401
    );
  }

  const allowedRoles = ["super_admin", "admin"];
  if (!allowedRoles.includes(req.user.role)) {
    return sendError(
      res,
      "Access denied. Super Administrator privileges required.",
      "FORBIDDEN",
      403
    );
  }

  next();
};

/**
 * Flexible RBAC middleware for custom role sets
 */
export const requireRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required.", "UNAUTHORIZED", 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of: ${roles.join(", ")}`,
        "FORBIDDEN",
        403
      );
    }
    next();
  };
};

export default authenticate;

