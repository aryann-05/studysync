import * as authService from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Handle user registration: POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;
    const user = await authService.registerUser({ full_name, email, password });

    return sendSuccess(
      res,
      "User registered successfully",
      {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login: POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const authData = await authService.loginUser({ email, password });

    if (res.cookie && authData.refresh_token) {
      res.cookie("refresh_token", authData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return sendSuccess(
      res,
      "Login successful",
      authData,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Handle access token refresh: POST /api/v1/auth/refresh
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token =
      req.body.refresh_token ||
      req.cookies?.refresh_token ||
      req.headers["x-refresh-token"];

    const tokenData = await authService.refreshUserToken(token);

    if (res.cookie && tokenData.refresh_token) {
      res.cookie("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return sendSuccess(
      res,
      "Token refreshed successfully",
      tokenData,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Handle retrieving current authenticated user session: GET /api/v1/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const userData = await authService.getCurrentUser(userId);

    return sendSuccess(
      res,
      "User session retrieved successfully",
      userData,
      200
    );
  } catch (error) {
    next(error);
  }
};

