import type { ApiResponse, Notification, NotificationGroup } from "@/types";
import { dummyNotifications } from "@/lib/dummy-data";

const MOCK_DELAY = 500;

export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return { success: true, data: dummyNotifications };
}

export async function markAsRead(
  notificationId: string
): Promise<ApiResponse<Notification>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const notification = dummyNotifications.find((n) => n.id === notificationId);
  return {
    success: true,
    data: {
      ...(notification ?? dummyNotifications[0]),
      read: true,
    },
  };
}

export async function markAllAsRead(): Promise<ApiResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true, data: null, message: "All notifications marked as read" };
}

export async function deleteNotification(
  notificationId: string
): Promise<ApiResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true, data: null, message: "Notification deleted" };
}

export function groupByDate(
  notifications: Notification[]
): NotificationGroup[] {
  const groups: Record<string, Notification[]> = {};

  for (const n of notifications) {
    const date = new Date(n.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(n);
  }

  return Object.entries(groups).map(([date, items]) => ({
    date,
    notifications: items,
  }));
}

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}

