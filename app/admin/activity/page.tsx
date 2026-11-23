"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Sparkles,
  FileUp,
  Award,
  CheckCircle,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { getUserActivities } from "@/services/admin";
import type { ActivityLogItem, ActivityAnalyticsResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const ACTIVITY_TYPES = [
  { value: "all", label: "All Activities" },
  { value: "registration", label: "User Registration" },
  { value: "login", label: "Logins & Sessions" },
  { value: "syllabus_upload", label: "Syllabus Uploads" },
  { value: "pdf_upload", label: "PDF / Notes Uploads" },
  { value: "study_plan_creation", label: "Study Plan Generation" },
  { value: "study_session_complete", label: "Session Completions" },
  { value: "test_completion", label: "Test Attempts & Results" },
  { value: "ai_feature_usage", label: "AI Feature Invocations" },
  { value: "category_selection", label: "Category & Course Changes" },
];

export default function UserActivityPage() {
  const [data, setData] = useState<ActivityAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [activityType, setActivityType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);

  const fetchActivities = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getUserActivities({
        page,
        limit: 20,
        activityType: activityType !== "all" ? activityType : undefined,
        search: search.trim() || undefined,
      });

      if (res.success && res.data) {
        setData(res.data);
        setTotalPages(res.data.pagination.total_pages);
        setTotalActivities(res.data.pagination.total);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, activityType, search]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <User className="h-3.5 w-3.5 text-[#1E40AF]" />;
      case "login":
        return <LogIn className="h-3.5 w-3.5 text-emerald-600" />;
      case "logout":
        return <LogOut className="h-3.5 w-3.5 text-slate-500" />;
      case "syllabus_upload":
      case "pdf_upload":
      case "notes_upload":
        return <FileUp className="h-3.5 w-3.5 text-[#1E40AF]" />;
      case "study_plan_creation":
        return <Calendar className="h-3.5 w-3.5 text-indigo-600" />;
      case "study_session_complete":
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />;
      case "test_completion":
      case "test_result":
      case "test_attempt":
        return <Award className="h-3.5 w-3.5 text-[#DC2626]" />;
      case "ai_feature_usage":
        return <Sparkles className="h-3.5 w-3.5 text-amber-600" />;
      case "category_selection":
        return <BookOpen className="h-3.5 w-3.5 text-[#1E40AF]" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-[#1E40AF]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              User Activity & Live Monitoring
            </h1>
            <Badge variant="outline" className="border-[#1E40AF]/30 text-[#1E40AF]">
              {totalActivities} Events Recorded
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Chronological audit trail of all student interactions, logins, syllabus uploads, and test completions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchActivities(true)}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Activity
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, action description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-xs"
              />
            </div>

            <div>
              <select
                aria-label="Filter by activity event type"
                value={activityType}
                onChange={(e) => {
                  setActivityType(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline Table */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="md" label="Loading real-time platform activity logs..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-[#DC2626]">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={() => fetchActivities()} className="mt-3">
                Retry
              </Button>
            </div>
          ) : !data || data.activities.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Activity className="mx-auto h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-medium">No activity records match your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                  <tr>
                    <th className="py-3 px-4">Event & Type</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Action Details</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {data.activities.map((act) => (
                    <tr key={act.activity_id} className="hover:bg-[#EFF4FF]/25 transition-colors">
                      {/* Event Type & Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF4FF] border border-[#1E40AF]/10">
                            {getActivityIcon(act.activity_type)}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#1E40AF] border-[#1E40AF]/20">
                            {act.activity_type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-[#EFF4FF] text-[#1E40AF] text-[9px] font-bold">
                              {getInitials(act.user_name || "User")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/admin/users/${act.user_id}`}
                              className="font-semibold text-[#1E40AF] hover:underline"
                            >
                              {act.user_name || "Student"}
                            </Link>
                            <p className="text-[10px] text-[#64748B]">{act.user_email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-[#334155] font-medium max-w-md">
                        {act.description}
                      </td>

                      {/* IP */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                        {act.ip_address || "127.0.0.1"}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                        {new Date(act.created_at).toLocaleString()}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#1E40AF] hover:bg-[#EFF4FF]">
                          <Link href={`/admin/users/${act.user_id}`}>
                            View User
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalActivities} total logs)
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="h-8 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="h-8 text-xs"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

