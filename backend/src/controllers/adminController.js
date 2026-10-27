import * as adminService from "../services/adminService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * GET /api/v1/admin/dashboard/stats
 * Retrieve real API-driven system overview statistics
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, "Admin statistics retrieved successfully", stats, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users
 * Retrieve paginated list of registered users with search & filters
 */
export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, status, account_type } = req.query;
    const result = await adminService.getUsers({
      page,
      limit,
      search,
      role,
      status,
      account_type,
    });

    return sendSuccess(res, "Users retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:id
 * Retrieve individual user details & activity stats
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.getUserById(id);

    return sendSuccess(res, "User details retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id
 * Update permitted user information
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, email, daily_max_hours, account_type } = req.body;

    const updatedUser = await adminService.updateUser(id, {
      full_name,
      email,
      daily_max_hours,
      account_type,
    });

    return sendSuccess(res, "User updated successfully", updatedUser, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 * Activate or deactivate a user account
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminUserId = req.user.user_id;

    const result = await adminService.updateUserStatus(id, { status }, adminUserId);

    return sendSuccess(res, `User status updated to ${result.status}`, result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Delete a user account and associated study data
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.user_id;

    const result = await adminService.deleteUser(id, adminUserId);

    return sendSuccess(res, "User deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};

