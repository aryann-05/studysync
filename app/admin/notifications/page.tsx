"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  CheckCheck,
  UserPlus,
  FileWarning,
  ServerCrash,
} from "lucide-react";
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/admin";
import type { AdminNotificationItem, NotificationsResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function AdminNotificationsPage() {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "warning" | "critical">("all");

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getAdminNotifications(filter);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              unread_count: Math.max(0, prev.unread_count - 1),
              notifications: prev.notifications.map((n) =>
                n.notification_id === id ? { ...n, is_read: true } : n
              ),
            }
          : null
      );
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setData((prev) =>
        prev
          ? {
              ...prev,
              unread_count: 0,
              notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
            }
          : null
      );
    } catch (e) {}
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-[#DC2626] text-white">Critical</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Warning</Badge>;
      default:
        return <Badge className="bg-[#EFF4FF] text-[#1E40AF] border-[#1E40AF]/20">Info</Badge>;
    }
  };

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === "critical") return <AlertCircle className="h-4 w-4 text-[#DC2626]" />;
    if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    if (type === "new_user") return <UserPlus className="h-4 w-4 text-[#1E40AF]" />;
    if (type === "upload_failure") return <FileWarning className="h-4 w-4 text-[#DC2626]" />;
    if (type === "system_error") return <ServerCrash className="h-4 w-4 text-[#DC2626]" />;
    return <Info className="h-4 w-4 text-[#1E40AF]" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E40AF] sm:text-3xl">
              Admin Notification & Alert Center
            </h1>
            {data?.unread_count ? (
              <Badge className="bg-[#DC2626] text-white font-bold">
                {data.unread_count} Unread
              </Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                All Cleared
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Automated alerts for user onboarding, unusual logins, upload integrity, test activity, and system warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={!data?.unread_count}
            className="text-xs"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark All Read
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="text-xs border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#EFF4FF]"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b pb-3 text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === "all" ? "bg-[#1E40AF] text-white" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          All Alerts
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === "unread" ? "bg-[#1E40AF] text-white" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter("warning")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === "warning" ? "bg-[#1E40AF] text-white" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Warnings
        </button>
        <button
          onClick={() => setFilter("critical")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === "critical" ? "bg-[#DC2626] text-white" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Critical
        </button>
      </div>

      {/* Notifications List */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="md" label="Loading alerts..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-[#DC2626]">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={() => fetchNotifications()} className="mt-3">
                Retry
              </Button>
            </div>
          ) : !data || data.notifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-2 opacity-60" />
              <p className="text-sm font-medium">No alerts matching this filter.</p>
              <p className="text-xs text-muted-foreground mt-1">Platform operations are performing normally.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {data.notifications.map((n) => (
                <div
                  key={n.notification_id}
                  className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                    !n.is_read ? "bg-[#EFF4FF]/30 font-medium" : "bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border shadow-xs mt-0.5">
                      {getNotificationIcon(n.type, n.severity)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#334155]">{n.title}</p>
                        {getSeverityBadge(n.severity)}
                        {!n.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1E40AF]" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#64748B]">{n.message}</p>
                      <p className="mt-1.5 text-[10px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(n.notification_id)}
                      className="text-[11px] text-[#1E40AF] hover:bg-[#EFF4FF] shrink-0"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

