"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X, Bell, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

export function Navbar({ variant = "main" }: { variant?: "main" | "dashboard" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          </Link>
        </div>

        {variant === "main" && (
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {variant === "dashboard" && (
            <Link
              href="/notifications"
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted",
                isActive("/notifications") && "bg-muted"
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                3
              </span>
            </Link>
          )}

          {variant === "main" && (
            <div className="hidden items-center gap-2 sm:flex">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {isAuthenticated && <UserMenu />}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="border-t bg-background px-4 py-4 animate-fade-in lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                    isActive(link.href)
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {variant === "main" && (
              <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

