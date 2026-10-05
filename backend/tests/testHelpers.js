import bcrypt from "bcrypt";
import { generateAccessToken } from "../src/utils/jwt.js";
import User from "../src/models/User.js";
import { resetMockDb } from "./mockDb.js";

export const resetDatabase = () => {
  resetMockDb();
};

export const createTestUser = async (overrides = {}) => {
  const rawPassword = overrides.password || "Password@123";
  const password_hash = await bcrypt.hash(rawPassword, 12);

  const userData = {
    email: overrides.email || `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
    full_name: overrides.full_name || "Test User",
    password_hash,
    daily_max_hours: overrides.daily_max_hours || 4.0,
  };

  const user = await User.create(userData);

  const token = generateAccessToken({
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
  });

  return { user, token, rawPassword };
};
