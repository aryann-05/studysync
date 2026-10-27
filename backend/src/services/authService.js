import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Register a new user with 12 bcrypt salt rounds and MongoDB storage
 */
export const registerUser = async ({ full_name, email, password, role = "user" }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("An account with this email address already exists.");
    error.statusCode = 409;
    error.code = "DUPLICATE_EMAIL";
    throw error;
  }

  // Hash password with 12 salt rounds
  const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Allow role-based registration: admin or user (defaults to user)
  const assignedRole = role === "admin" ? "admin" : "user";
  const assignedAccountType = assignedRole === "admin" ? "regular" : "student";

  const newUser = await User.create({
    full_name,
    email: normalizedEmail,
    password_hash,
    daily_max_hours: 4.0,
    role: assignedRole,
    status: "active",
    account_type: assignedAccountType,
  });

  return {
    user_id: newUser.user_id,
    full_name: newUser.full_name,
    email: newUser.email,
    role: newUser.role || assignedRole,
    status: newUser.status || "active",
    account_type: newUser.account_type || assignedAccountType,
    daily_max_hours: newUser.daily_max_hours,
    created_at: newUser.created_at,
  };
};

/**
 * Login user and issue access (15m) and refresh (7d) JWT tokens
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Check account active status
  if (user.status === "inactive") {
    const error = new Error("Your account has been deactivated. Please contact an administrator.");
    error.statusCode = 403;
    error.code = "ACCOUNT_INACTIVE";
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const payload = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role || "user",
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ user_id: user.user_id });

  return {
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role || "user",
      status: user.status || "active",
      account_type: user.account_type || "student",
      daily_max_hours: Number(user.daily_max_hours) || 4.0,
      created_at: user.created_at,
    },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

/**
 * Refresh access token using valid refresh token
 */
export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required.");
    error.statusCode = 401;
    error.code = "MISSING_REFRESH_TOKEN";
    throw error;
  }

  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (err) {
    const error = new Error("Invalid or expired refresh token.");
    error.statusCode = 401;
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  const user = await User.findOne({ user_id: decoded.user_id });
  if (!user) {
    const error = new Error("User associated with token no longer exists.");
    error.statusCode = 401;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Check account status on refresh
  if (user.status === "inactive") {
    const error = new Error("Your account has been deactivated. Please contact an administrator.");
    error.statusCode = 403;
    error.code = "ACCOUNT_INACTIVE";
    throw error;
  }

  const payload = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role || "user",
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken({ user_id: user.user_id });

  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role || "user",
      status: user.status || "active",
      account_type: user.account_type || "student",
      daily_max_hours: Number(user.daily_max_hours) || 4.0,
      created_at: user.created_at,
    },
  };
};

/**
 * Retrieve current user session details
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findOne({ user_id: userId });
  if (!user) {
    const error = new Error("User session not found.");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role || "user",
    status: user.status || "active",
    account_type: user.account_type || "student",
    daily_max_hours: Number(user.daily_max_hours) || 4.0,
    created_at: user.created_at,
  };
};
