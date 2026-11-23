"use client";

import { useCallback, useState } from "react";
import { useStudyContext } from "@/context/StudyContext";
import type { StudyPlan, StudySession, Topic } from "@/types";
import { generateStudyPlan, getStudyPlan, submitSessionConfidence } from "@/services/scheduler";

export function useStudyPlan() {
  const {
    topics,
    sessions,
    currentTopic,
    setTopics,
    setCurrentTopic,
    updateTopicConfidence,
    markTopicCompleted,
    markTopicMissed,
    addSession,
    refreshStudyData,
  } = useStudyContext();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStudyPlan();
      if (response.success && response.data) {
        setPlan(response.data);
        setTopics(response.data.topics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load study plan");
    } finally {
      setIsLoading(false);
    }
  }, [setTopics]);

  const generatePlan = useCallback(
    async (topicList: Topic[], examDate: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await generateStudyPlan(topicList, examDate);
        if (response.success) {
          setPlan(response.data);
          setTopics(response.data.topics);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate plan");
      } finally {
        setIsLoading(false);
      }
    },
    [setTopics]
  );

  const submitConfidence = useCallback(
    async (
      topicId: string,
      confidence: Topic["confidence"],
      session?: Partial<StudySession>
    ) => {
      updateTopicConfidence(topicId, confidence);
      markTopicCompleted(topicId);

      const targetSession =
        sessions.find((s) => s.topicId === topicId && !s.completed) ||
        sessions.find((s) => s.topicId === topicId);

      if (targetSession) {
        try {
          await submitSessionConfidence(
            targetSession.id,
            confidence,
            session?.notes
          );
          await refreshStudyData();
        } catch (err) {
          console.error("Failed to submit confidence to backend:", err);
        }
      }
    },
    [sessions, updateTopicConfidence, markTopicCompleted, refreshStudyData]
  );

  return {
    plan,
    topics,
    sessions,
    currentTopic,
    isLoading,
    error,
    loadPlan,
    generatePlan,
    submitConfidence,
    setCurrentTopic,
    markTopicCompleted,
    markTopicMissed,
  };
}

