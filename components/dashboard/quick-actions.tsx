"use client";

import Link from "next/link";
import { Upload, CalendarDays, BookOpen, BarChart3 } from "lucide-react";
import { DashboardCard } from "./dashboard-card";

const actions = [
  {
    label: "Upload Syllabus",
    description: "Add a new syllabus",
    href: "/upload",
    icon: Upload,
    color: "text-primary bg-primary/10",
  },
  {
    label: "Start Session",
    description: "Continue studying",
    href: "/study",
    icon: BookOpen,
    color: "text-accent bg-accent/10",
  },
  {
    label: "View Calendar",
    description: "See your schedule",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-secondary bg-secondary/10",
  },
  {
    label: "Analytics",
    description: "Track your progress",
    href: "/analytics",
    icon: BarChart3,
    color: "text-warning bg-warning/10",
  },
];

export function QuickActions() {
  return (
    <DashboardCard
      title="Quick Actions"
      description="Shortcuts to common tasks"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${action.color}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}

