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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useStudyContext } from "@/context/StudyContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { sessions, activePlan } = useStudyContext();
  const firstName = user?.name.split(" ")[0] ?? "there";

  const weeklyTarget = activePlan?.weeklyGoal || 28;
  const thisWeekHours = Math.round(
    (sessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.duration, 0) / 60) * 10
  ) / 10;
  const weeklyPercent = Math.min(
    100,
    Math.round((thisWeekHours / Math.max(1, weeklyTarget)) * 100)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}! 👋`}
        description={
          activePlan
            ? `Active Course: ${activePlan.name} · Target Exam: ${activePlan.examDate}`
            : "Here's what's happening with your study plan today."
        }
      />

      {!activePlan && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div>
            <h3 className="font-semibold text-foreground">Get Started with Your Personalized Plan 🚀</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your syllabus (PDF, DOCX, TXT) to automatically extract topics, calculate capacity, and schedule daily sessions.
            </p>
          </div>
          <Button asChild>
            <Link href="/upload">Upload Syllabus</Link>
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExamCountdown />
        <StudyStreak />
        <CompletionProgress />
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Weekly Goal
          </p>
          <p className="mt-2 text-2xl font-bold">
            {thisWeekHours} / {weeklyTarget} hrs
          </p>
          <div className="mt-3 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all"
              style={{ width: `${weeklyPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {weeklyPercent}% of weekly goal reached
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

