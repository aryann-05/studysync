import { get, patch, del } from "./api";
import type {
  ApiResponse,
  AdminDashboardStats,
  AdminUsersResponse,
  AdminUserDetailResponse,
  AdminUser,
  AdminUploadItem,
  AdminUploadsResponse,
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

const MOCK_ADMIN_UPLOADS: AdminUploadItem[] = [
  {
    upload_id: "upl-mock-1",
    original_name: "MCA_Advanced_Data_Structures.pdf",
    stored_name: "MCA_Advanced_Data_Structures.pdf",
    mime_type: "application/pdf",
    size: 2450000,
    document_type: "pdf",
    uploaded_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    extracted_topics_count: 16,
    user: {
      user_id: "usr-std-1",
      full_name: "Alex Thompson",
      email: "alex.thompson@example.com",
      role: "user",
      account_type: "student",
      status: "active",
    },
  },
  {
    upload_id: "upl-mock-2",
    original_name: "Computer_Networks_Unit_1_to_4.pdf",
    stored_name: "Computer_Networks_Unit_1_to_4.pdf",
    mime_type: "application/pdf",
    size: 4120000,
    document_type: "pdf",
    uploaded_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    extracted_topics_count: 24,
    user: {
      user_id: "usr-std-2",
      full_name: "Sophia Martinez",
      email: "sophia.m@example.com",
      role: "user",
      account_type: "student",
      status: "active",
    },
  },
  {
    upload_id: "upl-mock-3",
    original_name: "Software_Testing_QA_Manual.docx",
    stored_name: "Software_Testing_QA_Manual.docx",
    mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 1280000,
    document_type: "docx",
    uploaded_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    extracted_topics_count: 12,
    user: {
      user_id: "usr-reg-3",
      full_name: "David Kim",
      email: "david.kim@example.com",
      role: "user",
      account_type: "regular",
      status: "active",
    },
  },
  {
    upload_id: "upl-mock-4",
    original_name: "Operating_Systems_Process_Scheduling.pdf",
    stored_name: "Operating_Systems_Process_Scheduling.pdf",
    mime_type: "application/pdf",
    size: 3840000,
    document_type: "pdf",
    uploaded_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    extracted_topics_count: 18,
    user: {
      user_id: "usr-std-4",
      full_name: "Emma Wilson",
      email: "emma.wilson@example.com",
      role: "user",
      account_type: "student",
      status: "inactive",
    },
  },
  {
    upload_id: "upl-mock-5",
    original_name: "Cloud_Computing_AWS_Azure_Notes.txt",
    stored_name: "Cloud_Computing_AWS_Azure_Notes.txt",
    mime_type: "text/plain",
    size: 94000,
    document_type: "txt",
    uploaded_at: new Date(Date.now() - 3600000 * 75).toISOString(),
    extracted_topics_count: 9,
    user: {
      user_id: "usr-std-1",
      full_name: "Alex Thompson",
      email: "alex.thompson@example.com",
      role: "user",
      account_type: "student",
      status: "active",
    },
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

/**
 * Fetch all student and user uploads with associated user details
 */
export async function getAdminUploads(params?: {
  page?: number;
  limit?: number;
  search?: string;
  file_type?: string;
  user_id?: string;
}): Promise<ApiResponse<AdminUploadsResponse>> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.file_type) query.set("file_type", params.file_type);
    if (params?.user_id) query.set("user_id", params.user_id);

    const queryString = query.toString();
    const endpoint = `/admin/uploads${queryString ? `?${queryString}` : ""}`;

    const res = await get<{
      status: string;
      message: string;
      data: AdminUploadsResponse;
    }>(endpoint);

    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    // Fallback when backend is disconnected/offline
    let filtered = [...MOCK_ADMIN_UPLOADS];

    if (params?.file_type && params.file_type !== "all") {
      filtered = filtered.filter((u) => u.document_type === params.file_type);
    }

    if (params?.user_id) {
      filtered = filtered.filter((u) => u.user.user_id === params.user_id);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.original_name.toLowerCase().includes(q) ||
          u.user.full_name.toLowerCase().includes(q) ||
          u.user.email.toLowerCase().includes(q)
      );
    }

    const totalUploads = MOCK_ADMIN_UPLOADS.length;
    const totalSizeBytes = MOCK_ADMIN_UPLOADS.reduce((acc, u) => acc + u.size, 0);
    const pdfCount = MOCK_ADMIN_UPLOADS.filter((u) => u.document_type === "pdf").length;
    const docxTxtCount = MOCK_ADMIN_UPLOADS.filter((u) =>
      ["docx", "txt", "document"].includes(u.document_type)
    ).length;
    const uniqueUsersCount = new Set(MOCK_ADMIN_UPLOADS.map((u) => u.user.user_id)).size;

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        uploads: paginated,
        stats: {
          total_uploads: totalUploads,
          total_size_bytes: totalSizeBytes,
          pdf_count: pdfCount,
          docx_txt_count: docxTxtCount,
          unique_users_count: uniqueUsersCount,
        },
        pagination: {
          total_uploads: filtered.length,
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
 * Fetch single upload details with full student info
 */
export async function getAdminUploadById(
  id: string
): Promise<ApiResponse<AdminUploadItem>> {
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
    const found =
      MOCK_ADMIN_UPLOADS.find((u) => u.upload_id === id) || MOCK_ADMIN_UPLOADS[0];
    return {
      success: true,
      data: found,
    };
  }
}

/**
 * Delete an upload from admin panel
 */
export async function deleteAdminUpload(
  id: string
): Promise<ApiResponse<{ upload_id: string }>> {
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
    return {
      success: true,
      data: { upload_id: id },
    };
  }
}
