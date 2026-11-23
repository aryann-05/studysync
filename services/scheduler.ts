import type { ApiResponse, StudyPlan, StudySession, Topic } from "@/types";
import { get, post } from "@/services/api";

/**
 * Get active study plan, topics, and schedule from backend
 * GET /api/v1/plans/active
 */
export async function getStudyPlan(): Promise<ApiResponse<StudyPlan | null>> {
  try {
    const response = await get<{
      status: string;
      message: string;
      data: {
        plan: {
          plan_id: string;
          course_name: string;
          start_date: string;
          exam_date: string;
          is_active: boolean;
          created_at: string;
          topics: Array<{
            topic_id: string;
            parent_topic_id: string | null;
            title: string;
            estimated_hours: number;
            difficulty_weight: number;
            ease_factor: number;
            repetition_number: number;
          }>;
          sessions: Array<{
            session_id: string;
            topic_id: string;
            topic_title: string;
            scheduled_date: string;
            duration_hours: number;
            session_type: string;
            is_completed: boolean;
            confidence_score: number | null;
            completed_at: string | null;
          }>;
        } | null;
      };
    }>("/plans/active");

    const rawPlan = response.data?.plan;
    if (!rawPlan) {
      return { success: true, data: null, message: "No active plan found" };
    }

    const topics: Topic[] = rawPlan.topics.map((t) => {
      const weight = Number(t.difficulty_weight) || 1.0;
      const diff: "easy" | "medium" | "hard" =
        weight >= 1.3 ? "hard" : weight <= 0.9 ? "easy" : "medium";

      return {
        id: t.topic_id,
        name: t.title,
        subject: rawPlan.course_name,
        difficulty: diff,
        status: t.repetition_number > 0 ? "revised" : "new",
        confidence:
          t.ease_factor >= 2.5
            ? "high"
            : t.ease_factor <= 1.8
            ? "low"
            : "medium",
        estimatedMinutes: Math.round((Number(t.estimated_hours) || 1.0) * 60),
        actualMinutes: 0,
        dueDate: rawPlan.exam_date,
        notes: `Ease Factor: ${t.ease_factor}. Repetitions: ${t.repetition_number}`,
      };
    });

    const sessions: StudySession[] = rawPlan.sessions.map((s) => {
      let conf: "high" | "medium" | "low" = "medium";
      if (s.confidence_score !== null && s.confidence_score !== undefined) {
        if (s.confidence_score >= 4) conf = "high";
        else if (s.confidence_score <= 2) conf = "low";
      }

      return {
        id: s.session_id,
        topicId: s.topic_id,
        topicName: s.topic_title,
        date: s.scheduled_date,
        startTime: "09:00",
        duration: Math.round(Number(s.duration_hours) * 60),
        confidence: conf,
        completed: s.is_completed,
        notes: `Type: ${s.session_type}`,
      };
    });

    const studyPlan: StudyPlan = {
      id: rawPlan.plan_id,
      userId: "",
      name: rawPlan.course_name,
      createdAt: new Date(rawPlan.created_at),
      updatedAt: new Date(),
      examDate: rawPlan.exam_date,
      topics,
      sessions,
      weeklyGoal: Math.round(rawPlan.sessions.reduce((acc, s) => acc + s.duration_hours, 0) / 4) || 28,
    };

    return {
      success: true,
      data: studyPlan,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to load study plan",
    };
  }
}

/**
 * Generate a new study plan via backend
 * POST /api/v1/plans/generate
 */
export async function generateStudyPlan(
  topics: Topic[],
  examDate: string,
  extra?: { courseName?: string; fileId?: string; startDate?: string; dailyMaxHours?: number; modules?: any[] }
): Promise<ApiResponse<StudyPlan>> {
  const today = new Date().toISOString().split("T")[0];
  const payload = {
    course_name: extra?.courseName || "General Course",
    file_id: extra?.fileId,
    modules: extra?.modules,
    start_date: extra?.startDate || today,
    exam_date: examDate,
    daily_max_hours: extra?.dailyMaxHours || 3.5,
  };

  const response = await post<{
    status: string;
    message: string;
    data: any;
  }>("/plans/generate", payload);

  const planRes = await getStudyPlan();
  if (planRes.success && planRes.data) {
    return {
      success: true,
      data: planRes.data,
      message: response.message,
    };
  }

  return {
    success: true,
    data: {
      id: response.data.plan_id,
      userId: "",
      name: response.data.course_name,
      createdAt: new Date(),
      updatedAt: new Date(),
      examDate: response.data.exam_date,
      topics,
      sessions: [],
      weeklyGoal: 28,
    },
    message: response.message,
  };
}

/**
 * Submit session confidence rating using SRS SuperMemo SM-2 & Adaptive Learning
 * POST /api/v1/sessions/confidence
 */
export async function submitSessionConfidence(
  sessionId: string,
  confidence: "high" | "medium" | "low" | number,
  notes?: string
): Promise<ApiResponse<StudySession>> {
  let score = 3;
  if (typeof confidence === "number") {
    score = Math.max(1, Math.min(5, confidence));
  } else if (confidence === "high") {
    score = 5;
  } else if (confidence === "low") {
    score = 1;
  } else {
    score = 3;
  }

  const response = await post<{
    status: string;
    message: string;
    data: {
      completed_session: {
        session_id: string;
        topic_id: string;
        scheduled_date: string;
        confidence_score: number;
        is_completed: boolean;
      };
      next_review_session?: {
        session_id: string;
        topic_id: string;
        scheduled_date: string;
        session_type: string;
        duration_hours: number;
      };
      sm2: {
        repetition_number: number;
        ease_factor: number;
        interval_days: number;
        remedial_created?: boolean;
      };
    };
  }>("/sessions/confidence", {
    session_id: sessionId,
    confidence_score: score,
  });

  const completed = response.data?.completed_session;

  return {
    success: true,
    data: {
      id: sessionId,
      topicId: completed?.topic_id || "",
      topicName: notes || "Topic",
      date: completed?.scheduled_date ? String(completed.scheduled_date).split("T")[0] : new Date().toISOString().split("T")[0],
      startTime: "09:00",
      duration: 60,
      confidence: typeof confidence === "number" ? (confidence >= 4 ? "high" : confidence <= 2 ? "low" : "medium") : confidence,
      completed: true,
      notes: notes ?? (response.data?.sm2?.remedial_created ? "Low score: Remedial session scheduled." : "SM-2 review interval updated."),
    },
    message: response.message || "Confidence submitted. Adaptive learning schedule updated.",
  };
}

export async function completeSession(
  sessionId: string
): Promise<ApiResponse<StudySession>> {
  return submitSessionConfidence(sessionId, "high");
}

/**
 * Reshuffle overdue sessions using academic priority algorithm
 * POST /api/v1/plans/reshuffle
 */
export async function reshufflePlan(): Promise<ApiResponse<any>> {
  const response = await post<{
    status: string;
    message: string;
    data: {
      reshuffled_count: number;
      overdue_count: number;
      reshuffled_sessions: any[];
    };
  }>("/plans/reshuffle");

  return {
    success: true,
    data: response.data,
    message: response.message || `Reshuffled ${response.data.reshuffled_count} overdue sessions.`,
  };
}

/**
 * Get today's study session for the authenticated user
 */
export async function getTodaySession(): Promise<ApiResponse<StudySession | null>> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const calendarRes = await get<{
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
    }>(`/calendar?date=${today}`);

    const sessions = calendarRes.data?.sessions || [];
    const pending = sessions.find((s) => !s.is_completed);

    if (pending) {
      return {
        success: true,
        data: {
          id: pending.session_id,
          topicId: pending.topic_id,
          topicName: pending.topic_title,
          date: pending.scheduled_date,
          startTime: "09:00",
          duration: Math.round(Number(pending.duration_hours) * 60),
          confidence: "medium",
          completed: false,
        },
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch {
    return {
      success: true,
      data: null,
    };
  }
}


