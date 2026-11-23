"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { LoginCredentials, RegisterCredentials, User } from "@/types";
import * as authService from "@/services/auth";
import {
  clearTokens,
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
} from "@/services/api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("studysync_user");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.createdAt) {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    return parsed as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize session on mount without flashing logged-out state
  useEffect(() => {
    let isCancelled = false;

    async function initSession() {
      const storedUser = getStoredUser();
      const token = getToken();
      const refreshToken = getRefreshToken();

      // Immediately restore from local storage to prevent any UI flicker
      if (storedUser) {
        setUser(storedUser);
      }
      setMounted(true);

      // If user was logged in, verify session with backend in background
      if (token || refreshToken) {
        try {
          const res = await authService.getMe();
          if (!isCancelled && res.success && res.data) {
            setUser(res.data);
            localStorage.setItem("studysync_user", JSON.stringify(res.data));
          }
        } catch {
          // If getMe failed, axios interceptor attempted refresh.
          // If both tokens were invalid/expired, they were cleared.
          if (!getToken() && !getRefreshToken()) {
            if (!isCancelled) {
              setUser(null);
              localStorage.removeItem("studysync_user");
            }
          }
        }
      }

      if (!isCancelled) {
        setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync user state changes to localStorage
  useEffect(() => {
    if (!mounted) return;

    if (user) {
      localStorage.setItem("studysync_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("studysync_user");
    }
  }, [user, mounted]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.data.token);
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }
      setUser(response.data.user);
      localStorage.setItem("studysync_user", JSON.stringify(response.data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      setToken(response.data.token);
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }
      setUser(response.data.user);
      localStorage.setItem("studysync_user", JSON.stringify(response.data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authService.googleLogin();
      setToken(response.data.token);
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }
      setUser(response.data.user);
      localStorage.setItem("studysync_user", JSON.stringify(response.data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.refreshSession();
      setUser(response.data.user);
      localStorage.setItem("studysync_user", JSON.stringify(response.data.user));
    } catch (err) {
      clearTokens();
      setUser(null);
      localStorage.removeItem("studysync_user");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      clearTokens();
      localStorage.removeItem("studysync_user");
      localStorage.removeItem("studysync_cached_study_data");
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("studysync_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}