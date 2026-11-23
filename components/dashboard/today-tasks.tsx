"use client";

import Link from "next/link";
import { CheckCircle2, ListTodo, ArrowRight, Clock } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { Badge } from "@/components/ui/badge";
import { useStudyContext } from "@/context/StudyContext";
import { getTodayTasks } from "@/lib/helpers";
import { formatDuration } from "@/lib/utils";

export function TodayTasks() {
  const { topics } = useStudyContext();
  const tasks = getTodayTasks(topics);
  const completedToday = topics.filter(
    (t) => t.completedDate === new Date().toISOString().split("T")[0]
  ).length;

  return (
    <DashboardCard
      title="Today's Tasks"
      description={`${completedToday} completed today`}
      icon={<ListTodo className="h-4 w-4 text-primary" />}
      iconClassName="bg-primary/10"
      action={
        <Link
          href="/study"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Start studying <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-accent" />
          <p className="text-sm font-medium">All caught up!</p>
          <p className="text-xs text-muted-foreground">
            No tasks scheduled for today.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.slice(0, 4).map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: task.color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.name}</p>
                  <p className="text-xs text-muted-foreground">{task.subject}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(task.estimatedMinutes)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {task.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

