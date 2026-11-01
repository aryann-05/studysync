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
      primary: "#059669",
      secondary: "#047857",
      accent: "#10B981",
      warning: "#F59E0B",
      destructive: "#EF4444",
      grid: "#D1FAE5",
      text: "#475569",
    };
  }

  const isDark = document.documentElement.classList.contains("dark");
  return {
    primary: isDark ? "#10B981" : "#059669",
    secondary: isDark ? "#059669" : "#047857",
    accent: isDark ? "#34D399" : "#10B981",
    warning: isDark ? "#FBBF24" : "#F59E0B",
    destructive: isDark ? "#F87171" : "#EF4444",
    grid: isDark ? "#134E3F" : "#D1FAE5",
    text: isDark ? "#A7F3D0" : "#475569",
  };
}

