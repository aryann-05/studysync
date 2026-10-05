import { StudySession } from "../models/StudySession.js";
import { Topic } from "../models/Topic.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { getTodayUTC, calculateStreak } from "../utils/dateUtils.js";

/**
 * Calculate topic and overall mastery using the SRS formula:
 * Mastery = (0.4 * (CompletedSessions / TotalScheduledSessions) + 0.6 * ((EaseFactor - 1.3) / (2.5 - 1.3))) * 100
 * Clamped strictly between 0 and 100.
 */
export const calculateMasteryScore = (completedSessions, totalScheduledSessions, easeFactor) => {
  const completionRatio = totalScheduledSessions > 0 ? completedSessions / totalScheduledSessions : 0;
  const ef = Number(easeFactor) || 2.5;

  const efComponent = Math.max(0, Math.min(1, (ef - 1.3) / 1.2));

  const score = (0.4 * completionRatio + 0.6 * efComponent) * 100;
  return Math.round(Math.max(0, Math.min(100, score)) * 10) / 10;
};

/**
 * Compile full analytics dashboard payload for the authenticated user (MongoDB)
 */
export const getUserAnalytics = async (userId) => {
  const today = getTodayUTC();

  // 1. Fetch all user sessions
  const sessions = await StudySession.find({ user_id: userId }).sort({ scheduled_date: 1 });

  const totalSessions = sessions.length;
  const completedSessionsList = sessions.filter((s) => s.is_completed);
  const completedSessions = completedSessionsList.length;

  const pendingSessions = sessions.filter(
    (s) => !s.is_completed && new Date(s.scheduled_date) >= today
  ).length;

  const overdueSessions = sessions.filter(
    (s) => !s.is_completed && new Date(s.scheduled_date) < today
  ).length;

  const overallCompletion = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // 2. Study Streak Calculation
  const currentStreak = calculateStreak(completedSessionsList);

  // 3. Topic-level groupings & mastery calculation
  const topicStatsMap = new Map();

  for (const s of sessions) {
    const topicId = s.topic_id;
    if (!topicStatsMap.has(topicId)) {
      const topicDoc = await Topic.findOne({ topic_id: topicId });
      const planDoc = topicDoc ? await StudyPlan.findOne({ plan_id: topicDoc.plan_id }) : null;

      topicStatsMap.set(topicId, {
        topic_id: topicId,
        title: topicDoc?.title || "Untitled Topic",
        course_name: planDoc?.course_name || "General",
        ease_factor: Number(topicDoc?.ease_factor) || 2.5,
        difficulty_weight: Number(topicDoc?.difficulty_weight) || 1.0,
        total_sessions: 0,
        completed_sessions: 0,
        last_confidence: null,
      });
    }

    const stat = topicStatsMap.get(topicId);
    stat.total_sessions += 1;
    if (s.is_completed) {
      stat.completed_sessions += 1;
      if (s.confidence_score !== null && s.confidence_score !== undefined) {
        stat.last_confidence = s.confidence_score;
      }
    }
  }

  const courseMasteryMap = {};
  const weakTopics = [];
  const masteredTopics = [];

  let totalMasterySum = 0;
  let topicCount = 0;

  for (const stat of topicStatsMap.values()) {
    const topicMastery = calculateMasteryScore(
      stat.completed_sessions,
      stat.total_sessions,
      stat.ease_factor
    );

    totalMasterySum += topicMastery;
    topicCount += 1;

    // Course aggregation
    if (!courseMasteryMap[stat.course_name]) {
      courseMasteryMap[stat.course_name] = { sum: 0, count: 0 };
    }
    courseMasteryMap[stat.course_name].sum += topicMastery;
    courseMasteryMap[stat.course_name].count += 1;

    // Categorization
    if (stat.last_confidence !== null && stat.last_confidence <= 2) {
      weakTopics.push({
        topic_id: stat.topic_id,
        title: stat.title,
        confidence: stat.last_confidence,
        ease_factor: stat.ease_factor,
        mastery: topicMastery,
      });
    } else if (stat.last_confidence !== null && stat.last_confidence >= 4) {
      masteredTopics.push({
        topic_id: stat.topic_id,
        title: stat.title,
        confidence: stat.last_confidence,
        ease_factor: stat.ease_factor,
        mastery: topicMastery,
      });
    }
  }

  const courseMastery = {};
  for (const [cName, cData] of Object.entries(courseMasteryMap)) {
    courseMastery[cName] = Math.round((cData.sum / cData.count) * 10) / 10;
  }

  const completedTopicsCount = Array.from(topicStatsMap.values()).filter(
    (t) => t.completed_sessions > 0
  ).length;

  const predictedCoverage = topicCount > 0 ? Math.round((completedTopicsCount / topicCount) * 100) : 0;

  return {
    overall_completion: overallCompletion,
    current_streak: currentStreak,
    total_sessions: totalSessions,
    completed_sessions: completedSessions,
    pending_sessions: pendingSessions,
    overdue_sessions: overdueSessions,
    mastery: Object.keys(courseMastery).length > 0 ? courseMastery : { "Study Plan": 0 },
    predicted_syllabus_coverage: predictedCoverage,
    weak_topics: weakTopics,
    mastered_topics: masteredTopics,
  };
};

export default {
  calculateMasteryScore,
  getUserAnalytics,
};
