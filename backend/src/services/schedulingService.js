import { StudyPlan } from "../models/StudyPlan.js";
import { Topic } from "../models/Topic.js";
import { StudySession } from "../models/StudySession.js";
import { daysDifference, addDays, parseDateOnly } from "../utils/dateUtils.js";

/**
 * Calculate study effort and available capacity
 */
export const calculateCapacityAndEffort = (flattenedTopics, startDate, examDate, dailyMaxHours) => {
  const totalEffort = flattenedTopics.reduce((sum, topic) => {
    const hours = Number(topic.estimated_hours) || 1.0;
    const weight = Number(topic.difficulty_weight) || 1.0;
    return sum + hours * weight;
  }, 0);

  const availableDays = daysDifference(startDate, examDate);
  const totalCapacity = availableDays * dailyMaxHours;

  return {
    totalEffort: Math.round(totalEffort * 100) / 100,
    availableDays,
    totalCapacity: Math.round(totalCapacity * 100) / 100,
    isOverloaded: totalEffort > totalCapacity,
  };
};

/**
 * Generate initial study sessions using sequential topic allocation
 * strictly adhering to daily_max_hours limit.
 */
export const generateInitialSchedule = (userId, createdTopics, startDate, examDate, dailyMaxHours) => {
  const sessions = [];
  let currentDayOffset = 0;
  let currentDayHoursUsed = 0;
  const maxAvailableDays = daysDifference(startDate, examDate);

  for (const topic of createdTopics) {
    let remainingTopicHours = (Number(topic.estimated_hours) || 1.0) * (Number(topic.difficulty_weight) || 1.0);
    remainingTopicHours = Math.round(remainingTopicHours * 10) / 10;

    while (remainingTopicHours > 0.05) {
      if (currentDayOffset >= maxAvailableDays) {
        break;
      }

      const availableToday = Math.round((dailyMaxHours - currentDayHoursUsed) * 10) / 10;

      if (availableToday <= 0.4) {
        currentDayOffset += 1;
        currentDayHoursUsed = 0;
        continue;
      }

      const allocatedDuration = Math.min(remainingTopicHours, availableToday);
      const scheduledDate = addDays(startDate, currentDayOffset);

      sessions.push({
        user_id: userId,
        topic_id: topic.topic_id,
        scheduled_date: scheduledDate,
        duration_hours: Math.round(allocatedDuration * 10) / 10,
        session_type: "INITIAL",
        is_completed: false,
      });

      currentDayHoursUsed += allocatedDuration;
      remainingTopicHours = Math.round((remainingTopicHours - allocatedDuration) * 10) / 10;

      if (currentDayHoursUsed >= dailyMaxHours) {
        currentDayOffset += 1;
        currentDayHoursUsed = 0;
      }
    }
  }

  return sessions;
};

/**
 * Create complete study plan, modules, topics, and initial sessions in MongoDB
 */
export const createPlanWithHierarchy = async (userId, planData, nlpModules) => {
  const { course_name, start_date, exam_date, daily_max_hours } = planData;
  const startDateObj = parseDateOnly(start_date);
  const examDateObj = parseDateOnly(exam_date);

  // Flatten topics from NLP output
  const flatTopics = [];
  for (const mod of nlpModules) {
    for (const t of mod.topics) {
      flatTopics.push({
        moduleName: mod.module_name,
        title: t.title,
        estimated_hours: Number(t.estimated_hours) || 1.0,
        difficulty_weight: Number(t.difficulty_weight) || 1.0,
      });
    }
  }

  const { totalEffort, totalCapacity, isOverloaded, availableDays } = calculateCapacityAndEffort(
    flatTopics,
    start_date,
    exam_date,
    daily_max_hours
  );

  if (isOverloaded) {
    const error = new Error(
      `Schedule overload: Total required study effort (${totalEffort} hrs) exceeds available capacity (${totalCapacity} hrs across ${availableDays} days) before the exam date.`
    );
    error.statusCode = 400;
    error.code = "SCHEDULE_OVERLOAD";
    error.details = {
      required_hours: totalEffort,
      available_capacity: totalCapacity,
      deficit_hours: Math.round((totalEffort - totalCapacity) * 10) / 10,
      daily_max_hours,
      available_days: availableDays,
    };
    throw error;
  }

  // 1. Create study plan document
  const plan = await StudyPlan.create({
    user_id: userId,
    course_name,
    start_date: startDateObj,
    exam_date: examDateObj,
    is_active: true,
  });

  const leafTopics = [];

  // 2. Create hierarchical modules and child topics
  for (const mod of nlpModules) {
    const parentTopic = await Topic.create({
      plan_id: plan.plan_id,
      title: mod.module_name,
      estimated_hours: 0,
      difficulty_weight: 1.0,
      ease_factor: 2.5,
      repetition_number: 0,
    });

    for (const t of mod.topics) {
      const childTopic = await Topic.create({
        plan_id: plan.plan_id,
        parent_topic_id: parentTopic.topic_id,
        title: t.title,
        estimated_hours: Number(t.estimated_hours) || 1.0,
        difficulty_weight: Number(t.difficulty_weight) || 1.0,
        ease_factor: 2.5,
        repetition_number: 0,
      });
      leafTopics.push(childTopic);
    }
  }

  // 3. Generate initial sessions strictly obeying daily limits
  const sessionPayloads = generateInitialSchedule(
    userId,
    leafTopics,
    start_date,
    exam_date,
    daily_max_hours
  );

  const createdSessions = [];
  for (const payload of sessionPayloads) {
    const sess = await StudySession.create(payload);
    createdSessions.push(sess);
  }

  return {
    plan,
    totalTopics: leafTopics.length,
    totalEffort,
    sessions: createdSessions,
  };
};
