"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Loader2,
  LogIn,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleIcon } from "@/components/auth/google-icon";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read role from query parameters if present (e.g. /login?role=admin)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "admin" || roleParam === "user") {
        setSelectedRole(roleParam);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const rememberMe = watch("rememberMe");

  const handleRoleChange = (role: "user" | "admin") => {
    setSelectedRole(role);
    setError(null);
  };

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login({
        email: data.email,
        password: data.password,
        role: selectedRole,
      });

      // Determine user role from session
      let userRole: "admin" | "user" = selectedRole;
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("studysync_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.role) {
              userRole = parsed.role;
            }
          } catch {}
        }
      }

      // If user attempted admin login without admin role, guard against it
      if (selectedRole === "admin" && userRole !== "admin") {
        setError(
          "Access denied: This account does not possess administrator privileges. Please sign in via the User / Student tab."
        );
        return;
      }

      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      const stored = typeof window !== "undefined" ? localStorage.getItem("studysync_user") : null;
      let targetPath = "/dashboard";
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.role === "admin") {
            targetPath = "/admin";
          }
        } catch {}
      }
      router.push(targetPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      {/* Role Selection Switcher */}
      <div className="mb-6">
        <div className="grid w-full grid-cols-2 rounded-xl bg-muted/70 p-1 border border-border/60">
          <button
            type="button"
            onClick={() => handleRoleChange("user")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all",
              selectedRole === "user"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GraduationCap className={cn("h-4 w-4", selectedRole === "user" ? "text-primary" : "")} />
            <span>User / Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all",
              selectedRole === "admin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className={cn("h-4 w-4", selectedRole === "admin" ? "text-amber-500" : "")} />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Header */}
      {selectedRole === "admin" ? (
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Administrator Access
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin Portal Sign In
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your administrator credentials
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your study journey
          </p>
        </div>
      )}

      {/* Google Login (for Students/Users only) */}
      {selectedRole === "user" && (
        <>
          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>
        </>
      )}

      {selectedRole === "admin" && <div className="mt-6" />}

      {error && (
        <div
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">
            {selectedRole === "admin" ? "Admin Email Address" : "Email"}
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={selectedRole === "admin" ? "admin@example.com" : "you@example.com"}
              className="pl-10"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {selectedRole === "user" && (
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => {
                setValue("rememberMe", checked === true);
              }}
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
              Remember me
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full",
            selectedRole === "admin"
              ? "bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              : ""
          )}
          disabled={authLoading}
        >
          {authLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {selectedRole === "admin" ? "Authenticating Admin..." : "Signing in..."}
            </>
          ) : selectedRole === "admin" ? (
            <>
              <ShieldCheck className="h-4 w-4 mr-1" />
              Sign In as Administrator
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </>
          )}
        </Button>
      </form>

      {/* Role-Specific Registration Links */}
      {selectedRole === "admin" ? (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an admin account?{" "}
          <Link
            href="/register?role=admin"
            className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Register as Admin
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register?role=user" className="font-medium text-primary hover:underline">
            Sign up free
          </Link>
        </p>
      )}
    </div>
  );
}
