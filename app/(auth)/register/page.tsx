"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  User,
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleIcon } from "@/components/auth/google-icon";
import { registerSchema, type RegisterFormData } from "@/lib/validators";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync role from query string if present (e.g. /register?role=admin)
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      agreeToTerms: false,
    },
  });

  const agreeToTerms = watch("agreeToTerms");

  const handleRoleChange = (role: "user" | "admin") => {
    setSelectedRole(role);
    setValue("role", role);
    setError(null);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: selectedRole,
      });

      if (selectedRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google signup failed.");
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
            <span>Admin Account</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Header */}
      {selectedRole === "admin" ? (
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Administrator Registration
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Create Admin Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register your administrator account to manage StudySync
          </p>

          <div className="mt-4 p-3 rounded-lg border border-amber-500/25 bg-amber-500/5 text-left text-xs flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-700 dark:text-amber-300">
              Admin accounts have full administrative rights to view and manage registered users, account statuses, and system metrics.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your smarter study journey — free
          </p>
        </div>
      )}

      {/* Google Signup (for Students/Users only) */}
      {selectedRole === "user" && (
        <>
          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            Sign up with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or sign up with email
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
          <Label htmlFor="name">
            {selectedRole === "admin" ? "Administrator Full Name" : "Full Name"}
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder={selectedRole === "admin" ? "Admin Name" : "John Doe"}
              className="pl-10"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              className="pl-10 pr-10"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              className="pl-10 pr-10"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="agreeToTerms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => {
              setValue("agreeToTerms", checked === true, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            aria-invalid={!!errors.agreeToTerms}
          />
          <Label htmlFor="agreeToTerms" className="text-sm font-normal cursor-pointer">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-xs text-destructive">{errors.agreeToTerms.message}</p>
        )}

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
              {selectedRole === "admin" ? "Registering Admin..." : "Creating account..."}
            </>
          ) : selectedRole === "admin" ? (
            <>
              <ShieldCheck className="h-4 w-4 mr-1" />
              Register as Administrator
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              Create Account
            </>
          )}
        </Button>
      </form>

      {/* Role-Specific Sign In Links */}
      {selectedRole === "admin" ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already an administrator?{" "}
          <Link
            href="/login?role=admin"
            className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Sign in to Admin Portal
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login?role=user" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
