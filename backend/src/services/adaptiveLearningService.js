import { StudySession } from "../models/StudySession.js";
import { Topic } from "../models/Topic.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { addDays } from "../utils/dateUtils.js";
import { calculateEaseFactor, calculateNextReviewInterval } from "./spacedRepetitionService.js";

/**
 * Adaptive Learning Engine:
 * Processes a completed study session with user confidence feedback,
 * adjusts difficulty weight, recalculates SM-2 ease factor & interval,
 * and schedules remedial or review sessions in MongoDB.
 */
export const processSessionConfidence = async (userId, sessionId, confidenceScore) => {
  // 1. Verify session exists and belongs to the authenticated user
  const session = await StudySession.findOne({
    session_id: sessionId,
    user_id: userId,
  });

  if (!session) {
    const error = new Error("Study session not found or does not belong to you.");
    error.statusCode = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  // Retrieve topic and plan
  const topic = await Topic.findOne({ topic_id: session.topic_id });
  if (!topic) {
    const error = new Error("Topic associated with session was not found.");
    error.statusCode = 404;
    error.code = "TOPIC_NOT_FOUND";
    throw error;
  }

  const plan = await StudyPlan.findOne({ plan_id: topic.plan_id });

  const currentEF = Number(topic.ease_factor) || 2.5;
  const currentRep = topic.repetition_number || 0;
  let currentDifficulty = Number(topic.difficulty_weight) || 1.0;

  // 2. Calculate updated Ease Factor and Interval using SM-2
  const updatedEF = calculateEaseFactor(currentEF, confidenceScore);
  const { newRepetitionNumber, nextIntervalDays } = calculateNextReviewInterval(
    currentRep,
    updatedEF,
    confidenceScore
  );

  let remedialSessionCreated = false;
  let nextSessionDate = null;
  const sessionScheduledDate = session.scheduled_date;

  // 3. Adaptive engine branching based on confidence rating
  if (confidenceScore <= 2) {
    // Weak topic: increase difficulty weight by 0.2
    currentDifficulty = Math.round((currentDifficulty + 0.2) * 100) / 100;

    // Check if an incomplete remedial session already exists within 48 hours to avoid duplicates
    const next48Hours = addDays(sessionScheduledDate, 2);
    const existingRemedial = await StudySession.findOne({
      user_id: userId,
      topic_id: topic.topic_id,
      session_type: "REMEDIAL",
      is_completed: false,
      scheduled_date: {
        $lte: next48Hours,
      },
    });

    if (!existingRemedial) {
      nextSessionDate = addDays(sessionScheduledDate, 1);

      await StudySession.create({
        user_id: userId,
        topic_id: topic.topic_id,
        scheduled_date: nextSessionDate,
        duration_hours: 0.75, // 45 minutes
        session_type: "REMEDIAL",
        is_completed: false,
      });

      remedialSessionCreated = true;
    }
  } else {
    // Normal review session (q >= 3)
    nextSessionDate = addDays(sessionScheduledDate, nextIntervalDays);

    if (!plan || !plan.exam_date || nextSessionDate <= plan.exam_date) {
      await StudySession.create({
        user_id: userId,
        topic_id: topic.topic_id,
        scheduled_date: nextSessionDate,
        duration_hours: Math.min(1.0, Number(topic.estimated_hours) || 1.0),
        session_type: "REVIEW",
        is_completed: false,
      });
    }
  }

  // 4. Update session completion status and topic SM-2 parameters in database
  await StudySession.updateOne(
    { session_id: sessionId },
    {
      $set: {
        is_completed: true,
        confidence_score: confidenceScore,
        completed_at: new Date(),
      },
    }
  );

  await Topic.updateOne(
    { topic_id: topic.topic_id },
    {
      $set: {
        ease_factor: updatedEF,
        repetition_number: newRepetitionNumber,
        difficulty_weight: currentDifficulty,
      },
    }
  );

  return {
    session_id: sessionId,
    is_completed: true,
    updated_ease_factor: updatedEF,
    remedial_session_created: remedialSessionCreated,
    next_review_date: nextSessionDate ? nextSessionDate.toISOString().split("T")[0] : null,
  };
};

export default {
  processSessionConfidence,
};
