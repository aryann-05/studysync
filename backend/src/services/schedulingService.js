import { StudyPlan } from "../models/StudyPlan.js";
import { Topic } from "../models/Topic.js";
import { StudySession } from "../models/StudySession.js";
import { daysDifference, addDays, parseDateOnly, formatDateOnly } from "../utils/dateUtils.js";

/**
 * Calculate study effort and available capacity
 */
export const calculateCapacityAndEffort = (flattenedTopics, startDate, examDate, dailyMaxHours, durationDays) => {
  const totalEffort = flattenedTopics.reduce((sum, topic) => {
    const hours = Number(topic.estimated_hours) || 2.0;
    const weight = Number(topic.difficulty_weight) || 1.1;
    return sum + hours * weight;
  }, 0);

  const availableDays = durationDays ? Number(durationDays) : Math.max(1, daysDifference(startDate, examDate));
  const totalCapacity = availableDays * dailyMaxHours;

  // Overloaded if the study window is impossibly restricted (e.g., 1 day with 0.5 hours daily max: total capacity = 0.5 hrs for 10+ hrs workload)
  const isOverloaded = availableDays <= 1 && totalEffort > totalCapacity * 2.5;

  return {
    totalEffort: Math.round(totalEffort * 100) / 100,
    availableDays,
    totalCapacity: Math.round(totalCapacity * 100) / 100,
    isOverloaded,
  };
};

/**
 * Dynamic Study Plan Scheduling Algorithm
 * Distributes all syllabus topics across the exact N days requested (7, 15, 30 days, etc.)
 * Ensures:
 * 1. 100% topic coverage (every topic is scheduled)
 * 2. Zero empty days (every day from 1 to N has planned sessions)
 * 3. Balanced cognitive load (difficulty balancing across days)
 * 4. Milestone spaced revisions (reinforcing earlier modules)
 * 5. Pre-exam comprehensive revision and final mock assessment
 */
export const generateInitialSchedule = (userId, createdTopics, startDate, examDate, dailyMaxHours = 4.0, durationDays) => {
  const totalDays = durationDays ? Number(durationDays) : Math.max(1, daysDifference(startDate, examDate));
  const dates = [];
  for (let i = 0; i < totalDays; i++) {
    dates.push(addDays(startDate, i));
  }

  const T = createdTopics.length;
  if (T === 0) return [];

  const sessions = [];

  // Determine special milestone days
  // 1. Final Mock Assessment Day (Day N-1 when N >= 3)
  const finalExamDayIndex = totalDays >= 3 ? totalDays - 1 : -1;

  // 2. Comprehensive Pre-Exam Revision Day (Day N-2 when N >= 4)
  const finalRevisionDayIndex = totalDays >= 4 ? totalDays - 2 : -1;

  // 3. Periodic Milestone Spaced Revisions
  const milestoneRevisionIndices = new Set();
  if (totalDays >= 20) {
    // 30-day plan: Day 7, Day 15, Day 22
    milestoneRevisionIndices.add(Math.floor(totalDays * 0.25));
    milestoneRevisionIndices.add(Math.floor(totalDays * 0.5));
    milestoneRevisionIndices.add(Math.floor(totalDays * 0.75));
  } else if (totalDays >= 11) {
    // 15-day plan: Day 4, Day 9
    milestoneRevisionIndices.add(Math.floor(totalDays * 0.33));
    milestoneRevisionIndices.add(Math.floor(totalDays * 0.66));
  } else if (totalDays >= 8) {
    // 10-day plan: Day 4
    milestoneRevisionIndices.add(Math.floor(totalDays * 0.4));
  } else if (totalDays >= 6) {
    // 7-day plan: Day 3
    milestoneRevisionIndices.add(Math.floor(totalDays * 0.5));
  }

  // 4. Learning Days for new topics
  const learningDateIndices = [];
  for (let i = 0; i < totalDays; i++) {
    if (i !== finalExamDayIndex && i !== finalRevisionDayIndex && !milestoneRevisionIndices.has(i)) {
      learningDateIndices.push(i);
    }
  }

  if (learningDateIndices.length === 0) {
    for (let i = 0; i < totalDays; i++) learningDateIndices.push(i);
  }

  // Balance topics: Sort to group conceptually while balancing difficulty
  const sortedTopics = [...createdTopics].sort((a, b) => {
    return (Number(a.difficulty_weight) || 1.0) - (Number(b.difficulty_weight) || 1.0);
  });

  // Distribute topics into learning days
  const dayTopicMap = {};
  learningDateIndices.forEach((idx) => {
    dayTopicMap[idx] = [];
  });

  let lIdx = 0;
  for (let i = 0; i < sortedTopics.length; i++) {
    const dayIdx = learningDateIndices[lIdx % learningDateIndices.length];
    dayTopicMap[dayIdx].push(sortedTopics[i]);
    lIdx++;
  }

  // Generate sessions for learning days
  for (const dayIdx of learningDateIndices) {
    const assigned = dayTopicMap[dayIdx];
    const date = dates[dayIdx];

    if (assigned.length === 0) {
      // Focused practice & problem solving on key complex topic
      const practiceTopic = sortedTopics[dayIdx % sortedTopics.length];
      sessions.push({
        user_id: userId,
        topic_id: practiceTopic.topic_id,
        scheduled_date: date,
        duration_hours: Math.min(2.0, dailyMaxHours),
        session_type: "PRACTICE",
        is_completed: false,
      });
    } else {
      const perTopicHours =
        Math.round(
          Math.min(
            dailyMaxHours / assigned.length,
            Math.max(1.0, (dailyMaxHours * 0.75) / assigned.length)
          ) * 10
        ) / 10;

      for (const t of assigned) {
        sessions.push({
          user_id: userId,
          topic_id: t.topic_id,
          scheduled_date: date,
          duration_hours: perTopicHours,
          session_type: "INITIAL",
          is_completed: false,
        });
      }
    }
  }

  // Generate milestone revision sessions
  for (const dayIdx of milestoneRevisionIndices) {
    const date = dates[dayIdx];
    const pastTopics = sortedTopics.slice(
      0,
      Math.max(1, Math.floor(sortedTopics.length * (dayIdx / totalDays)))
    );
    const revTopic = pastTopics[dayIdx % pastTopics.length] || sortedTopics[0];
    sessions.push({
      user_id: userId,
      topic_id: revTopic.topic_id,
      scheduled_date: date,
      duration_hours: Math.round(Math.min(2.5, dailyMaxHours) * 10) / 10,
      session_type: "REVIEW",
      is_completed: false,
    });
  }

  // Generate comprehensive pre-exam revision session
  if (finalRevisionDayIndex >= 0) {
    const date = dates[finalRevisionDayIndex];
    const hardTopic =
      sortedTopics.find((t) => (Number(t.difficulty_weight) || 1.0) >= 1.25) ||
      sortedTopics[0];
    sessions.push({
      user_id: userId,
      topic_id: hardTopic.topic_id,
      scheduled_date: date,
      duration_hours: Math.round(Math.min(3.0, dailyMaxHours) * 10) / 10,
      session_type: "REVIEW",
      is_completed: false,
    });
  }

  // Generate Final Assessment / Mock Exam session
  if (finalExamDayIndex >= 0 && finalExamDayIndex !== finalRevisionDayIndex) {
    const date = dates[finalExamDayIndex];
    const capstoneTopic = sortedTopics[sortedTopics.length - 1] || sortedTopics[0];
    sessions.push({
      user_id: userId,
      topic_id: capstoneTopic.topic_id,
      scheduled_date: date,
      duration_hours: Math.round(Math.min(2.5, dailyMaxHours) * 10) / 10,
      session_type: "ASSESSMENT",
      is_completed: false,
    });
  }

  // 100% COVERAGE VALIDATION: Ensure every single topic has at least one INITIAL session
  const scheduledInitialTopicIds = new Set(
    sessions.filter((s) => s.session_type === "INITIAL").map((s) => s.topic_id)
  );
  for (const t of createdTopics) {
    if (!scheduledInitialTopicIds.has(t.topic_id)) {
      const targetDayIdx = learningDateIndices[0];
      sessions.push({
        user_id: userId,
        topic_id: t.topic_id,
        scheduled_date: dates[targetDayIdx],
        duration_hours: 1.5,
        session_type: "INITIAL",
        is_completed: false,
      });
      scheduledInitialTopicIds.add(t.topic_id);
    }
  }

  // ZERO EMPTY DAYS VALIDATION: Ensure every day from 0 to N-1 has a session
  const scheduledDateSet = new Set(
    sessions.map((s) =>
      s.scheduled_date instanceof Date
        ? s.scheduled_date.toISOString().split("T")[0]
        : String(s.scheduled_date).split("T")[0]
    )
  );

  for (let i = 0; i < totalDays; i++) {
    const dateStr = dates[i];
    if (!scheduledDateSet.has(dateStr)) {
      const topicForDay = sortedTopics[i % sortedTopics.length];
      sessions.push({
        user_id: userId,
        topic_id: topicForDay.topic_id,
        scheduled_date: dateStr,
        duration_hours: Math.min(2.0, dailyMaxHours),
        session_type: i >= totalDays - 2 ? "REVIEW" : "PRACTICE",
        is_completed: false,
      });
      scheduledDateSet.add(dateStr);
    }
  }

  // Chronological sort
  sessions.sort((a, b) => {
    const dateA =
      a.scheduled_date instanceof Date
        ? a.scheduled_date.toISOString()
        : String(a.scheduled_date);
    const dateB =
      b.scheduled_date instanceof Date
        ? b.scheduled_date.toISOString()
        : String(b.scheduled_date);
    return dateA.localeCompare(dateB);
  });

  return sessions;
};

/**
 * Create complete study plan, modules, topics, and dynamic sessions in MongoDB
 */
export const createPlanWithHierarchy = async (userId, planData, nlpModules) => {
  const { course_name, start_date, exam_date, daily_max_hours, duration_days } = planData;
  const totalDays = duration_days ? Number(duration_days) : Math.max(1, daysDifference(start_date, exam_date));
  const effectiveExamDate = exam_date || addDays(start_date, totalDays);

  const startDateObj = parseDateOnly(start_date);
  const examDateObj = parseDateOnly(effectiveExamDate);

  // Flatten topics from NLP output
  const flatTopics = [];
  for (const mod of nlpModules) {
    for (const t of mod.topics) {
      flatTopics.push({
        moduleName: mod.module_name,
        title: t.title,
        estimated_hours: Number(t.estimated_hours) || 2.0,
        difficulty_weight: Number(t.difficulty_weight) || 1.15,
      });
    }
  }

  const { totalEffort, totalCapacity, isOverloaded, availableDays } = calculateCapacityAndEffort(
    flatTopics,
    start_date,
    effectiveExamDate,
    daily_max_hours,
    totalDays
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
        description: t.description || "",
        content_covered: Array.isArray(t.content_covered) ? t.content_covered : [],
        original_topics: Array.isArray(t.original_topics) ? t.original_topics : [],
        estimated_hours: Number(t.estimated_hours) || 1.5,
        difficulty_weight: Number(t.difficulty_weight) || 1.15,
        ease_factor: 2.5,
        repetition_number: 0,
      });
      leafTopics.push(childTopic);
    }
  }

  // 3. Generate dynamic schedule covering exact totalDays with zero empty days
  const sessionPayloads = generateInitialSchedule(
    userId,
    leafTopics,
    start_date,
    effectiveExamDate,
    daily_max_hours,
    totalDays
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
    totalDays,
    sessions: createdSessions,
  };
};

export default {
  calculateCapacityAndEffort,
  generateInitialSchedule,
  createPlanWithHierarchy,
};
