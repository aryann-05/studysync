import { User } from "../models/User.js";
import { StudySession } from "../models/StudySession.js";
import { Topic } from "../models/Topic.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { daysDifference, addDays, getTodayUTC, formatDateOnly } from "../utils/dateUtils.js";

/**
 * Fall-Behind / Reshuffle Engine (MongoDB):
 * Identifies overdue incomplete sessions, ranks them by academic urgency priority,
 * and redistributes them into future days without exceeding daily capacity limits.
 */
export const reshuffleOverdueSessions = async (userId) => {
  const today = getTodayUTC();
  const todayStr = formatDateOnly(today);

  // 1. Fetch user to obtain daily_max_hours
  const user = await User.findOne({ user_id: userId }).select("daily_max_hours");
  const dailyMaxHours = Number(user?.daily_max_hours) || 4.0;

  // 2. Query overdue incomplete sessions
  const overdueSessions = await StudySession.find({
    user_id: userId,
    is_completed: false,
    scheduled_date: {
      $lt: today,
    },
  });

  if (overdueSessions.length === 0) {
    return {
      sessions_reshuffled: 0,
      overload_warning: false,
    };
  }

  // 3. Compute priority for each overdue session
  const prioritized = [];

  for (const session of overdueSessions) {
    const sessionDateStr = formatDateOnly(session.scheduled_date);
    const daysOverdue = Math.max(1, daysDifference(sessionDateStr, todayStr));

    // Get associated topic and plan
    const topic = await Topic.findOne({ topic_id: session.topic_id });
    const plan = topic ? await StudyPlan.findOne({ plan_id: topic.plan_id }) : null;

    const examDate = plan?.exam_date || addDays(today, 30);
    const examDateStr = formatDateOnly(examDate);
    const daysRemainingUntilExam = Math.max(1, daysDifference(todayStr, examDateStr));

    // Last completed session confidence for this topic
    let lastConfidence = 3;
    const lastSession = await StudySession.findOne({
      user_id: userId,
      topic_id: session.topic_id,
      is_completed: true,
    }).sort({ completed_at: -1 });

    if (lastSession && lastSession.confidence_score) {
      lastConfidence = lastSession.confidence_score;
    }

    const priorityScore = (daysOverdue * 2.0 + (5 - lastConfidence)) / daysRemainingUntilExam;

    prioritized.push({
      session,
      priorityScore,
      examDate,
      duration: Number(session.duration_hours) || 1.0,
    });
  }

  // Sort descending: highest priority rescheduled first
  prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

  // 4. Map future days and calculate existing scheduled workload
  const futureSessions = await StudySession.find({
    user_id: userId,
    scheduled_date: {
      $gte: today,
    },
  }).select("session_id scheduled_date duration_hours");

  const dailyWorkload = {};
  for (const s of futureSessions) {
    const dStr = formatDateOnly(s.scheduled_date);
    dailyWorkload[dStr] = (dailyWorkload[dStr] || 0) + Number(s.duration_hours);
  }

  let reshuffledCount = 0;
  let overloadWarning = false;

  // 5. Redistribute each prioritized overdue session
  for (const item of prioritized) {
    const session = item.session;
    const duration = item.duration;
    const examDateStr = formatDateOnly(item.examDate);
    const maxDaysAhead = Math.min(180, Math.max(1, daysDifference(todayStr, examDateStr)));

    let slotFound = false;

    for (let dayOffset = 0; dayOffset < maxDaysAhead; dayOffset++) {
      const candidateDate = addDays(today, dayOffset);
      const candidateDateStr = formatDateOnly(candidateDate);

      const currentlyAllocated = dailyWorkload[candidateDateStr] || 0;
      const remainingCapacity = Math.round((dailyMaxHours - currentlyAllocated) * 10) / 10;

      if (remainingCapacity >= duration) {
        // Move session to this valid day
        await StudySession.updateOne(
          { session_id: session.session_id },
          { $set: { scheduled_date: candidateDate } }
        );

        dailyWorkload[candidateDateStr] = currentlyAllocated + duration;
        reshuffledCount += 1;
        slotFound = true;
        break;
      }
    }

    if (!slotFound) {
      overloadWarning = true;
    }
  }

  return {
    sessions_reshuffled: reshuffledCount,
    overload_warning: overloadWarning,
  };
};

export default {
  reshuffleOverdueSessions,
};
