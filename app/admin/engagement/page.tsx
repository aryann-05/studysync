"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Flame,
  Users,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { getEngagementAnalytics } from "@/services/admin";
import type { EngagementAnalyticsResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function UserEngagementPage() {
  const [data, setData] = useState<EngagementAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEngagement = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getEngagementAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load user engagement metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Calculating retention rates & platform stickiness..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEE2E2]/50 p-6 text-center">
        <p className="text-sm font-semibold text-[#DC2626]">{error || "Failed to load engagement data."}</p>
        <Button variant="outline" size="sm" onClick={() => fetchEngagement()} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const m = data.metrics;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              User Engagement & Retention Analytics
            </h1>
            <Badge className="bg-[#1E40AF] text-white">Retention Center</Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Longitudinal retention tracking, churn risk indicators, feature popularity, and learner activity ranking.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchEngagement(true)}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">7-Day Retention</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600">{m.retention_7_day}%</div>
            <p className="mt-1 text-xs text-[#64748B]">Active users returning within 1 week</p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">30-Day Retention</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <TrendingUp className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#1E40AF]">{m.retention_30_day}%</div>
            <p className="mt-1 text-xs text-[#64748B]">Monthly platform persistence</p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Returning Ratio</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <Users className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#334155]">{m.returning_users_percentage}%</div>
            <p className="mt-1 text-xs text-[#64748B]">{m.new_users_percentage}% new onboarding cohort</p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-[#64748B]">Daily Stickiness</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF4FF] text-[#1E40AF]">
              <Flame className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#1E40AF]">{m.daily_active_ratio}%</div>
            <p className="mt-1 text-xs text-[#64748B]">DAU to total registered user ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage Popularity Ranking */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#334155]">
            Feature Adoption & Usage Breakdown
          </CardTitle>
          <CardDescription className="text-xs text-[#64748B]">
            Which StudySync tools students interact with most frequently.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.feature_usage.map((feat) => (
            <div key={feat.feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#334155]">{feat.feature}</span>
                <span className="font-bold text-[#1E40AF]">
                  {feat.usage_count} uses ({feat.percentage}%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EFF4FF]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]"
                  style={{ width: `${feat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tables: Most Active vs At-Risk Inactive Users */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Active Learners */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#334155]">
              Core Active Power Users
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Learners with highest session completion and daily platform visits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[#E2E8F0]">
              {data.most_active_users.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#EFF4FF] text-[#1E40AF] text-xs font-bold">
                        {getInitials(u.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/admin/users/${u.user_id}`}
                        className="font-semibold text-xs text-[#1E40AF] hover:underline"
                      >
                        {u.full_name}
                      </Link>
                      <p className="text-[11px] text-[#64748B]">{u.course_name}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Score: {u.engagement_score}/100
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* At Risk Users */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#DC2626]">
              At-Risk Users (High Inactivity)
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Users who have missed scheduled sessions or logged in less than once in 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[#E2E8F0]">
              {data.at_risk_users.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#FEE2E2] text-[#DC2626] text-xs font-bold">
                        {getInitials(u.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/admin/users/${u.user_id}`}
                        className="font-semibold text-xs text-[#DC2626] hover:underline"
                      >
                        {u.full_name}
                      </Link>
                      <p className="text-[11px] text-[#64748B]">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-[#DC2626]/30 text-[#DC2626] bg-[#FEE2E2] text-[10px]">
                    {u.risk_level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

