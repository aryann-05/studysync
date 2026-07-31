"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "./dashboard-card";
import { Badge } from "@/components/ui/badge";
import { useStudyContext } from "@/context/StudyContext";
import { getWeakTopics } from "@/lib/helpers";
import { CONFIDENCE_EMOJIS } from "@/lib/constants";

export function WeakTopics() {
  const { topics } = useStudyContext();
  const weak = getWeakTopics(topics).slice(0, 4);

  return (
    <DashboardCard
      title="Weak Topics"
      description="Topics needing more attention"
      icon={<AlertTriangle className="h-4 w-4 text-warning" />}
      iconClassName="bg-warning/10"
      action={
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      {weak.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No weak topics. Great job! 🎉
        </p>
      ) : (
        <ul className="space-y-2">
          {weak.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-lg" aria-hidden>
                  {CONFIDENCE_EMOJIS.low}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.subject} · Low confidence
                  </p>
                </div>
              </div>
              <Badge variant="warning" className="shrink-0">
                Needs review
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

