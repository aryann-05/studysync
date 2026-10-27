import bcrypt from "bcrypt";
import User from "../models/User.js";
import StudyPlan from "../models/StudyPlan.js";
import StudySession from "../models/StudySession.js";
import QuizAttempt from "../models/QuizAttempt.js";
import FcmToken from "../models/FcmToken.js";

/**
 * Fetch high-level statistics for Admin Dashboard Overview
 */
export const getDashboardStats = async () => {
  // Aggregate real stats from database
  let totalUsers = 0;
  let totalStudents = 0;
  let totalRegularUsers = 0;
  let activeUsers = 0;
  let inactiveUsers = 0;
  let totalAdmins = 0;
  let recentUsers = [];

  try {
    totalUsers = typeof User.countDocuments === "function"
      ? await User.countDocuments({})
      : (await User.find({})).length;

    totalStudents = typeof User.countDocuments === "function"
      ? await User.countDocuments({ account_type: "student" })
      : (await User.find({ account_type: "student" })).length;

    totalRegularUsers = typeof User.countDocuments === "function"
      ? await User.countDocuments({ account_type: "regular" })
      : (await User.find({ account_type: "regular" })).length;

    activeUsers = typeof User.countDocuments === "function"
      ? await User.countDocuments({ status: "active" })
      : (await User.find({ status: "active" })).length;

    inactiveUsers = typeof User.countDocuments === "function"
      ? await User.countDocuments({ status: "inactive" })
      : (await User.find({ status: "inactive" })).length;

    totalAdmins = typeof User.countDocuments === "function"
      ? await User.countDocuments({ role: "admin" })
      : (await User.find({ role: "admin" })).length;

    recentUsers = await User.find({})
      .sort({ created_at: -1 })
      .limit(6);
  } catch (err) {
    console.error("Error aggregating admin stats:", err.message);
  }

  // Format recent registrations
  const recentRegistrations = (recentUsers || []).map((u) => ({
    user_id: u.user_id,
    full_name: u.full_name,
    email: u.email,
    role: u.role || "user",
    status: u.status || "active",
    account_type: u.account_type || "student",
    created_at: u.created_at,
  }));

  return {
    total_users: totalUsers,
    total_students: totalStudents,
    total_regular_users: totalRegularUsers,
    active_users: activeUsers,
    inactive_users: inactiveUsers,
    total_admins: totalAdmins,
    recent_registrations: recentRegistrations,
  };
};

/**
 * List registered users with server-side pagination, search, and filtering
 */
export const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
  status,
  account_type,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (role && ["admin", "user"].includes(role.toLowerCase())) {
    filter.role = role.toLowerCase();
  }

  if (status && ["active", "inactive"].includes(status.toLowerCase())) {
    filter.status = status.toLowerCase();
  }

  if (account_type && ["student", "regular"].includes(account_type.toLowerCase())) {
    filter.account_type = account_type.toLowerCase();
  }

  const cleanSearch = (search || "").trim();
  if (cleanSearch) {
    filter.$or = [
      { full_name: new RegExp(cleanSearch, "i") },
      { email: new RegExp(cleanSearch, "i") },
    ];
  }

  let totalUsers = 0;
  let rawUsers = [];

  if (typeof User.countDocuments === "function") {
    totalUsers = await User.countDocuments(filter);
    rawUsers = await User.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum);
  } else {
    // Fallback in case driver doesn't implement countDocuments
    const allMatching = await User.find(filter);
    totalUsers = allMatching.length;
    rawUsers = allMatching.slice(skip, skip + limitNum);
  }

  const users = rawUsers.map((u) => ({
    user_id: u.user_id,
    full_name: u.full_name,
    email: u.email,
    role: u.role || "user",
    status: u.status || "active",
    account_type: u.account_type || "student",
    daily_max_hours: Number(u.daily_max_hours) || 4.0,
    created_at: u.created_at,
  }));

  const totalPages = Math.ceil(totalUsers / limitNum) || 1;

  return {
    users,
    pagination: {
      total_users: totalUsers,
      page: pageNum,
      limit: limitNum,
      total_pages: totalPages,
      has_next_page: pageNum < totalPages,
      has_prev_page: pageNum > 1,
    },
  };
};

/**
 * Retrieve user details by ID including associated study statistics
 */
export const getUserById = async (userId) => {
  const user = await User.findOne({ user_id: userId });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  let studyPlansCount = 0;
  let studySessionsCount = 0;
  let quizzesAttemptedCount = 0;

  try {
    if (StudyPlan) {
      studyPlansCount = typeof StudyPlan.countDocuments === "function"
        ? await StudyPlan.countDocuments({ user_id: userId })
        : (await StudyPlan.find({ user_id: userId })).length;
    }
    if (StudySession) {
      studySessionsCount = typeof StudySession.countDocuments === "function"
        ? await StudySession.countDocuments({ user_id: userId })
        : (await StudySession.find({ user_id: userId })).length;
    }
    if (QuizAttempt) {
      quizzesAttemptedCount = typeof QuizAttempt.countDocuments === "function"
        ? await QuizAttempt.countDocuments({ user_id: userId })
        : (await QuizAttempt.find({ user_id: userId })).length;
    }
  } catch (err) {
    console.warn("Could not aggregate user activity stats:", err.message);
  }

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
    stats: {
      study_plans_count: studyPlansCount,
      study_sessions_count: studySessionsCount,
      quizzes_attempted_count: quizzesAttemptedCount,
    },
  };
};

/**
 * Update permitted user information
 */
export const updateUser = async (
  userId,
  { full_name, email, daily_max_hours, account_type }
) => {
  const user = await User.findOne({ user_id: userId });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  const updates = {};

  if (full_name !== undefined) {
    const cleanName = String(full_name).trim();
    if (!cleanName) {
      const error = new Error("Full name cannot be empty.");
      error.statusCode = 400;
      error.code = "INVALID_NAME";
      throw error;
    }
    updates.full_name = cleanName;
  }

  if (email !== undefined) {
    const cleanEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      const error = new Error("Invalid email address format.");
      error.statusCode = 400;
      error.code = "INVALID_EMAIL";
      throw error;
    }

    if (cleanEmail !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing && existing.user_id !== userId) {
        const error = new Error("An account with this email address already exists.");
        error.statusCode = 409;
        error.code = "DUPLICATE_EMAIL";
        throw error;
      }
      updates.email = cleanEmail;
    }
  }

  if (daily_max_hours !== undefined) {
    const hours = Number(daily_max_hours);
    if (isNaN(hours) || hours < 0.5 || hours > 24) {
      const error = new Error("Daily max hours must be between 0.5 and 24.0.");
      error.statusCode = 400;
      error.code = "INVALID_HOURS";
      throw error;
    }
    updates.daily_max_hours = hours;
  }

  if (account_type !== undefined) {
    const cleanType = String(account_type).toLowerCase().trim();
    if (!["student", "regular"].includes(cleanType)) {
      const error = new Error("Account type must be 'student' or 'regular'.");
      error.statusCode = 400;
      error.code = "INVALID_ACCOUNT_TYPE";
      throw error;
    }
    updates.account_type = cleanType;
  }

  if (typeof User.updateOne === "function") {
    await User.updateOne({ user_id: userId }, { $set: updates });
  } else {
    Object.assign(user, updates);
  }

  const updatedUser = await User.findOne({ user_id: userId });

  return {
    user_id: updatedUser.user_id,
    full_name: updatedUser.full_name,
    email: updatedUser.email,
    role: updatedUser.role || "user",
    status: updatedUser.status || "active",
    account_type: updatedUser.account_type || "student",
    daily_max_hours: Number(updatedUser.daily_max_hours) || 4.0,
    created_at: updatedUser.created_at,
  };
};

/**
 * Update user account status (active / inactive)
 * Includes safeguard to prevent Admins from deactivating their own account
 */
export const updateUserStatus = async (userId, { status }, adminUserId) => {
  if (userId === adminUserId) {
    const error = new Error("You cannot change the status of your own admin account.");
    error.statusCode = 400;
    error.code = "SELF_STATUS_MODIFICATION";
    throw error;
  }

  const cleanStatus = String(status || "").toLowerCase().trim();
  if (!["active", "inactive"].includes(cleanStatus)) {
    const error = new Error("Status must be either 'active' or 'inactive'.");
    error.statusCode = 400;
    error.code = "INVALID_STATUS";
    throw error;
  }

  const user = await User.findOne({ user_id: userId });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  if (typeof User.updateOne === "function") {
    await User.updateOne({ user_id: userId }, { $set: { status: cleanStatus } });
  } else {
    user.status = cleanStatus;
  }

  const updated = await User.findOne({ user_id: userId });

  return {
    user_id: updated.user_id,
    full_name: updated.full_name,
    email: updated.email,
    role: updated.role || "user",
    status: updated.status,
    account_type: updated.account_type || "student",
  };
};

/**
 * Delete user account and associated records
 * Includes safeguard to prevent Admins from deleting their own account
 */
export const deleteUser = async (userId, adminUserId) => {
  if (userId === adminUserId) {
    const error = new Error("You cannot delete your own admin account.");
    error.statusCode = 400;
    error.code = "SELF_DELETION_DENIED";
    throw error;
  }

  const user = await User.findOne({ user_id: userId });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Cascading cleanup of dependent entities
  try {
    if (StudyPlan && typeof StudyPlan.deleteMany === "function") {
      await StudyPlan.deleteMany({ user_id: userId });
    }
    if (StudySession && typeof StudySession.deleteMany === "function") {
      await StudySession.deleteMany({ user_id: userId });
    }
    if (QuizAttempt && typeof QuizAttempt.deleteMany === "function") {
      await QuizAttempt.deleteMany({ user_id: userId });
    }
    if (FcmToken && typeof FcmToken.deleteMany === "function") {
      await FcmToken.deleteMany({ user_id: userId });
    }
    if (typeof User.deleteOne === "function") {
      await User.deleteOne({ user_id: userId });
    }
  } catch (err) {
    console.error("Error deleting user associations:", err.message);
  }

  return {
    user_id: userId,
    full_name: user.full_name,
    email: user.email,
  };
};

/**
 * Securely provision an initial default Admin account if no admin exists
 */
export const provisionDefaultAdmin = async () => {
  if (process.env.PROVISION_DEMO_ADMIN !== "true") {
    return null;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@studysync.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    return existingAdmin;
  }

  const existingUserByEmail = await User.findOne({ email: adminEmail });
  if (existingUserByEmail) {
    if (typeof User.updateOne === "function") {
      await User.updateOne({ email: adminEmail }, { $set: { role: "admin", status: "active" } });
    }
    return existingUserByEmail;
  }

  const password_hash = await bcrypt.hash(adminPassword, 12);
  const adminUser = await User.create({
    full_name: "StudySync Admin",
    email: adminEmail,
    password_hash,
    role: "admin",
    status: "active",
    account_type: "regular",
    daily_max_hours: 4.0,
  });

  console.log(`✅ Default Admin account provisioned: ${adminEmail}`);
  return adminUser;
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  provisionDefaultAdmin,
};

