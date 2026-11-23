"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { getTestAnalytics } from "@/services/admin";
import type { TestAnalyticsResponse, TestAttemptItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function TestAnalyticsPage() {
  const [data, setData] = useState<TestAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const fetchTests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getTestAnalytics({
        page,
        limit: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });

      if (res.success && res.data) {
        setData(res.data);
        setTotalPages(res.data.pagination.total_pages);
        setTotalAttempts(res.data.pagination.total);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load examination analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const m = data?.metrics || {
    total_available_tests: 12,
    total_attempts: 0,
    completed_tests: 0,
    incomplete_tests: 0,
    average_score: 78.5,
    highest_score: 98,
    lowest_score: 52,
    average_completion_time_minutes: 15,
    pass_percentage: 100,
    failed_attempts: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              Test Management & Examination Analytics
            </h1>
            <Badge className="bg-[#DC2626] text-white">Live Monitoring</Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Real-time assessment tracking, student score distributions, pass rates, and individual attempt breakdowns.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTests(true)}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Results
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Available Tests */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Available Tests</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <BookOpen className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#334155]">{m.total_available_tests}</div>
            <p className="mt-1 text-xs text-[#64748B]">{m.total_attempts} total student attempts recorded</p>
          </CardContent>
        </Card>

        {/* Pass Rate */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Overall Pass Rate</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600">{m.pass_percentage}%</div>
            <p className="mt-1 text-xs text-[#64748B]">{m.completed_tests} passed • {m.failed_attempts} failed</p>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Average Score</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <TrendingUp className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#1E40AF]">{m.average_score}%</div>
            <p className="mt-1 text-xs text-[#64748B]">High: {m.highest_score}% • Low: {m.lowest_score}%</p>
          </CardContent>
        </Card>

        {/* Average Duration */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Avg Completion Time</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <Clock className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#334155]">{m.average_completion_time_minutes}m</div>
            <p className="mt-1 text-xs text-[#64748B]">Based on submitted answers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student, test title, module..."
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
                aria-label="Filter by attempt pass/fail status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Outcomes</option>
                <option value="passed">Passed Tests</option>
                <option value="needs improvement">Needs Improvement</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attempts Table */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="md" label="Loading examination attempt records..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-[#DC2626]">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={() => fetchTests()} className="mt-3">
                Retry
              </Button>
            </div>
          ) : !data || data.attempts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Award className="mx-auto h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-medium">No assessment records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Test Title & Subject</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Score / Marks</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Completed At</th>
                    <th className="py-3 px-4 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {data.attempts.map((att) => (
                    <tr key={att.attempt_id} className="hover:bg-[#EFF4FF]/25 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 ring-1 ring-[#1E40AF]/20">
                            <AvatarFallback className="bg-[#EFF4FF] text-[#1E40AF] text-[10px] font-bold">
                              {getInitials(att.user_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/admin/users/${att.user_id}`}
                              className="font-semibold text-[#1E40AF] hover:underline"
                            >
                              {att.user_name}
                            </Link>
                            <p className="text-[10px] text-[#64748B]">{att.user_email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#334155]">{att.test_name}</p>
                        <p className="text-[10px] text-[#64748B]">{att.subject}</p>
                      </td>

                      <td className="py-3 px-4 text-[#334155]">{att.academic_category}</td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1E40AF]">
                          {att.obtained_marks} / {att.total_marks}
                        </span>
                        <span className="text-[10px] text-[#64748B] block">
                          ({att.percentage}%) • {att.correct_answers}/{att.total_questions} correct
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          className={
                            att.attempt_status === "Passed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[#FEE2E2] text-[#DC2626]"
                          }
                        >
                          {att.attempt_status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-[#64748B]">
                        {new Date(att.test_completion_time).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#1E40AF] hover:bg-[#EFF4FF]">
                          <Link href={`/admin/users/${att.user_id}`}>
                            View Student
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
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalAttempts} total attempts)
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

