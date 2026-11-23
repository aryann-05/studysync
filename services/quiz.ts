import { get, post } from "@/services/api";
import type {
  ApiResponse,
  Quiz,
  QuizSubmissionResult,
  WeakTopicFocus,
} from "@/types";

export interface QuizzesOverviewResponse {
  plan: {
    plan_id: string;
    course_name: string;
    start_date: string;
    exam_date: string;
  } | null;
  quizzes: Quiz[];
  focus_topics: WeakTopicFocus[];
}

/**
 * Fetch all quizzes and topic focus summary for active study plan
 */
export async function fetchQuizzes(planId?: string): Promise<ApiResponse<QuizzesOverviewResponse>> {
  const url = planId ? `/quizzes?plan_id=${encodeURIComponent(planId)}` : "/quizzes";
  const res = await get<{ status: string; message: string; data: QuizzesOverviewResponse }>(url);
  return {
    success: res.status === "success",
    data: res.data,
    message: res.message,
  };
}

/**
 * Fetch single quiz with questions
 */
export async function fetchQuizDetails(quizId: string): Promise<ApiResponse<Quiz>> {
  const res = await get<{ status: string; message: string; data: Quiz }>(
    `/quizzes/${encodeURIComponent(quizId)}`
  );
  return {
    success: res.status === "success",
    data: res.data,
    message: res.message,
  };
}

/**
 * Submit answers for grading, marks calculation, and focus feedback
 */
export async function submitQuizAnswers(
  quizId: string,
  answers: Array<{ question_id: string; selected_index: number }>
): Promise<ApiResponse<QuizSubmissionResult>> {
  const res = await post<{ status: string; message: string; data: QuizSubmissionResult }>(
    `/quizzes/${encodeURIComponent(quizId)}/submit`,
    { answers }
  );
  return {
    success: res.status === "success",
    data: res.data,
    message: res.message,
  };
}
