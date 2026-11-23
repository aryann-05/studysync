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
      primary: "#1E40AF",
      secondary: "#3B82F6",
      accent: "#DC2626",
      warning: "#F59E0B",
      destructive: "#DC2626",
      grid: "#E2E8F0",
      text: "#64748B",
    };
  }

  const isDark = document.documentElement.classList.contains("dark");
  return {
    primary: isDark ? "#3B82F6" : "#1E40AF",
    secondary: isDark ? "#60A5FA" : "#3B82F6",
    accent: isDark ? "#EF4444" : "#DC2626",
    warning: isDark ? "#FBBF24" : "#F59E0B",
    destructive: isDark ? "#EF4444" : "#DC2626",
    grid: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#94A3B8" : "#64748B",
  };
}

