"use client";

import { Activity, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "./dashboard-card";
import { useStudyContext } from "@/context/StudyContext";
import { formatRelativeTime } from "@/lib/utils";

const typeIcons: Record<string, string> = {
  session: "📚",
  topic: "📄",
  revision: "🔄",
  achievement: "🏆",
  reminder: "⏰",
};

export function RecentActivity() {
  const { sessions, activePlan } = useStudyContext();

  const activities = [];

  const completedSessions = sessions
    .filter((s) => s.completed)
    .slice(-3)
    .reverse();

  for (const s of completedSessions) {
    activities.push({
      id: "act-comp-" + s.id,
      type: "session",
      title: `Completed Session: ${s.topicName}`,
      description: `${s.duration} min study completed with ${s.confidence} confidence`,
      timestamp: s.date,
      color: "var(--accent)",
    });
  }

  const upcomingSessions = sessions
    .filter((s) => !s.completed)
    .slice(0, 2);

  for (const s of upcomingSessions) {
    activities.push({
      id: "act-sched-" + s.id,
      type: "reminder",
      title: `Upcoming: ${s.topicName}`,
      description: `Scheduled for ${s.date} (${s.duration} min)`,
      timestamp: s.date,
      color: "var(--primary)",
    });
  }

  if (activePlan) {
    activities.push({
      id: "act-plan-" + activePlan.id,
      type: "achievement",
      title: `Plan Created: ${activePlan.name}`,
      description: `Exam goal target: ${activePlan.examDate}`,
      timestamp: activePlan.createdAt.toISOString(),
      color: "var(--secondary)",
    });
  }

  return (
    <DashboardCard
      title="Recent Activity"
      description="Your latest study actions"
      icon={<Activity className="h-4 w-4 text-primary" />}
      iconClassName="bg-primary/10"
      action={
        <Link
          href="/progress"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
          <BookOpen className="h-8 w-8 mb-2 text-muted-foreground/50" />
          <p>No study activity recorded yet.</p>
          <p className="text-xs">Upload a syllabus or complete a session to see your progress here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {activities.slice(0, 5).map((item) => (
            <li key={item.id} className="flex gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base bg-primary/10"
                aria-hidden
              >
                {typeIcons[item.type] ?? "•"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(item.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

