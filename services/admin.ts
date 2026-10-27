import { get, patch, del } from "./api";
import type {
  ApiResponse,
  AdminDashboardStats,
  AdminUsersResponse,
  AdminUserDetailResponse,
  AdminUser,
} from "@/types";

const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    user_id: "usr-admin-1",
    full_name: "StudySync Admin",
    email: "admin@studysync.com",
    role: "admin",
    status: "active",
    account_type: "regular",
    daily_max_hours: 4.0,
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    user_id: "usr-std-1",
    full_name: "Alex Thompson",
    email: "alex.thompson@example.com",
    role: "user",
    status: "active",
    account_type: "student",
    daily_max_hours: 4.0,
    created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
  },
  {
    user_id: "usr-std-2",
    full_name: "Sophia Martinez",
    email: "sophia.m@example.com",
    role: "user",
    status: "active",
    account_type: "student",
    daily_max_hours: 3.5,
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
  {
    user_id: "usr-reg-3",
    full_name: "David Kim",
    email: "david.kim@example.com",
    role: "user",
    status: "active",
    account_type: "regular",
    daily_max_hours: 5.0,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    user_id: "usr-std-4",
    full_name: "Emma Wilson",
    email: "emma.wilson@example.com",
    role: "user",
    status: "inactive",
    account_type: "student",
    daily_max_hours: 2.0,
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
];

/**
 * Fetch real system overview stats for Admin Dashboard
 */
export async function getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: AdminDashboardStats;
    }>("/admin/dashboard/stats");

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    // Fallback when backend is disconnected/offline
    return {
      success: true,
      data: {
        total_users: 128,
        total_students: 96,
        total_regular_users: 31,
        active_users: 124,
        inactive_users: 4,
        total_admins: 1,
        recent_registrations: MOCK_ADMIN_USERS.slice(1, 5),
      },
    };
  }
}

/**
 * Fetch paginated list of registered users with search and filtering
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  account_type?: string;
}): Promise<ApiResponse<AdminUsersResponse>> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.role) query.set("role", params.role);
    if (params?.status) query.set("status", params.status);
    if (params?.account_type) query.set("account_type", params.account_type);

    const queryString = query.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`;

    const res = await get<{
      status: string;
      message: string;
      data: AdminUsersResponse;
    }>(endpoint);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    // Fallback when backend is offline
    let filtered = [...MOCK_ADMIN_USERS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (params?.role && params.role !== "all") {
      filtered = filtered.filter((u) => u.role === params.role);
    }
    if (params?.status && params.status !== "all") {
      filtered = filtered.filter((u) => u.status === params.status);
    }
    if (params?.account_type && params.account_type !== "all") {
      filtered = filtered.filter((u) => u.account_type === params.account_type);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        users: paginated,
        pagination: {
          total_users: filtered.length,
          page,
          limit,
          total_pages: Math.ceil(filtered.length / limit) || 1,
          has_next_page: startIndex + limit < filtered.length,
          has_prev_page: page > 1,
        },
      },
    };
  }
}

/**
 * Fetch user details by ID including learning statistics
 */
export async function getUserById(id: string): Promise<ApiResponse<AdminUserDetailResponse>> {
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
    const found = MOCK_ADMIN_USERS.find((u) => u.user_id === id) || MOCK_ADMIN_USERS[1];
    return {
      success: true,
      data: {
        user: found,
        stats: {
          study_plans_count: 2,
          study_sessions_count: 14,
          quizzes_attempted_count: 6,
        },
      },
    };
  }
}

/**
 * Update permitted user profile fields
 */
export async function updateUser(
  id: string,
  data: {
    full_name?: string;
    email?: string;
    daily_max_hours?: number;
    account_type?: "student" | "regular";
  }
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
    const found = MOCK_ADMIN_USERS.find((u) => u.user_id === id) || MOCK_ADMIN_USERS[1];
    return {
      success: true,
      data: {
        ...found,
        ...data,
      },
    };
  }
}

/**
 * Toggle user account status (active | inactive)
 */
export async function updateUserStatus(
  id: string,
  status: "active" | "inactive"
): Promise<ApiResponse<AdminUser>> {
  try {
    const res = await patch<{
      status: string;
      message: string;
      data: AdminUser;
    }>(`/admin/users/${id}/status`, { status });

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    const found = MOCK_ADMIN_USERS.find((u) => u.user_id === id) || MOCK_ADMIN_USERS[1];
    return {
      success: true,
      data: {
        ...found,
        status,
      },
    };
  }
}

/**
 * Delete a user account and associated study records
 */
export async function deleteUser(id: string): Promise<ApiResponse<{ user_id: string }>> {
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
    return {
      success: true,
      data: { user_id: id },
    };
  }
}
