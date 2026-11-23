"use client";

import Link from "next/link";
import {
  Bell,
  CalendarClock,
  AlertTriangle,
  CalendarDays,
  Trophy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification } from "@/types";

const notificationStyles: Record<
  Notification["type"],
  { icon: typeof Bell; color: string; bg: string }
> = {
  reminder: {
    icon: Bell,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  revision: {
    icon: CalendarClock,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  missed: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  exam: {
    icon: CalendarDays,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  achievement: {
    icon: Trophy,
    color: "text-accent",
    bg: "bg-accent/10",
  },
};

interface NotificationCardProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  const { icon: Icon, color, bg } =
    notificationStyles[notification.type] ?? notificationStyles.reminder;

  const content = (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4 transition-colors",
        notification.read ? "bg-card" : "bg-primary/[0.03] border-primary/20"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          bg,
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold">{notification.title}</p>
          {!notification.read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>

      {!notification.read && onMarkRead && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMarkRead(notification.id)}
          className="shrink-0 self-start"
          aria-label="Mark as read"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  if (notification.actionUrl) {
    return <Link href={notification.actionUrl} className="block">{content}</Link>;
  }

  return content;
}

