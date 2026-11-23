"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileUp,
  ShieldCheck,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ExternalLink,
  BookOpen,
  Activity,
  Award,
  TrendingUp,
  Flame,
  Bell,
  FileDown,
  Shield,
} from "lucide-react";
import { AdminRoute } from "@/components/layout/admin-route";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn, getInitials } from "@/lib/utils";

const NAV_GROUPS = [
  {
    title: "Core Administration",
    items: [
      { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
      { label: "User Management", href: "/admin/users", icon: Users },
      { label: "Academic Categories", href: "/admin/categories", icon: BookOpen },
      { label: "User Activity & Logs", href: "/admin/activity", icon: Activity },
    ],
  },
  {
    title: "Learning & Academics",
    items: [
      { label: "Upload Management", href: "/admin/uploads", icon: FileUp },
      { label: "Tests & Examination", href: "/admin/tests", icon: Award },
      { label: "Learning Insights", href: "/admin/learning", icon: TrendingUp },
      { label: "User Engagement", href: "/admin/engagement", icon: Flame },
    ],
  },
  {
    title: "Governance & Data",
    items: [
      { label: "Notifications & Alerts", href: "/admin/notifications", icon: Bell },
      { label: "Reports & Exports", href: "/admin/reports", icon: FileDown },
      { label: "Security & Audit", href: "/admin/security", icon: Shield },
    ],
  },
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
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white shadow">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                StudySync{" "}
                <span className="text-[#DC2626] font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-[#FEE2E2] border border-[#DC2626]/20">
                  Super Admin
                </span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin Navigation">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {group.title}
                </p>
                {group.items.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-[#1E40AF] text-white shadow-sm font-semibold"
                          : "text-muted-foreground hover:bg-[#EFF4FF] hover:text-[#1E40AF] dark:hover:bg-muted dark:hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-white"
                            : "text-muted-foreground group-hover:text-[#1E40AF] dark:group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className="pt-2 pb-1 border-t">
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Quick Access
              </p>
              <Link
                href="/dashboard"
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-[#EFF4FF] hover:text-[#1E40AF] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4" />
                  Study Application
                </span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </Link>
            </div>
          </nav>

          {/* Current Admin User Info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
              <Avatar className="h-9 w-9 ring-1 ring-[#1E40AF]/20">
                <AvatarFallback className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white text-xs font-bold">
                  {getInitials(user?.name || "Admin")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Badge className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-[10px] uppercase font-bold text-white">
                Admin
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full justify-start text-xs text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Mobile Header & Content */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-foreground lg:hidden hover:bg-muted"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground lg:text-base">
                  StudySync Super Admin
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EFF4FF] text-[#1E40AF] border border-[#1E40AF]/20">
                  Live Operations
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]">
                <Link href="/admin/notifications">
                  <Bell className="mr-1.5 h-3.5 w-3.5" />
                  Alerts
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                <Link href="/dashboard">
                  <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                  Student Portal
                </Link>
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:inline-flex text-xs text-[#DC2626] hover:bg-[#FEE2E2]"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </header>

          {/* Mobile Sliding Menu */}
          {mobileMenuOpen && (
            <div className="border-b bg-background px-4 py-4 lg:hidden max-h-[80vh] overflow-y-auto">
              <nav className="space-y-4">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="px-2 text-[11px] font-bold uppercase text-muted-foreground">
                      {group.title}
                    </p>
                    {group.items.map((link) => {
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
                              ? "bg-[#1E40AF] text-white"
                              : "text-muted-foreground hover:bg-[#EFF4FF] hover:text-[#1E40AF]"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
                <div className="pt-2 border-t space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Go to Student Portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
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
