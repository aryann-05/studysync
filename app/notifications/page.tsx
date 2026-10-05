"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationCard } from "@/components/notifications/notification-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Inbox, Loader2 } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  groupByDate,
  getUnreadCount,
} from "@/services/notifications";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "reminder" | "revision" | "missed" | "exam"
  >("all");

  const loadNotifs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  const unreadCount = getUnreadCount(notifications);

  const filtered =
    activeFilter === "all"
      ? notifications
      : activeFilter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === activeFilter);

  const grouped = groupByDate(filtered);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filters: { value: typeof activeFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: `Unread (${unreadCount})` },
    { value: "reminder", label: "Reminders" },
    { value: "revision", label: "Revisions" },
    { value: "missed", label: "Missed" },
    { value: "exam", label: "Exam" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay on top of your study schedule."
      >
        <Badge variant="secondary">
          {unreadCount} unread
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={activeFilter === filter.value ? "default" : "outline"}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No notifications</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              You're all caught up! New study reminders and updates will appear
              here.
            </p>
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => (
          <div key={group.date} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {group.date}
            </h2>
            <div className="space-y-3">
              {group.notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

