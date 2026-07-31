import type { ApiResponse, ChartData, ProgressData } from "@/types";
import {
  dummyChartData,
  dummySessions,
  dummyTopics,
} from "@/lib/dummy-data";
import { getProgressData } from "@/lib/helpers";

const MOCK_DELAY = 600;

export async function getAnalytics(): Promise<ApiResponse<ChartData>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return { success: true, data: dummyChartData };
}

export async function getProgressStats(): Promise<ApiResponse<ProgressData>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return {
    success: true,
    data: getProgressData(dummyTopics, dummySessions),
  };
}

export async function getStudyHours(
  period: "week" | "month" | "year" = "week"
): Promise<ApiResponse<{ labels: string[]; values: number[] }>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  if (period === "week") {
    return {
      success: true,
      data: {
        labels: dummyChartData.weeklyHours.map((d) => d.day),
        values: dummyChartData.weeklyHours.map((d) => d.hours),
      },
    };
  }

  if (period === "month") {
    return {
      success: true,
      data: {
        labels: dummyChartData.monthlyActivity.map((d) => d.month),
        values: dummyChartData.monthlyActivity.map((d) => d.hours),
      },
    };
  }

  return {
    success: true,
    data: {
      labels: dummyChartData.monthlyActivity.map((d) => d.month),
      values: dummyChartData.monthlyActivity.map((d) => d.sessions),
    },
  };
}

export async function getMasteryScore(): Promise<ApiResponse<number>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return { success: true, data: 72 };
}

