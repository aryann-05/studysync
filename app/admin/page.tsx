"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Clock,
  Award,
  FileUp,
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getDashboardStats } from "@/services/admin";
import type { AdminDashboardStats } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "all">("30d");

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getDashboardStats({ range: timeRange });
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Aggregating platform intelligence & user analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEE2E2]/50 p-6 text-center">
        <p className="text-sm font-medium text-[#DC2626]">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats()}
          className="mt-4 border-[#DC2626]/30 text-[#DC2626] hover:bg-[#FEE2E2]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Aggregation
        </Button>
      </div>
    );
  }

  const activePercent = stats?.total_users
    ? Math.round((stats.active_users / stats.total_users) * 100)
    : 100;

  return (
    <div className="space-y-8">
      {/* Top Banner & Date Range Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              Super Admin Executive Dashboard
            </h1>
            <Badge className="bg-[#1E40AF] text-white hover:bg-[#1E40AF]">Live</Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Platform intelligence, user activity monitoring, academic specializations, and real-time examination performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="inline-flex rounded-lg border bg-muted p-0.5 text-xs">
            <button
              onClick={() => setTimeRange("today")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                timeRange === "today" ? "bg-white text-[#1E40AF] shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange("7d")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                timeRange === "7d" ? "bg-white text-[#1E40AF] shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                timeRange === "30d" ? "bg-white text-[#1E40AF] shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                timeRange === "all" ? "bg-white text-[#1E40AF] shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Time
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button asChild size="sm" className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white text-xs">
            <Link href="/admin/users">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 1: Primary Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="border-[#E2E8F0] shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Registered Users
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <Users className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#334155]">{stats?.total_users ?? 0}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-[#64748B]">
              <span>Students: {stats?.total_students ?? 0}</span>
              <span className="text-[#1E40AF] font-medium">Regular: {stats?.total_regular_users ?? 0}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B] border-t pt-1.5">
              New: +{stats?.new_registrations?.daily ?? 0} today / +{stats?.new_registrations?.weekly ?? 0} wk
            </div>
          </CardContent>
        </Card>

        {/* Active Users & DAU/WAU/MAU */}
        <Card className="border-[#E2E8F0] shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Active Users & Engagement
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <UserCheck className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#1E40AF]">
              {stats?.active_users ?? 0}{" "}
              <span className="text-xs font-normal text-[#64748B]">({activePercent}%)</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-medium text-[#64748B]">
              <span>DAU: {stats?.dau ?? 0}</span>
              <span>WAU: {stats?.wau ?? 0}</span>
              <span>MAU: {stats?.mau ?? 0}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#DC2626] border-t pt-1.5 flex justify-between">
              <span>Inactive: {stats?.inactive_users ?? 0}</span>
              <span>Suspended: {stats?.suspended_users ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Examination & Test Attempts */}
        <Card className="border-[#E2E8F0] shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Tests & Assessments
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEE2E2] text-[#DC2626]">
              <Award className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#334155]">
              {stats?.total_quiz_attempts ?? 0}{" "}
              <span className="text-xs font-normal text-[#64748B]">Attempts</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-[#64748B]">
              <span>Avg Score: <strong className="text-[#1E40AF]">{stats?.avg_quiz_score ?? 0}%</strong></span>
              <span>Pass Rate: <strong className="text-emerald-600">{stats?.quiz_pass_percentage ?? 0}%</strong></span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B] border-t pt-1.5 flex justify-between">
              <span>High: {stats?.highest_quiz_score ?? 0}%</span>
              <span>Low: {stats?.lowest_quiz_score ?? 0}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Tracked Study Hours & Uploads */}
        <Card className="border-[#E2E8F0] shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Study Hours & Materials
            </CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <Clock className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#334155]">
              {stats?.total_study_hours ?? 0}{" "}
              <span className="text-xs font-normal text-[#64748B]">Hours Tracked</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-[#64748B]">
              <span>Uploads: {stats?.total_uploads ?? 0}</span>
              <span>Size: {((stats?.total_upload_bytes ?? 0) / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
            <div className="mt-2 text-[11px] text-[#1E40AF] border-t pt-1.5 font-medium">
              Modules Active: {stats?.total_quizzes ?? 12} Assessments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts & Visual Analytics */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* User Growth & Active Trend (Area Chart) */}
        <Card className="lg:col-span-4 border-[#E2E8F0] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#334155]">
                  Platform User Growth & Active Trajectory
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Cumulative user registrations compared against active study sessions.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF]">
                Trend Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[270px] w-full">
              {stats?.growth_trend && stats.growth_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.growth_trend}>
                    <defs>
                      <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="activeTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Total Users"
                      stroke="#1E40AF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#userGrowth)"
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      name="Active Users"
                      stroke="#DC2626"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#activeTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No growth trend data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Engagement Activity (Bar Chart) */}
        <Card className="lg:col-span-3 border-[#E2E8F0] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#334155]">
                  Weekly Engagement Pulse
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Sessions completed vs test attempts per weekday.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-[#DC2626]/30 text-[#DC2626]">
                Activity
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[270px] w-full">
              {stats?.engagement_trend && stats.engagement_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.engagement_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="sessions" name="Sessions" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tests" name="Tests" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No engagement data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Popular Academic Categories & Most Active Students */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Categories Distribution */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#334155]">
                  Most Popular Academic Categories
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  User density across verified courses and academic specializations.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-[#1E40AF] hover:bg-[#EFF4FF]">
                <Link href="/admin/categories">
                  View All Categories
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.popular_categories && stats.popular_categories.length > 0 ? (
              stats.popular_categories.map((cat, idx) => {
                const max = Math.max(...stats.popular_categories!.map((c) => c.count)) || 1;
                const pct = Math.round((cat.count / max) * 100);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#334155]">{cat.name}</span>
                      <span className="font-bold text-[#1E40AF]">
                        {cat.count} {cat.count === 1 ? "student" : "students"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#EFF4FF]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]"
                        style={{ width: `${Math.max(8, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No category data registered yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Most Active Learners */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#334155]">
                  Highest Engagement Students
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Top platform learners based on completed study sessions and test activity.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-[#1E40AF] hover:bg-[#EFF4FF]">
                <Link href="/admin/engagement">
                  View Retention
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[#E2E8F0]">
              {stats?.most_active_users && stats.most_active_users.length > 0 ? (
                stats.most_active_users.map((student) => (
                  <div key={student.user_id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#EFF4FF] text-[#1E40AF] text-xs font-bold">
                          {getInitials(student.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/admin/users/${student.user_id}`}
                          className="text-xs font-semibold text-[#1E40AF] hover:underline"
                        >
                          {student.full_name}
                        </Link>
                        <p className="text-[11px] text-[#64748B]">
                          {student.specialization || student.course_name || "Computer Science"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-[#EFF4FF] text-[#1E40AF] border border-[#1E40AF]/20 text-[10px] font-bold">
                        {student.study_hours ?? 18}h studied
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No active learners recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Registrations Table */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#334155]">
              Recent Registrations
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Latest user onboarding records across academic categories.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]">
            <Link href="/admin/users">
              View All Users
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                <tr>
                  <th className="py-2.5 px-3">Student / User</th>
                  <th className="py-2.5 px-3">Category / Specialization</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Joined</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {stats?.recent_registrations && stats.recent_registrations.length > 0 ? (
                  stats.recent_registrations.map((u) => (
                    <tr key={u.user_id} className="hover:bg-[#EFF4FF]/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-[#EFF4FF] text-[#1E40AF] text-[10px] font-bold">
                              {getInitials(u.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-[#334155]">{u.full_name}</p>
                            <p className="text-[11px] text-[#64748B]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#334155]">
                        <span className="font-medium">{u.specialization || u.course_name || "Computer Science"}</span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className={
                            u.role === "admin" || u.role === "super_admin"
                              ? "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20 font-bold"
                              : "bg-[#EFF4FF] text-[#1E40AF] border-[#1E40AF]/20"
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          className={
                            u.status === "active"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                              : u.status === "suspended"
                              ? "bg-[#DC2626] text-white hover:bg-[#DC2626]"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                          }
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#1E40AF] hover:bg-[#EFF4FF]">
                          <Link href={`/admin/users/${u.user_id}`}>
                            Inspect Dossier
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No registrations available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
