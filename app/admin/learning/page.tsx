"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Calendar,
  BookOpen,
  Award,
  RefreshCw,
  AlertTriangle,
  Flame,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getLearningAnalytics } from "@/services/admin";
import type { LearningAnalyticsResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function LearningInsightsPage() {
  const [data, setData] = useState<LearningAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getLearningAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load learning insights.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Synthesizing student learning habits & study patterns..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEE2E2]/50 p-6 text-center">
        <p className="text-sm font-semibold text-[#DC2626]">{error || "Failed to load learning data."}</p>
        <Button variant="outline" size="sm" onClick={() => fetchAnalytics()} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const ov = data.overview;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              Learning Insights & Study Patterns
            </h1>
            <Badge className="bg-[#1E40AF] text-white">Academic Intelligence</Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Aggregated metrics on active study hours, subject engagement, weekly study habits, and completion retention.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Insights
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Total Tracked Hours</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <Clock className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#334155]">{ov.total_study_hours}h</div>
            <p className="mt-1 text-xs text-[#64748B]">Across all completed study sessions</p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Completion Rate</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600">{ov.average_completion_rate}%</div>
            <p className="mt-1 text-xs text-[#64748B]">
              {ov.completed_sessions} of {ov.total_sessions_created} sessions finished
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Peak Study Window</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <Flame className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-base font-extrabold text-[#1E40AF] truncate">{ov.peak_study_hours}</div>
            <p className="mt-1 text-xs text-[#64748B]">Maximum daily concurrent activity</p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Critical Drop-off Point</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEE2E2] text-[#DC2626]">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-bold text-[#DC2626] truncate">{ov.drop_off_point}</div>
            <p className="mt-1 text-[11px] text-[#64748B]">Requires automated retention reshuffle</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Subject Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Study Habit Distribution */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#334155]">
              Weekly Study Hours Distribution
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Total study volume logged per day of the week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly_pattern}>
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
                  <Bar dataKey="hours" name="Study Hours" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Studied Breakdown */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#334155]">
              Core Subjects Studied & Completion Rates
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Curriculum engagement and progress across major academic topics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.subjects_studied.map((sub) => (
              <div key={sub.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#334155]">{sub.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">{sub.hours}h logged</span>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px]">
                      {sub.completion}% Completed
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#EFF4FF]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]"
                    style={{ width: `${sub.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

