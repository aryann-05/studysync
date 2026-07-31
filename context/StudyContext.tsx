"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { StudySession, Topic } from "@/types";
import { dummySessions, dummyTopics } from "@/lib/dummy-data";

interface StudyContextValue {
  topics: Topic[];
  sessions: StudySession[];
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
}

const StudyContext = createContext<StudyContextValue | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [topics, setTopicsState] = useState<Topic[]>(() => dummyTopics);
  const [sessions, setSessions] = useState<StudySession[]>(() => dummySessions);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    }
  }, [topics, currentTopic]);

  return (
    <StudyContext.Provider
      value={{
        topics,
        sessions,
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

