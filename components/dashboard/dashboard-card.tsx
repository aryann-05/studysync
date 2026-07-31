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

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconClassName?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function DashboardCard({
  title,
  description,
  icon,
  iconClassName,
  children,
  className,
  action,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            {icon && (
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg bg-muted",
                  iconClassName
                )}
              >
                {icon}
              </span>
            )}
            {title}
          </CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

