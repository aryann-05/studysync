"use client";

import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "./dashboard-card";
import { dummyActivity } from "@/lib/dummy-data";
import { formatRelativeTime } from "@/lib/utils";

const typeIcons: Record<string, string> = {
  session: "📚",
  topic: "📄",
  revision: "🔄",
  achievement: "🏆",
  reminder: "⏰",
};

export function RecentActivity() {
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
      <ul className="space-y-4">
        {dummyActivity.slice(0, 5).map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: `${item.color}1A` }}
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
    </DashboardCard>
  );
}

