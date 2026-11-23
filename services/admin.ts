import { get, patch, del, post } from "./api";
import type {
  ApiResponse,
  AdminDashboardStats,
  AdminUsersResponse,
  AdminUserDetailResponse,
  AdminUser,
  AdminUploadItem,
  AdminUploadsResponse,
  CategoriesAnalyticsResponse,
  CategoryUsersResponse,
  ActivityAnalyticsResponse,
  TestAnalyticsResponse,
  LearningAnalyticsResponse,
  EngagementAnalyticsResponse,
  NotificationsResponse,
  AuditLogsResponse,
} from "@/types";

/**
 * Fetch overview statistics for Super Admin Dashboard
 */
export async function getDashboardStats(params?: {
  range?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AdminDashboardStats>> {
  try {
    const query = new URLSearchParams();
    if (params?.range) query.set("range", params.range);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await get<{
      status: string;
      message: string;
      data: AdminDashboardStats;
    }>(`/admin/dashboard/stats${queryString}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Fetch paginated, filterable list of registered users
 */
export async function getUsers({
  page = 1,
  limit = 10,
  search = "",
  role,
  status,
  account_type,
  course_name,
  specialization,
  sort_by = "created_at",
  sort_order = "desc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  account_type?: string;
  course_name?: string;
  specialization?: string;
  sort_by?: string;
  sort_order?: string;
} = {}): Promise<ApiResponse<AdminUsersResponse>> {
  try {
    const query = new URLSearchParams();
    if (page) query.set("page", String(page));
    if (limit) query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (role && role !== "all") query.set("role", role);
    if (status && status !== "all") query.set("status", status);
    if (account_type && account_type !== "all") query.set("account_type", account_type);
    if (course_name && course_name !== "all") query.set("course_name", course_name);
    if (specialization && specialization !== "all") query.set("specialization", specialization);
    if (sort_by) query.set("sort_by", sort_by);
    if (sort_order) query.set("sort_order", sort_order);

    const res = await get<{
      status: string;
      message: string;
      data: AdminUsersResponse;
    }>(`/admin/users?${query.toString()}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Retrieve individual user complete profile dossier (12 sections)
 */
export async function getUserById(
  id: string
): Promise<ApiResponse<AdminUserDetailResponse>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: AdminUserDetailResponse;
    }>(`/admin/users/${id}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Update user details
 */
export async function updateUser(
  id: string,
  data: Partial<AdminUser>
): Promise<ApiResponse<AdminUser>> {
  try {
    const res = await patch<{
      status: string;
      message: string;
      data: AdminUser;
    }>(`/admin/users/${id}`, data);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Toggle user account status (active, inactive, suspended)
 */
export async function updateUserStatus(
  id: string,
  status: "active" | "inactive" | "suspended"
): Promise<ApiResponse<{ user_id: string; status: string }>> {
  try {
    const res = await patch<{
      status: string;
      message: string;
      data: { user_id: string; status: string };
    }>(`/admin/users/${id}/status`, { status });

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Update user administrative role (super_admin, admin, moderator, user)
 */
export async function updateUserRole(
  id: string,
  role: "super_admin" | "admin" | "moderator" | "user"
): Promise<ApiResponse<{ user_id: string; role: string }>> {
  try {
    const res = await patch<{
      status: string;
      message: string;
      data: { user_id: string; role: string };
    }>(`/admin/users/${id}/role`, { role });

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Delete user account with cascading cleanup
 */
export async function deleteUser(
  id: string
): Promise<ApiResponse<{ user_id: string }>> {
  try {
    const res = await del<{
      status: string;
      message: string;
      data: { user_id: string };
    }>(`/admin/users/${id}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Academic Category Analytics
 */
export async function getCategories(): Promise<ApiResponse<CategoriesAnalyticsResponse>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: CategoriesAnalyticsResponse;
    }>("/admin/categories");

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Get users belonging to a specific category
 */
export async function getCategoryUsers(
  categoryName: string,
  params?: { page?: number; limit?: number }
): Promise<ApiResponse<CategoryUsersResponse>> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await get<{
      status: string;
      message: string;
      data: CategoryUsersResponse;
    }>(`/admin/categories/${encodeURIComponent(categoryName)}/users?${query.toString()}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * User Activity Logs & Timeline
 */
export async function getUserActivities({
  userId,
  activityType,
  startDate,
  endDate,
  search,
  page = 1,
  limit = 25,
}: {
  userId?: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<ActivityAnalyticsResponse>> {
  try {
    const query = new URLSearchParams();
    if (userId) query.set("userId", userId);
    if (activityType) query.set("activityType", activityType);
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);
    if (search) query.set("search", search);
    if (page) query.set("page", String(page));
    if (limit) query.set("limit", String(limit));

    const res = await get<{
      status: string;
      message: string;
      data: ActivityAnalyticsResponse;
    }>(`/admin/activity?${query.toString()}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * User Uploads Management
 */
export async function getAdminUploads({
  page = 1,
  limit = 10,
  search = "",
  file_type = "all",
  category = "all",
  moderation_status = "all",
  user_id = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  file_type?: string;
  category?: string;
  moderation_status?: string;
  user_id?: string;
} = {}): Promise<ApiResponse<AdminUploadsResponse>> {
  try {
    const query = new URLSearchParams();
    if (page) query.set("page", String(page));
    if (limit) query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (file_type && file_type !== "all") query.set("file_type", file_type);
    if (category && category !== "all") query.set("category", category);
    if (moderation_status && moderation_status !== "all") query.set("moderation_status", moderation_status);
    if (user_id) query.set("user_id", user_id);

    const res = await get<{
      status: string;
      message: string;
      data: AdminUploadsResponse;
    }>(`/admin/uploads?${query.toString()}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Get upload by ID
 */
export async function getAdminUploadById(id: string): Promise<ApiResponse<AdminUploadItem>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: AdminUploadItem;
    }>(`/admin/uploads/${id}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Moderate an upload (approve, flag, reject)
 */
export async function moderateAdminUpload(
  id: string,
  moderation_status: "approved" | "pending" | "flagged" | "rejected"
): Promise<ApiResponse<{ upload_id: string; moderation_status: string }>> {
  try {
    const res = await patch<{
      status: string;
      message: string;
      data: { upload_id: string; moderation_status: string };
    }>(`/admin/uploads/${id}/moderate`, { moderation_status });

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Delete upload
 */
export async function deleteAdminUpload(id: string): Promise<ApiResponse<{ upload_id: string }>> {
  try {
    const res = await del<{
      status: string;
      message: string;
      data: { upload_id: string };
    }>(`/admin/uploads/${id}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Test Management & Performance Analytics
 */
export async function getTestAnalytics({
  userId,
  subject,
  status,
  search,
  page = 1,
  limit = 20,
}: {
  userId?: string;
  subject?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<TestAnalyticsResponse>> {
  try {
    const query = new URLSearchParams();
    if (userId) query.set("userId", userId);
    if (subject && subject !== "all") query.set("subject", subject);
    if (status && status !== "all") query.set("status", status);
    if (search) query.set("search", search);
    if (page) query.set("page", String(page));
    if (limit) query.set("limit", String(limit));

    const res = await get<{
      status: string;
      message: string;
      data: TestAnalyticsResponse;
    }>(`/admin/tests?${query.toString()}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Learning Insights Analytics
 */
export async function getLearningAnalytics(): Promise<ApiResponse<LearningAnalyticsResponse>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: LearningAnalyticsResponse;
    }>("/admin/learning");

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * User Engagement & Retention Analytics
 */
export async function getEngagementAnalytics(): Promise<ApiResponse<EngagementAnalyticsResponse>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: EngagementAnalyticsResponse;
    }>("/admin/engagement");

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Admin Notifications
 */
export async function getAdminNotifications(filter = "all"): Promise<ApiResponse<NotificationsResponse>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: NotificationsResponse;
    }>(`/admin/notifications?filter=${filter}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

export async function markNotificationRead(id: string): Promise<ApiResponse<any>> {
  try {
    const res = await patch<any>(`/admin/notifications/${id}/read`, {});
    return { success: true, data: res.data };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

export async function markAllNotificationsRead(): Promise<ApiResponse<any>> {
  try {
    const res = await post<any>("/admin/notifications/mark-all-read", {});
    return { success: true, data: res.data };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

/**
 * Security & Audit Logs
 */
export async function getAuditLogs(page = 1, limit = 30): Promise<ApiResponse<AuditLogsResponse>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: AuditLogsResponse;
    }>(`/admin/security/audit-logs?page=${page}&limit=${limit}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw err;
  }
}

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getCategories,
  getCategoryUsers,
  getUserActivities,
  getAdminUploads,
  getAdminUploadById,
  moderateAdminUpload,
  deleteAdminUpload,
  getTestAnalytics,
  getLearningAnalytics,
  getEngagementAnalytics,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAuditLogs,
};
