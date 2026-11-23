"use client";

import { CalendarClock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "./dashboard-card";
import { useStudyContext } from "@/context/StudyContext";
import { getUpcomingRevisions } from "@/lib/helpers";
import { formatDate } from "@/lib/utils";

export function UpcomingRevisions() {
  const { topics } = useStudyContext();
  const revisions = getUpcomingRevisions(topics, 4);

  return (
    <DashboardCard
      title="Upcoming Revisions"
      description="Spaced repetition schedule"
      icon={<CalendarClock className="h-4 w-4 text-secondary" />}
      iconClassName="bg-secondary/10"
      action={
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Calendar <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      {revisions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No revisions scheduled yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {revisions.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: topic.color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.subject}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(topic.dueDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

