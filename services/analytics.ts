import type { ApiResponse, ChartData, ProgressData } from "@/types";
import { get } from "@/services/api";

interface BackendAnalytics {
  overall_completion: number;
  current_streak: number;
  total_sessions: number;
  completed_sessions: number;
  pending_sessions: number;
  overdue_sessions: number;
  mastery: Record<string, number>;
  predicted_syllabus_coverage: number;
  weak_topics: Array<{
    topic_id: string;
    title: string;
    confidence: number;
    ease_factor: number;
    mastery: number;
  }>;
  mastered_topics: Array<{
    topic_id: string;
    title: string;
    confidence: number;
    ease_factor: number;
    mastery: number;
  }>;
}

export async function getRawAnalytics(): Promise<BackendAnalytics | null> {
  try {
    const res = await get<{
      status: string;
      data: BackendAnalytics;
    }>("/analytics");
    return res.data;
  } catch {
    return null;
  }
}

export async function getAnalytics(): Promise<ApiResponse<ChartData>> {
  try {
    const [analytics, calendarRes] = await Promise.all([
      getRawAnalytics(),
      get<{
        status: string;
        data: {
          sessions: Array<{
            session_id: string;
            topic_title: string;
            scheduled_date: string;
            duration_hours: number;
            session_type: string;
            is_completed: boolean;
            confidence_score: number | null;
          }>;
        };
      }>("/calendar").catch(() => ({ status: "fail", data: { sessions: [] } })),
    ]);

    const sessions = calendarRes.data?.sessions || [];
    const completedSessions = sessions.filter((s) => s.is_completed);

    // 1. Weekly hours (Mon-Sun)
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyHoursMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    for (const s of completedSessions) {
      const d = new Date(s.scheduled_date);
      const dayIndex = (d.getDay() + 6) % 7; // Convert 0 (Sun) to 6
      const dayName = dayNames[dayIndex];
      weeklyHoursMap[dayName] = (weeklyHoursMap[dayName] || 0) + Number(s.duration_hours || 0);
    }

    const weeklyHours = dayNames.map((day) => ({
      day,
      hours: Math.round(weeklyHoursMap[day] * 10) / 10,
      target: 4,
    }));

    // 2. Confidence Trend
    const confidencePoints = completedSessions
      .filter((s) => s.confidence_score !== null && s.confidence_score !== undefined)
      .slice(-10)
      .map((s) => ({
        date: s.scheduled_date ? s.scheduled_date.slice(5) : "Day",
        score: Math.round(((s.confidence_score ?? 3) / 5) * 100),
      }));

    const confidenceTrend =
      confidencePoints.length > 0
        ? confidencePoints
        : [
            { date: "Day 1", score: 60 },
            { date: "Day 2", score: 70 },
            { date: "Day 3", score: 80 },
          ];

    // 3. Overall Progress
    const totalSessions = analytics?.total_sessions || sessions.length;
    const completedCount = analytics?.completed_sessions || completedSessions.length;
    const completionPercent = analytics?.overall_completion || 0;
    const streak = analytics?.current_streak || 0;

    let avgMastery = 0;
    if (analytics?.mastery) {
      const values = Object.values(analytics.mastery);
      if (values.length > 0) {
        avgMastery = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
    }

    const progress: ProgressData = {
      totalTopics: totalSessions,
      completedTopics: completedCount,
      remainingTopics: Math.max(0, totalSessions - completedCount),
      completionPercent,
      studyStreak: streak,
      masteryScore: avgMastery,
    };

    // 4. Topic distribution
    const topicDistribution = [
      { name: "Mastered", value: analytics?.mastered_topics?.length || 0, color: "var(--accent)" },
      { name: "In Progress", value: analytics?.pending_sessions || 0, color: "var(--primary)" },
      { name: "Needs Review", value: analytics?.weak_topics?.length || 0, color: "var(--warning)" },
      { name: "Overdue", value: analytics?.overdue_sessions || 0, color: "var(--destructive)" },
    ].filter((item) => item.value > 0);

    const fallbackDistribution =
      topicDistribution.length > 0
        ? topicDistribution
        : [
            { name: "Pending", value: 1, color: "var(--primary)" },
          ];

    // 5. Subject hours
    const subjectHours = Object.entries(analytics?.mastery || {}).map(([subject, score]) => ({
      subject,
      hours: Math.round(score / 5) || 5,
      color: "var(--primary)",
    }));

    // 6. Monthly activity
    const monthlyActivity = [
      { month: "Current", sessions: completedCount, hours: Math.round(completedSessions.reduce((sum, s) => sum + s.duration_hours, 0)) },
    ];

    const chartData: ChartData = {
      weeklyHours,
      confidenceTrend,
      progress,
      topicDistribution: fallbackDistribution,
      subjectHours: subjectHours.length > 0 ? subjectHours : [{ subject: "General", hours: 4, color: "var(--primary)" }],
      monthlyActivity,
    };

    return {
      success: true,
      data: chartData,
    };
  } catch (error) {
    return {
      success: false,
      data: {
        weeklyHours: [],
        confidenceTrend: [],
        progress: {
          totalTopics: 0,
          completedTopics: 0,
          remainingTopics: 0,
          completionPercent: 0,
          studyStreak: 0,
          masteryScore: 0,
        },
        topicDistribution: [],
        subjectHours: [],
        monthlyActivity: [],
      },
      error: error instanceof Error ? error.message : "Failed to load analytics",
    };
  }
}

export async function getProgressStats(): Promise<ApiResponse<ProgressData>> {
  const analytics = await getRawAnalytics();
  let avgMastery = 0;
  if (analytics?.mastery) {
    const values = Object.values(analytics.mastery);
    if (values.length > 0) {
      avgMastery = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }
  }

  const total = analytics?.total_sessions || 0;
  const completed = analytics?.completed_sessions || 0;

  return {
    success: true,
    data: {
      totalTopics: total,
      completedTopics: completed,
      remainingTopics: Math.max(0, total - completed),
      completionPercent: analytics?.overall_completion || 0,
      studyStreak: analytics?.current_streak || 0,
      masteryScore: avgMastery,
    },
  };
}

export async function getStudyHours(
  period: "week" | "month" | "year" = "week"
): Promise<ApiResponse<{ labels: string[]; values: number[] }>> {
  const analyticsRes = await getAnalytics();
  const data = analyticsRes.data;

  if (period === "week") {
    return {
      success: true,
      data: {
        labels: data.weeklyHours.map((d) => d.day),
        values: data.weeklyHours.map((d) => d.hours),
      },
    };
  }

  return {
    success: true,
    data: {
      labels: data.monthlyActivity.map((d) => d.month),
      values: data.monthlyActivity.map((d) => d.hours),
    },
  };
}

export async function getMasteryScore(): Promise<ApiResponse<number>> {
  const analytics = await getRawAnalytics();
  let avgMastery = 0;
  if (analytics?.mastery) {
    const values = Object.values(analytics.mastery);
    if (values.length > 0) {
      avgMastery = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }
  }
  return { success: true, data: avgMastery };
}


