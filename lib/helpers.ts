import type { Topic, StudySession, ProgressData } from "@/types";

export function calculateCompletionPercent(topics: Topic[]): number {
  if (topics.length === 0) return 0;
  const completed = topics.filter(
    (t) => t.status === "completed" || t.status === "revised"
  ).length;
  return Math.round((completed / topics.length) * 100);
}

export function calculateStudyStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions]
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const sessionDate = new Date(sorted[i].date);
    sessionDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getWeakTopics(topics: Topic[]): Topic[] {
  return topics.filter(
    (t) =>
      t.confidence === "low" &&
      (t.status === "studying" || t.status === "new" || t.status === "missed")
  );
}

export function getStrongTopics(topics: Topic[]): Topic[] {
  return topics.filter(
    (t) => t.confidence === "high" && t.status === "completed"
  );
}

export function getUpcomingRevisions(topics: Topic[], count: number = 5): Topic[] {
  return topics
    .filter((t) => t.status === "revised" || t.status === "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, count);
}

export function getTodayTasks(topics: Topic[]): Topic[] {
  const today = new Date().toISOString().split("T")[0];
  return topics.filter(
    (t) =>
      t.dueDate === today &&
      (t.status === "new" || t.status === "studying" || t.status === "revised")
  );
}

export function calculateMasteryScore(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const scoreMap = { high: 100, medium: 60, low: 30 };
  const total = sessions.reduce((acc, s) => acc + scoreMap[s.confidence], 0);
  return Math.round(total / sessions.length);
}

export function getProgressData(
  topics: Topic[],
  sessions: StudySession[]
): ProgressData {
  const totalTopics = topics.length;
  const completedTopics = topics.filter(
    (t) => t.status === "completed"
  ).length;
  const remainingTopics = totalTopics - completedTopics;
  const completionPercent = calculateCompletionPercent(topics);
  const studyStreak = calculateStudyStreak(sessions);
  const masteryScore = calculateMasteryScore(sessions);

  return {
    totalTopics,
    completedTopics,
    remainingTopics,
    completionPercent,
    studyStreak,
    masteryScore,
  };
}

export function getTotalStudyHours(sessions: StudySession[]): number {
  return sessions.reduce((acc, s) => acc + s.duration, 0) / 60;
}

export function getWeeklyStudyHours(sessions: StudySession[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recent = sessions.filter(
    (s) => new Date(s.date) >= weekAgo
  );
  return recent.reduce((acc, s) => acc + s.duration, 0) / 60;
}

