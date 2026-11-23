import * as adminService from "../services/adminService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * GET /api/v1/admin/dashboard/stats
 * Retrieve comprehensive system overview statistics
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats(req.query);
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
    const {
      page,
      limit,
      search,
      role,
      status,
      account_type,
      course_name,
      specialization,
      sort_by,
      sort_order,
    } = req.query;

    const result = await adminService.getUsers({
      page,
      limit,
      search,
      role,
      status,
      account_type,
      course_name,
      specialization,
      sort_by,
      sort_order,
    });

    return sendSuccess(res, "Users retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:id
 * Retrieve individual user details & 12-section dossier
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
    const adminUserId = req.user.user_id;

    const updatedUser = await adminService.updateUser(id, req.body, adminUserId);

    return sendSuccess(res, "User updated successfully", updatedUser, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 * Activate, deactivate, or suspend a user account
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
 * PATCH /api/v1/admin/users/:id/role
 * Change user administrative role (super_admin, admin, moderator, user)
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminUserId = req.user.user_id;

    const result = await adminService.updateUserRole(id, { role }, adminUserId);

    return sendSuccess(res, `User role updated to ${result.role}`, result, 200);
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

/**
 * GET /api/v1/admin/categories
 * Retrieve academic category-wise analytics
 */
export const getCategories = async (req, res, next) => {
  try {
    const result = await adminService.getCategoriesAnalytics();
    return sendSuccess(res, "Academic categories analytics retrieved", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/categories/:categoryName/users
 * Retrieve users belonging to a specific academic category
 */
export const getCategoryUsers = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const { page, limit } = req.query;

    const result = await adminService.getCategoryUsers(categoryName, { page, limit });
    return sendSuccess(res, `Users for category '${categoryName}' retrieved`, result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/activity
 * Retrieve user activity feed & monitoring timeline
 */
export const getActivity = async (req, res, next) => {
  try {
    const { userId, activityType, startDate, endDate, search, page, limit } = req.query;
    const result = await adminService.getUserActivities({
      userId,
      activityType,
      startDate,
      endDate,
      search,
      page,
      limit,
    });

    return sendSuccess(res, "Activity logs retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/uploads
 * Retrieve all student and user uploads with associated user details
 */
export const getUploads = async (req, res, next) => {
  try {
    const { page, limit, search, file_type, category, moderation_status, user_id } = req.query;
    const result = await adminService.getUploads({
      page,
      limit,
      search,
      file_type,
      category,
      moderation_status,
      user_id,
    });

    return sendSuccess(res, "Uploads retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/uploads/:id
 * Retrieve details for a specific upload with user info
 */
export const getUploadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.getUploadById(id);

    return sendSuccess(res, "Upload details retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/uploads/:id/moderate
 * Moderate upload status (approve, flag, reject)
 */
export const moderateUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { moderation_status } = req.body;
    const adminUserId = req.user.user_id;

    const result = await adminService.moderateUpload(id, { moderation_status }, adminUserId);
    return sendSuccess(res, "Upload status updated", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/uploads/:id
 * Delete an uploaded file and remove its record
 */
export const deleteUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.user_id;
    const result = await adminService.deleteUpload(id, adminUserId);

    return sendSuccess(res, "Upload deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/tests
 * Test & examination analytics
 */
export const getTestAnalytics = async (req, res, next) => {
  try {
    const { userId, subject, status, search, page, limit } = req.query;
    const result = await adminService.getTestAnalytics({
      userId,
      subject,
      status,
      search,
      page,
      limit,
    });

    return sendSuccess(res, "Test performance analytics retrieved", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/learning
 * Learning Insights analytics
 */
export const getLearningAnalytics = async (req, res, next) => {
  try {
    const result = await adminService.getLearningAnalytics();
    return sendSuccess(res, "Learning analytics retrieved", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/engagement
 * User engagement & retention analytics
 */
export const getEngagementAnalytics = async (req, res, next) => {
  try {
    const result = await adminService.getEngagementAnalytics();
    return sendSuccess(res, "Engagement analytics retrieved", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/notifications
 * Admin notifications and alerts
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { filter, limit } = req.query;
    const result = await adminService.getAdminNotifications({ filter, limit });
    return sendSuccess(res, "Admin notifications retrieved", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/notifications/:id/read
 * Mark notification as read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.markNotificationRead(id);
    return sendSuccess(res, "Notification marked as read", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/notifications/mark-all-read
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await adminService.markAllNotificationsRead();
    return sendSuccess(res, "All notifications marked as read", result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/reports/export
 * Export reports in CSV or JSON format
 */
export const exportReport = async (req, res, next) => {
  try {
    const { report_type = "users", format = "csv", category } = req.query;
    const result = await adminService.exportReportData({
      reportType: report_type,
      format,
      category,
    });

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/security/audit-logs
 * Retrieve administrative audit logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAuditLogs({ page, limit });
    return sendSuccess(res, "Audit logs retrieved", result, 200);
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
  updateUserRole,
  deleteUser,
  getCategories,
  getCategoryUsers,
  getActivity,
  getUploads,
  getUploadById,
  moderateUpload,
  deleteUpload,
  getTestAnalytics,
  getLearningAnalytics,
  getEngagementAnalytics,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  exportReport,
  getAuditLogs,
};
