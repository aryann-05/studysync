"use client";

import { useCallback, useState } from "react";
import { useStudyContext } from "@/context/StudyContext";
import type { StudyPlan, StudySession, Topic } from "@/types";
import { generateStudyPlan, getStudyPlan } from "@/services/scheduler";

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
  } = useStudyContext();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStudyPlan();
      if (response.success) {
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
    (
      topicId: string,
      confidence: Topic["confidence"],
      session?: Partial<StudySession>
    ) => {
      updateTopicConfidence(topicId, confidence);
      markTopicCompleted(topicId);

      if (session) {
        addSession({
          id: "session-" + Date.now(),
          topicId,
          topicName: session.topicName ?? "",
          date: new Date().toISOString().split("T")[0],
          startTime: session.startTime ?? "09:00",
          duration: session.duration ?? 60,
          confidence,
          completed: true,
          notes: session.notes,
        });
      }
    },
    [updateTopicConfidence, markTopicCompleted, addSession]
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

