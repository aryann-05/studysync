"use client";

import { Target } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { Progress } from "@/components/ui/progress";
import { useStudyContext } from "@/context/StudyContext";
import { calculateCompletionPercent } from "@/lib/helpers";

export function CompletionProgress() {
  const { topics } = useStudyContext();
  const completion = calculateCompletionPercent(topics);
  const completed = topics.filter(
    (t) => t.status === "completed" || t.status === "revised"
  ).length;

  return (
    <DashboardCard
      title="Completion %"
      description="Syllabus progress"
      icon={<Target className="h-4 w-4 text-accent" />}
      iconClassName="bg-accent/10"
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold">{completion}%</span>
        <span className="text-sm text-muted-foreground">
          {completed}/{topics.length} topics
        </span>
      </div>
      <Progress value={completion} className="mt-4 h-2.5" />
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-accent/5 p-2">
          <p className="text-lg font-bold text-accent">{completed}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Done
          </p>
        </div>
        <div className="rounded-lg bg-warning/5 p-2">
          <p className="text-lg font-bold text-warning">
            {topics.filter((t) => t.status === "studying").length}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            In Progress
          </p>
        </div>
        <div className="rounded-lg bg-primary/5 p-2">
          <p className="text-lg font-bold text-primary">
            {topics.filter((t) => t.status === "new" || t.status === "missed").length}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Pending
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}

