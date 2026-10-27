"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
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

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getDashboardStats();
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
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Loading platform statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchStats()} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const activePercent = stats?.total_users
    ? Math.round((stats.active_users / stats.total_users) * 100)
    : 100;

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time platform metrics, user classification, and account administration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <Button asChild size="sm" className="text-xs">
            <Link href="/admin/users">
              <Users className="mr-2 h-3.5 w-3.5" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{stats?.total_users ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all registered accounts
            </p>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Accounts
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {stats?.total_students ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Enrolled in courses & study plans
            </p>
          </CardContent>
        </Card>

        {/* Regular Users */}
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Regular Users
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats?.total_regular_users ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              General study & self-learners
            </p>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active vs Inactive
            </CardTitle>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats?.active_users ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">active</span>
              {stats?.inactive_users ? (
                <span className="text-xs font-semibold text-destructive ml-auto">
                  {stats.inactive_users} inactive
                </span>
              ) : null}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${activePercent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {activePercent}% account health rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations Table */}
      <Card className="shadow-sm border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold">Recent Registrations</CardTitle>
            <CardDescription className="text-xs">
              Latest users registered on the StudySync platform
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/admin/users">
              View All Users
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.recent_registrations && stats.recent_registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground">
                    <th className="pb-3 pl-2">User</th>
                    <th className="pb-3">Account Type</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recent_registrations.map((u) => (
                    <tr key={u.user_id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(u.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground leading-snug">{u.full_name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            u.account_type === "student"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize text-xs"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 capitalize text-xs"
                          }
                        >
                          {u.account_type || "student"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={u.role === "admin" ? "default" : "outline"}
                          className="capitalize text-xs font-normal"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              u.status === "active" ? "bg-emerald-500" : "bg-destructive"
                            }`}
                          />
                          {u.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right text-xs text-muted-foreground">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Recent"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No registered users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

