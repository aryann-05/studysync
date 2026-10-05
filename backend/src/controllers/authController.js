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
    const { refresh_token } = req.body;
    const tokenData = await authService.refreshUserToken(refresh_token);

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

