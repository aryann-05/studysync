"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  action,
}: ChartContainerProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className="h-[260px]">{children}</CardContent>
    </Card>
  );
}

export function getChartColors() {
  if (typeof window === "undefined") {
    return {
      primary: "#2563EB",
      secondary: "#4F46E5",
      accent: "#10B981",
      warning: "#F59E0B",
      destructive: "#EF4444",
      grid: "#E2E8F0",
      text: "#64748B",
    };
  }

  const isDark = document.documentElement.classList.contains("dark");
  return {
    primary: "#2563EB",
    secondary: "#4F46E5",
    accent: "#10B981",
    warning: "#F59E0B",
    destructive: "#EF4444",
    grid: isDark ? "#1E293B" : "#E2E8F0",
    text: isDark ? "#94A3B8" : "#64748B",
  };
}

