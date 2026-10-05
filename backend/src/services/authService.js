import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Register a new user with 12 bcrypt salt rounds and MongoDB storage
 */
export const registerUser = async ({ full_name, email, password }) => {
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

  // Create user document
  const newUser = await User.create({
    full_name,
    email: normalizedEmail,
    password_hash,
    daily_max_hours: 4.0,
  });

  return {
    user_id: newUser.user_id,
    full_name: newUser.full_name,
    email: newUser.email,
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
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ user_id: user.user_id });

  return {
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      daily_max_hours: Number(user.daily_max_hours) || 4.0,
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

  const payload = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
  };

  const newAccessToken = generateAccessToken(payload);
  return { access_token: newAccessToken };
};
