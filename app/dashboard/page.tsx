"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { StudyStreak } from "@/components/dashboard/study-streak";
import { WeakTopics } from "@/components/dashboard/weak-topics";
import { CompletionProgress } from "@/components/dashboard/completion-progress";
import { UpcomingRevisions } from "@/components/dashboard/upcoming-revisions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { WeeklyHoursChart } from "@/components/charts/weekly-hours-chart";
import { ConfidenceTrendChart } from "@/components/charts/confidence-trend-chart";
import { ProgressChart } from "@/components/charts/progress-chart";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}! 👋`}
        description="Here's what's happening with your study plan today."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExamCountdown />
        <StudyStreak />
        <CompletionProgress />
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Weekly Goal
          </p>
          <p className="mt-2 text-2xl font-bold">24.5 / 28 hrs</p>
          <div className="mt-3 h-2 rounded-full bg-muted">
            <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-secondary to-accent" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            87% of weekly goal reached
          </p>
        </div>
      </div>

      {/* Tasks & weak topics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TodayTasks />
        <WeakTopics />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyHoursChart />
        </div>
        <ConfidenceTrendChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        <UpcomingRevisions />
      </div>

      {/* Activity & quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}

