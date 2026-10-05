"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { StudyPlan, StudySession, Topic } from "@/types";
import { getStudyPlan } from "@/services/scheduler";
import { getToken } from "@/services/api";

interface StudyContextValue {
  topics: Topic[];
  sessions: StudySession[];
  activePlan: StudyPlan | null;
  isLoading: boolean;
  currentTopic: Topic | null;
  setTopics: (topics: Topic[]) => void;
  addTopic: (topic: Topic) => void;
  updateTopic: (topicId: string, data: Partial<Topic>) => void;
  updateTopicConfidence: (
    topicId: string,
    confidence: Topic["confidence"]
  ) => void;
  markTopicCompleted: (topicId: string) => void;
  markTopicMissed: (topicId: string) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  addSession: (session: StudySession) => void;
  refreshStudyData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextValue | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [topics, setTopicsState] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStudyData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setTopicsState([]);
      setSessions([]);
      setActivePlan(null);
      setCurrentTopic(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getStudyPlan();
      if (response.success && response.data) {
        setActivePlan(response.data);
        setTopicsState(response.data.topics);
        setSessions(response.data.sessions);
      } else {
        setActivePlan(null);
        setTopicsState([]);
        setSessions([]);
      }
    } catch (err) {
      console.error("Failed to load study data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStudyData();
  }, [refreshStudyData]);

  const setTopics = useCallback((next: Topic[]) => {
    setTopicsState(next);
  }, []);

  const addTopic = useCallback((topic: Topic) => {
    setTopicsState((prev) => [...prev, topic]);
  }, []);

  const updateTopic = useCallback((topicId: string, data: Partial<Topic>) => {
    setTopicsState((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, ...data } : t))
    );
  }, []);

  const updateTopicConfidence = useCallback(
    (topicId: string, confidence: Topic["confidence"]) => {
      setTopicsState((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, confidence } : t))
      );
    },
    []
  );

  const markTopicCompleted = useCallback((topicId: string) => {
    setTopicsState((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              status: "completed",
              completedDate: new Date().toISOString().split("T")[0],
            }
          : t
      )
    );
  }, []);

  const markTopicMissed = useCallback((topicId: string) => {
    setTopicsState((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, status: "missed" } : t))
    );
  }, []);

  const addSession = useCallback((session: StudySession) => {
    setSessions((prev) => [...prev, session]);
  }, []);

  useEffect(() => {
    if (topics.length > 0 && !currentTopic) {
      const nextUp =
        topics.find((t) => t.status === "new") ??
        topics.find((t) => t.status === "studying") ??
        topics.find((t) => t.status === "missed");
      setCurrentTopic(nextUp ?? topics[0]);
    } else if (topics.length === 0) {
      setCurrentTopic(null);
    }
  }, [topics, currentTopic]);

  return (
    <StudyContext.Provider
      value={{
        topics,
        sessions,
        activePlan,
        isLoading,
        currentTopic,
        setTopics,
        addTopic,
        updateTopic,
        updateTopicConfidence,
        markTopicCompleted,
        markTopicMissed,
        setCurrentTopic,
        addSession,
        refreshStudyData,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudyContext(): StudyContextValue {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudyContext must be used within a StudyProvider");
  }
  return context;
}

