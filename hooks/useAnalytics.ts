"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChartData, ProgressData } from "@/types";
import {
  getAnalytics,
  getMasteryScore,
  getProgressStats,
  getStudyHours,
} from "@/services/analytics";
import { useStudyContext } from "@/context/StudyContext";
import { getProgressData } from "@/lib/helpers";

export function useAnalytics() {
  const { topics, sessions } = useStudyContext();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [masteryScore, setMasteryScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsRes, progressRes, masteryRes] = await Promise.all([
        getAnalytics(),
        getProgressStats(),
        getMasteryScore(),
      ]);
      setChartData(analyticsRes.data);
      setProgress(progressRes.data);
      setMasteryScore(masteryRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const liveProgress = progress
    ? getProgressData(topics, sessions)
    : progress;

  return {
    chartData,
    progress: liveProgress ?? progress,
    masteryScore,
    isLoading,
    error,
    refetch: loadAnalytics,
    getStudyHours,
  };
}

