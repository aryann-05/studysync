"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Clock,
  CheckCircle2,
  Target,
  TrendingUp,
  Flame,
  Brain,
} from "lucide-react";
import { WeeklyHoursChart } from "@/components/charts/weekly-hours-chart";
import { ConfidenceTrendChart } from "@/components/charts/confidence-trend-chart";
import { HoursAreaChart } from "@/components/charts/hours-area-chart";
import { MasteryPieChart } from "@/components/charts/mastery-pie-chart";
import { TopicsBarChart } from "@/components/charts/topics-bar-chart";
import { ProgressChart } from "@/components/charts/progress-chart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const { chartData, progress, masteryScore, isLoading } = useAnalytics();

  if (isLoading || !chartData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Loading your study analytics..." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep insights into your study performance."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Study Hours"
          value={`${progress?.completionPercent ? 24.5 : 24.5}h`}
          icon={Clock}
          iconClassName="bg-primary/10 text-primary"
          trend="up"
          trendValue="8%"
        />
        <StatCard
          title="Completed"
          value={progress?.completedTopics ?? 0}
          icon={CheckCircle2}
          iconClassName="bg-accent/10 text-accent"
          trend="up"
          trendValue="3"
        />
        <StatCard
          title="Remaining"
          value={progress?.remainingTopics ?? 0}
          icon={Target}
          iconClassName="bg-warning/10 text-warning"
          trend="down"
          trendValue="2"
        />
        <StatCard
          title="Confidence"
          value={`${progress?.masteryScore ?? masteryScore}%`}
          icon={TrendingUp}
          iconClassName="bg-secondary/10 text-secondary"
          trend="up"
          trendValue="5%"
        />
        <StatCard
          title="Mastery"
          value={`${masteryScore}%`}
          icon={Brain}
          iconClassName="bg-violet-500/10 text-violet-500"
          trend="up"
          trendValue="4%"
        />
        <StatCard
          title="Streak"
          value={`${progress?.studyStreak ?? 0}d`}
          icon={Flame}
          iconClassName="bg-orange-500/10 text-orange-500"
          trend="up"
          trendValue="1"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyHoursChart />
        <HoursAreaChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ConfidenceTrendChart />
        </div>
        <MasteryPieChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopicsBarChart />
        <ProgressChart title="Study Sessions Trend" description="Sessions completed per month" />
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Avg session length", value: "1h 32m" },
          { label: "Best day", value: "Saturday" },
          { label: "Active streak", value: `${progress?.studyStreak ?? 0} days` },
          { label: "Total sessions", value: "48" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-lg font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

