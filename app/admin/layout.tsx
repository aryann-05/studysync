"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { AdminRoute } from "@/components/layout/admin-route";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn, getInitials } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users Management", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                StudySync <span className="text-primary font-normal text-xs uppercase px-1.5 py-0.5 rounded bg-primary/10">Admin</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6" aria-label="Admin Navigation">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administration
            </p>
            {ADMIN_NAV.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-6 pb-2">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shortcuts
              </p>
              <Link
                href="/dashboard"
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4" />
                  Study App
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Link>
            </div>
          </nav>

          {/* Current Admin User Info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
              <Avatar className="h-9 w-9 ring-1 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                  {getInitials(user?.name || "Admin")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold text-primary">
                Admin
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full justify-start text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Mobile Header & Overlay */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-foreground lg:hidden"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground lg:text-base">
                  Admin Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                <Link href="/dashboard">
                  <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                  View User App
                </Link>
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:inline-flex text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </header>

          {/* Mobile Sliding Menu */}
          {mobileMenuOpen && (
            <div className="border-b bg-background px-4 py-4 lg:hidden">
              <nav className="space-y-1">
                {ADMIN_NAV.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <GraduationCap className="h-4 w-4" />
                  Go to Study App
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          )}

          {/* Main Page Area */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}

