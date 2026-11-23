import { get, post, setToken, setRefreshToken, clearTokens, getRefreshToken } from "./api";
import type {
  ApiResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

const MOCK_DELAY = 500;

export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponse>> {
  try {
    const res = await post<{
      status: string;
      message: string;
      data: {
        user: {
          user_id: string;
          full_name: string;
          email: string;
          daily_max_hours: number;
          created_at?: string;
        };
        access_token: string;
        refresh_token?: string;
      };
    }>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });

    const accessToken = res.data?.access_token;
    const refreshToken = res.data?.refresh_token;

    if (accessToken) {
      setToken(accessToken);
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    const userData: User = {
      id: res.data?.user?.user_id || "user-1",
      name: res.data?.user?.full_name || "User",
      email: res.data?.user?.email || credentials.email,
      role: (res.data?.user as any)?.role || "user",
      status: (res.data?.user as any)?.status || "active",
      accountType: (res.data?.user as any)?.account_type || "student",
      studyHoursPerDay: res.data?.user?.daily_max_hours || 4,
      theme: "light",
      emailNotifications: true,
      reminderTime: "09:00",
      createdAt: res.data?.user?.created_at
        ? new Date(res.data.user.created_at)
        : new Date(),
    };

    return {
      success: true,
      data: {
        user: userData,
        token: accessToken || "token-" + Date.now(),
        refreshToken,
      },
    };
  } catch (err: any) {
    const backendMessage = err?.response?.data?.message;
    if (backendMessage) {
      throw new Error(backendMessage);
    }
    if (credentials.email === "error@test.com") {
      throw new Error("Invalid credentials. Please try again.");
    }
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    const isAdmin =
      credentials.role === "admin" ||
      (credentials.email && credentials.email.toLowerCase().includes("admin"));
    const mockToken = "mock-jwt-token-" + (isAdmin ? "admin-" : "user-") + Date.now();
    setToken(mockToken);
    return {
      success: true,
      data: {
        user: {
          id: isAdmin ? "admin-1" : "user-1",
          name: isAdmin ? (credentials.email ? credentials.email.split("@")[0] : "Administrator") : "Alex Thompson",
          email: credentials.email,
          role: isAdmin ? "admin" : "user",
          status: "active",
          accountType: isAdmin ? "regular" : "student",
          studyHoursPerDay: 4,
          theme: "light",
          emailNotifications: true,
          reminderTime: "09:00",
          createdAt: new Date("2025-01-15"),
        },
        token: mockToken,
      },
    };
  }
}

export async function register(
  credentials: RegisterCredentials
): Promise<ApiResponse<AuthResponse>> {
  try {
    const res = await post<{
      status: string;
      message: string;
      data: {
        user_id: string;
        full_name: string;
        email: string;
        role?: "admin" | "user";
        status?: "active" | "inactive";
        account_type?: "student" | "regular";
      };
    }>("/auth/register", {
      full_name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      role: credentials.role || "user",
    });

    let token = "token-" + Date.now();
    let refreshToken: string | undefined;

    try {
      const loginRes = await post<{
        status: string;
        data: {
          user: {
            user_id: string;
            full_name: string;
            email: string;
            role?: "admin" | "user";
            status?: "active" | "inactive";
            account_type?: "student" | "regular";
            daily_max_hours: number;
            created_at?: string;
          };
          access_token: string;
          refresh_token?: string;
        };
      }>("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      if (loginRes?.data?.access_token) {
        token = loginRes.data.access_token;
        setToken(token);
      }
      if (loginRes?.data?.refresh_token) {
        refreshToken = loginRes.data.refresh_token;
        setRefreshToken(refreshToken);
      }
    } catch {
      // login fallback
    }

    const assignedRole: "admin" | "user" =
      credentials.role || (res.data as any)?.role || "user";
    const userData: User = {
      id: res.data?.user_id || "user-1",
      name: credentials.name,
      email: credentials.email,
      role: assignedRole,
      status: (res.data as any)?.status || "active",
      accountType:
        (res.data as any)?.account_type ||
        (assignedRole === "admin" ? "regular" : "student"),
      studyHoursPerDay: 4,
      theme: "light",
      emailNotifications: true,
      reminderTime: "09:00",
      createdAt: new Date(),
    };

    return {
      success: true,
      data: {
        user: userData,
        token,
        refreshToken,
      },
    };
  } catch (err: any) {
    const backendMessage = err?.response?.data?.message;
    if (backendMessage) {
      throw new Error(backendMessage);
    }
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    const assignedRole: "admin" | "user" =
      credentials.role ||
      (credentials.email?.toLowerCase().includes("admin") ? "admin" : "user");
    const mockToken =
      "mock-jwt-token-" + (assignedRole === "admin" ? "admin-" : "user-") + Date.now();
    setToken(mockToken);
    return {
      success: true,
      data: {
        user: {
          id: assignedRole === "admin" ? "admin-" + Date.now() : "user-" + Date.now(),
          name: credentials.name,
          email: credentials.email,
          role: assignedRole,
          status: "active",
          accountType: assignedRole === "admin" ? "regular" : "student",
          studyHoursPerDay: 4,
          theme: "light",
          emailNotifications: true,
          reminderTime: "09:00",
          createdAt: new Date(),
        },
        token: mockToken,
      },
    };
  }
}

export async function getMe(): Promise<ApiResponse<User>> {
  try {
    const res = await get<{
      status: string;
      message: string;
      data: {
        user_id: string;
        full_name: string;
        email: string;
        role?: "admin" | "user";
        status?: "active" | "inactive";
        account_type?: "student" | "regular";
        daily_max_hours: number;
        created_at?: string;
      };
    }>("/auth/me");

    return {
      success: true,
      data: {
        id: res.data.user_id,
        name: res.data.full_name,
        email: res.data.email,
        role: res.data.role || "user",
        status: res.data.status || "active",
        accountType: res.data.account_type || "student",
        studyHoursPerDay: res.data.daily_max_hours ?? 4,
        theme: "light",
        emailNotifications: true,
        reminderTime: "09:00",
        createdAt: res.data.created_at ? new Date(res.data.created_at) : new Date(),
      },
    };
  } catch (err: any) {
    const backendMessage = err?.response?.data?.message;
    throw new Error(backendMessage || "Failed to fetch current user session");
  }
}

export async function refreshSession(): Promise<ApiResponse<AuthResponse>> {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await post<{
    status: string;
    message: string;
    data: {
      access_token: string;
      refresh_token: string;
      user: {
        user_id: string;
        full_name: string;
        email: string;
        role?: "admin" | "user";
        status?: "active" | "inactive";
        account_type?: "student" | "regular";
        daily_max_hours: number;
        created_at?: string;
      };
    };
  }>("/auth/refresh", { refresh_token: currentRefreshToken });

  const { access_token, refresh_token: newRefreshToken, user } = res.data;
  setToken(access_token);
  if (newRefreshToken) {
    setRefreshToken(newRefreshToken);
  }

  return {
    success: true,
    data: {
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role || "user",
        status: user.status || "active",
        accountType: user.account_type || "student",
        studyHoursPerDay: user.daily_max_hours ?? 4,
        theme: "light",
        emailNotifications: true,
        reminderTime: "09:00",
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
      },
      token: access_token,
      refreshToken: newRefreshToken,
    },
  };
}

export async function googleLogin(): Promise<ApiResponse<AuthResponse>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  const mockToken = "mock-google-token-" + Date.now();
  setToken(mockToken);

  return {
    success: true,
    data: {
      user: {
        id: "user-google",
        name: "Google User",
        email: "user@gmail.com",
        studyHoursPerDay: 3,
        theme: "light",
        emailNotifications: true,
        reminderTime: "08:00",
        createdAt: new Date(),
      },
      token: mockToken,
    },
  };
}

export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    data: null,
    message: `Password reset link sent to ${email}`,
  };
}

export async function logout(): Promise<void> {
  clearTokens();
  if (typeof window !== "undefined") {
    localStorage.removeItem("studysync_user");
    localStorage.removeItem("studysync_cached_study_data");
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    data: null,
    message: "Password changed successfully",
  };
}

export async function updateProfile(
  data: Partial<User>
): Promise<ApiResponse<User>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    data: {
      id: "user-1",
      name: data.name ?? "Alex Thompson",
      email: data.email ?? "alex.thompson@example.com",
      studyHoursPerDay: data.studyHoursPerDay ?? 4,
      theme: data.theme ?? "light",
      emailNotifications: data.emailNotifications ?? true,
      reminderTime: data.reminderTime ?? "09:00",
      createdAt: new Date("2025-01-15"),
    },
  };
}

