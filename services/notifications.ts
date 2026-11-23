import type { ApiResponse, Notification, NotificationGroup } from "@/types";
import { post, get } from "@/services/api";

const STORAGE_KEY_READ = "studysync_read_notifications";
const STORAGE_KEY_DELETED = "studysync_deleted_notifications";

function getStoredReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveStoredReadIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(ids)));
  } catch {}
}

function getStoredDeletedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveStoredDeletedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(Array.from(ids)));
  } catch {}
}

/**
 * Register FCM push notification token with backend
 * POST /api/v1/notifications/token
 */
export async function registerFcmToken(token: string): Promise<ApiResponse<any>> {
  try {
    const res = await post<{ status: string; message: string; data: any }>("/notifications/token", {
      token,
    });
    return { success: true, data: res.data, message: res.message };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Failed to register FCM token",
    };
  }
}

/**
 * Dynamically generate real notifications based on active study sessions and schedules
 */
export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  const readIds = getStoredReadIds();
  const deletedIds = getStoredDeletedIds();
  const today = new Date().toISOString().split("T")[0];

  try {
    const [calendarRes, activePlanRes] = await Promise.all([
      get<{
        status: string;
        data: {
          sessions: Array<{
            session_id: string;
            topic_id: string;
            topic_title: string;
            scheduled_date: string;
            duration_hours: number;
            session_type: string;
            is_completed: boolean;
            confidence_score: number | null;
          }>;
        };
      }>("/calendar").catch(() => ({ status: "fail", data: { sessions: [] } })),
      get<{
        status: string;
        data: {
          plan: {
            course_name: string;
            exam_date: string;
          } | null;
        };
      }>("/plans/active").catch(() => ({ status: "fail", data: { plan: null } })),
    ]);

    const sessions = calendarRes.data?.sessions || [];
    const plan = activePlanRes.data?.plan;

    const list: Notification[] = [];

    // Exam countdown notification
    if (plan?.exam_date) {
      const examDays = Math.ceil(
        (new Date(plan.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (examDays > 0) {
        list.push({
          id: "notif-exam-" + plan.exam_date,
          type: "exam",
          title: `Exam in ${examDays} Days: ${plan.course_name}`,
          message: `Your final exam is scheduled for ${plan.exam_date}. Stay consistent with your daily study goals!`,
          timestamp: new Date().toISOString(),
          read: readIds.has("notif-exam-" + plan.exam_date),
          actionUrl: "/calendar",
        });
      }
    }

    // Sessions today
    const todaySessions = sessions.filter((s) => s.scheduled_date === today && !s.is_completed);
    for (const s of todaySessions) {
      const id = "notif-today-" + s.session_id;
      list.push({
        id,
        type: s.session_type === "REVIEW" ? "revision" : "reminder",
        title: s.session_type === "REVIEW" ? "Spaced Revision Due Today" : "Study Session Scheduled",
        message: `Topic: ${s.topic_title} (${s.duration_hours}h allocated).`,
        timestamp: new Date().toISOString(),
        read: readIds.has(id),
        actionUrl: "/study",
      });
    }

    // Overdue sessions (missed)
    const overdueSessions = sessions.filter(
      (s) => s.scheduled_date < today && !s.is_completed
    );
    if (overdueSessions.length > 0) {
      const id = "notif-overdue-" + today;
      list.push({
        id,
        type: "missed",
        title: `${overdueSessions.length} Overdue Session${overdueSessions.length > 1 ? "s" : ""}`,
        message: `You have ${overdueSessions.length} pending session(s). Use our academic priority reshuffle to adjust your schedule.`,
        timestamp: new Date().toISOString(),
        read: readIds.has(id),
        actionUrl: "/calendar",
      });
    }

    // Completed achievement
    const completedCount = sessions.filter((s) => s.is_completed).length;
    if (completedCount >= 5) {
      const id = "notif-achieve-5";
      list.push({
        id,
        type: "achievement",
        title: "Milestone Achieved: 5+ Sessions Completed!",
        message: "Outstanding momentum! Your spaced repetition retention curve is strengthening.",
        timestamp: new Date().toISOString(),
        read: readIds.has(id),
        actionUrl: "/progress",
      });
    }

    const filtered = list.filter((n) => !deletedIds.has(n.id));

    return {
      success: true,
      data: filtered,
    };
  } catch {
    return {
      success: true,
      data: [],
    };
  }
}

export async function markAsRead(
  notificationId: string
): Promise<ApiResponse<Notification>> {
  const readIds = getStoredReadIds();
  readIds.add(notificationId);
  saveStoredReadIds(readIds);

  return {
    success: true,
    data: {
      id: notificationId,
      type: "reminder",
      title: "",
      message: "",
      timestamp: new Date().toISOString(),
      read: true,
    },
  };
}

export async function markAllAsRead(): Promise<ApiResponse<null>> {
  const allRes = await getNotifications();
  const readIds = getStoredReadIds();
  for (const n of allRes.data) {
    readIds.add(n.id);
  }
  saveStoredReadIds(readIds);
  return { success: true, data: null, message: "All notifications marked as read" };
}

export async function deleteNotification(
  notificationId: string
): Promise<ApiResponse<null>> {
  const deletedIds = getStoredDeletedIds();
  deletedIds.add(notificationId);
  saveStoredDeletedIds(deletedIds);
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


