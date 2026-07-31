import type { ApiResponse, StudyPlan, StudySession, Topic } from "@/types";
import { dummySessions, dummyTopics } from "@/lib/dummy-data";

const MOCK_DELAY = 800;

export async function getStudyPlan(): Promise<ApiResponse<StudyPlan>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    data: {
      id: "plan-1",
      userId: "user-1",
      name: "Semester 2 Final Exam Plan",
      createdAt: new Date("2025-04-01"),
      updatedAt: new Date("2025-05-01"),
      examDate: "2025-08-15",
      topics: dummyTopics,
      sessions: dummySessions,
      weeklyGoal: 28,
    },
  };
}

export async function generateStudyPlan(
  topics: Topic[],
  examDate: string
): Promise<ApiResponse<StudyPlan>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    data: {
      id: "plan-" + Date.now(),
      userId: "user-1",
      name: "Generated Study Plan",
      createdAt: new Date(),
      updatedAt: new Date(),
      examDate,
      topics,
      sessions: dummySessions,
      weeklyGoal: 28,
    },
    message: "Study plan generated successfully",
  };
}

export async function submitSessionConfidence(
  sessionId: string,
  confidence: "high" | "medium" | "low",
  notes?: string
): Promise<ApiResponse<StudySession>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  const session = dummySessions.find((s) => s.id === sessionId);
  if (!session) {
    return {
      success: false,
      data: null as unknown as StudySession,
      error: "Session not found",
    };
  }

  return {
    success: true,
    data: {
      ...session,
      confidence,
      notes: notes ?? session.notes,
      completed: true,
    },
    message: "Confidence submitted. Study plan updated.",
  };
}

export async function completeSession(
  sessionId: string
): Promise<ApiResponse<StudySession>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    data: {
      id: sessionId,
      topicId: "t3",
      topicName: "Integration Techniques",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      duration: 80,
      confidence: "medium",
      completed: true,
    },
    message: "Session completed! Great work!",
  };
}

export async function reshufflePlan(): Promise<ApiResponse<StudyPlan>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    data: {
      id: "plan-1",
      userId: "user-1",
      name: "Reshuffled Study Plan",
      createdAt: new Date("2025-04-01"),
      updatedAt: new Date(),
      examDate: "2025-08-15",
      topics: [...dummyTopics].sort(() => Math.random() - 0.5),
      sessions: dummySessions,
      weeklyGoal: 28,
    },
    message: "Study plan has been reshuffled to cover missed sessions",
  };
}

export async function getTodaySession(): Promise<ApiResponse<StudySession | null>> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: true,
    data: dummySessions.find((s) => !s.completed) ?? null,
  };
}

