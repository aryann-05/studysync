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

const MOCK_DELAY = 900;

export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponse>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  if (credentials.email === "error@test.com") {
    throw new Error("Invalid credentials. Please try again.");
  }

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

export async function register(
  credentials: RegisterCredentials
): Promise<ApiResponse<AuthResponse>> {
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

