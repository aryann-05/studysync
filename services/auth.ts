import { post } from "./api";
import type {
  ApiResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
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
        user: { user_id: string; full_name: string; email: string; daily_max_hours: number };
        access_token: string;
      };
    }>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });

    return {
      success: true,
      data: {
        user: {
          id: res.data?.user?.user_id || "user-1",
          name: res.data?.user?.full_name || "User",
          email: credentials.email,
          studyHoursPerDay: res.data?.user?.daily_max_hours || 4,
          theme: "light",
          emailNotifications: true,
          reminderTime: "09:00",
          createdAt: new Date(),
        },
        token: res.data?.access_token || "token-" + Date.now(),
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
    return {
      success: true,
      data: {
        user: {
          id: "user-1",
          name: "Alex Thompson",
          email: credentials.email,
          studyHoursPerDay: 4,
          theme: "light",
          emailNotifications: true,
          reminderTime: "09:00",
          createdAt: new Date("2025-01-15"),
        },
        token: "mock-jwt-token-" + Date.now(),
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
      data: { user_id: string; full_name: string; email: string };
    }>("/auth/register", {
      full_name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    });

    let token = "token-" + Date.now();
    try {
      const loginRes = await post<{
        status: string;
        data: {
          user: { user_id: string; full_name: string; email: string; daily_max_hours: number };
          access_token: string;
        };
      }>("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });
      if (loginRes?.data?.access_token) {
        token = loginRes.data.access_token;
      }
    } catch {
      // login fallback
    }

    return {
      success: true,
      data: {
        user: {
          id: res.data?.user_id || "user-1",
          name: credentials.name,
          email: credentials.email,
          studyHoursPerDay: 4,
          theme: "light",
          emailNotifications: true,
          reminderTime: "09:00",
          createdAt: new Date(),
        },
        token,
      },
    };
  } catch (err: any) {
    const backendMessage = err?.response?.data?.message;
    if (backendMessage) {
      throw new Error(backendMessage);
    }
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    return {
      success: true,
      data: {
        user: {
          id: "user-1",
          name: credentials.name,
          email: credentials.email,
          studyHoursPerDay: 4,
          theme: "light",
          emailNotifications: true,
          reminderTime: "09:00",
          createdAt: new Date(),
        },
        token: "mock-jwt-token-" + Date.now(),
      },
    };
  }
}

export async function googleLogin(): Promise<ApiResponse<AuthResponse>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

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
      token: "mock-google-token-" + Date.now(),
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
  await new Promise((resolve) => setTimeout(resolve, 300));
  return;
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

