import { Quiz } from "../models/Quiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { Topic } from "../models/Topic.js";
import { formatDateOnly } from "../utils/dateUtils.js";

/**
 * Helper to generate questions tailored to a specific topic
 */
const generateQuestionsForTopics = (moduleTopics, quizNumber, moduleName) => {
  const questions = [];
  const count = Math.min(5, Math.max(3, moduleTopics.length));

  for (let i = 0; i < count; i++) {
    const topic = moduleTopics[i % moduleTopics.length];
    const topicName = topic.title || "Core Principle";

    if (quizNumber === 1) {
      // Quiz 1: Conceptual Foundations & Definitions
      questions.push({
        topic_id: topic.topic_id || null,
        topic_title: topicName,
        question_text: `What is the primary fundamental objective or core principle behind "${topicName}"?`,
        options: [
          `To optimize computational efficiency and solve structural requirements associated with ${topicName}`,
          `To increase redundant overhead without altering practical outcomes`,
          `To bypass standard algorithmic steps and ignore edge cases`,
          `To convert asynchronous execution to single-threaded linear storage only`,
        ],
        correct_index: 0,
        explanation: `In standard curriculum analysis, "${topicName}" focuses on establishing optimal computational efficiency, correctness, and well-defined invariants.`,
        marks: 1,
      });
    } else if (quizNumber === 2) {
      // Quiz 2: Implementation, Complexity & Edge Cases
      questions.push({
        topic_id: topic.topic_id || null,
        topic_title: topicName,
        question_text: `When analyzing performance and constraints for "${topicName}", which factor is most critical?`,
        options: [
          `Allocating arbitrary memory buffers regardless of input scaling`,
          `Evaluating asymptotic time/space complexity and boundary conditions for ${topicName}`,
          `Assuming worst-case runtime never occurs in production`,
          `Relying on deprecated synchronous blocking calls for throughput`,
        ],
        correct_index: 1,
        explanation: `Rigorous analysis of "${topicName}" requires evaluating asymptotic upper and lower bounds (Big-O) alongside handling extreme boundary conditions.`,
        marks: 1,
      });
    } else {
      // Quiz 3: Pre-Exam Synthesis & Problem Solving
      questions.push({
        topic_id: topic.topic_id || null,
        topic_title: topicName,
        question_text: `In a real-world scenario requiring "${topicName}", which design decision demonstrates best practices?`,
        options: [
          `Hardcoding static lookup values to replace dynamic calculations`,
          `Ignoring potential failure modes and exception handling during execution`,
          `Applying proper algorithmic abstractions, defensive invariants, and modular decomposition`,
          `Skipping regression verification and test assertions entirely`,
        ],
        correct_index: 2,
        explanation: `Advanced synthesis of "${topicName}" demands disciplined modular decomposition, provable correctness, and proper defensive programming.`,
        marks: 1,
      });
    }
  }

  return questions;
};

/**
 * Generate 2 to 3 quizzes per module scheduled before the exam date
 */
export const ensureQuizzesForPlan = async (userId, planId) => {
  // Check if quizzes already exist for this plan
  const existingQuizzes = await Quiz.find({ plan_id: planId }).sort({ scheduled_date: 1 });
  if (existingQuizzes.length > 0) {
    return existingQuizzes;
  }

  const plan = await StudyPlan.findOne({ plan_id: planId });
  if (!plan) {
    throw new Error("Study plan not found");
  }

  const topics = await Topic.find({ plan_id: planId });
  if (!topics || topics.length === 0) {
    return [];
  }

  // Group topics into modules
  // Look for module indicators or partition into 3 modules
  const moduleMap = new Map();
  topics.forEach((t, idx) => {
    let modName = "Module 1: Foundations & Core Principles";
    const title = t.title.toLowerCase();
    if (title.includes("module") || title.includes("unit")) {
      modName = t.title;
    } else if (topics.length >= 6) {
      if (idx >= Math.floor((2 * topics.length) / 3)) {
        modName = "Module 3: System Design & Evaluation";
      } else if (idx >= Math.floor(topics.length / 3)) {
        modName = "Module 2: Advanced Topics & Algorithms";
      } else {
        modName = "Module 1: Foundations & Core Principles";
      }
    } else if (idx >= Math.floor(topics.length / 2)) {
      modName = "Module 2: Advanced Applications & Analysis";
    }
    if (!moduleMap.has(modName)) {
      moduleMap.set(modName, []);
    }
    moduleMap.get(modName).push(t);
  });

  const modules = Array.from(moduleMap.entries());
  const startDate = new Date(plan.start_date).getTime();
  const examDate = new Date(plan.exam_date).getTime();
  const totalDuration = Math.max(86400000, examDate - startDate);
  const oneDayMs = 24 * 60 * 60 * 1000;

  const createdQuizzes = [];

  for (let mIdx = 0; mIdx < modules.length; mIdx++) {
    const [modName, modTopics] = modules[mIdx];
    const moduleProgressStart = mIdx / modules.length;
    const moduleProgressEnd = (mIdx + 1) / modules.length;

    // We create 3 scheduled quizzes per module before the exam date:
    // Quiz 1: Checkpoint 1 (Foundation)
    // Quiz 2: Checkpoint 2 (Application)
    // Quiz 3: Pre-Exam Mastery Quiz (Review)
    const quizConfigs = [
      {
        quiz_number: 1,
        title: `${modName} – Foundation Checkpoint Quiz`,
        description: `Introductory milestone assessment testing fundamental concepts and core terminology for ${modName}.`,
        // Around 30% through this module's time frame
        offsetRatio: moduleProgressStart + (moduleProgressEnd - moduleProgressStart) * 0.35,
      },
      {
        quiz_number: 2,
        title: `${modName} – Applied Problem Solving Quiz`,
        description: `Mid-module evaluation assessing algorithm mechanics, edge cases, and practical analytical ability.`,
        // Around 75% through this module's time frame
        offsetRatio: moduleProgressStart + (moduleProgressEnd - moduleProgressStart) * 0.75,
      },
      {
        quiz_number: 3,
        title: `${modName} – Pre-Exam Mastery Sprint`,
        description: `High-impact comprehensive assessment held before your exam to solidify retention and identify weak spots.`,
        // Near end of syllabus before exam
        offsetRatio: Math.min(0.95, 0.85 + (mIdx / (modules.length * 10))),
      },
    ];

    for (const cfg of quizConfigs) {
      // Calculate scheduled date strictly BEFORE exam_date
      let targetTime = startDate + totalDuration * cfg.offsetRatio;
      if (targetTime >= examDate) {
        targetTime = examDate - (modules.length - mIdx) * oneDayMs;
      }
      // Ensure it is at least 1 day before exam date
      if (targetTime >= examDate) {
        targetTime = examDate - oneDayMs;
      }

      const questions = generateQuestionsForTopics(modTopics, cfg.quiz_number, modName);

      const quizDoc = await Quiz.create({
        plan_id: planId,
        user_id: userId,
        module_name: modName,
        quiz_number: cfg.quiz_number,
        title: cfg.title,
        description: cfg.description,
        scheduled_date: new Date(targetTime),
        total_marks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
        questions,
      });

      createdQuizzes.push(quizDoc);
    }
  }

  return createdQuizzes;
};

/**
 * Retrieve all quizzes for active plan with latest attempt and marks
 */
export const getQuizzesForUser = async (userId, planId) => {
  let quizzes = await Quiz.find({ user_id: userId, plan_id: planId }).sort({ scheduled_date: 1 });
  if (!quizzes || quizzes.length === 0) {
    quizzes = await ensureQuizzesForPlan(userId, planId);
  }

  // Fetch attempts by this user
  const attempts = await QuizAttempt.find({ user_id: userId, plan_id: planId }).sort({ completed_at: -1 });

  return quizzes.map((q) => {
    const latestAttempt = attempts.find((a) => a.quiz_id === q.quiz_id);
    return {
      quiz_id: q.quiz_id,
      plan_id: q.plan_id,
      module_name: q.module_name,
      quiz_number: q.quiz_number,
      title: q.title,
      description: q.description,
      scheduled_date: formatDateOnly(q.scheduled_date),
      total_marks: q.total_marks,
      question_count: q.questions.length,
      is_completed: Boolean(latestAttempt),
      latest_attempt: latestAttempt
        ? {
            attempt_id: latestAttempt.attempt_id,
            score: latestAttempt.score,
            total_marks: latestAttempt.total_marks,
            percentage: latestAttempt.percentage,
            grade: latestAttempt.grade,
            feedback: latestAttempt.feedback,
            weak_topics: latestAttempt.weak_topics,
            completed_at: latestAttempt.completed_at,
          }
        : null,
    };
  });
};

/**
 * Get quiz details with questions
 */
export const getQuizDetails = async (quizId, userId) => {
  const quiz = await Quiz.findOne({ quiz_id: quizId });
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const latestAttempt = await QuizAttempt.findOne({ quiz_id: quizId, user_id: userId }).sort({
    completed_at: -1,
  });

  return {
    quiz_id: quiz.quiz_id,
    plan_id: quiz.plan_id,
    module_name: quiz.module_name,
    quiz_number: quiz.quiz_number,
    title: quiz.title,
    description: quiz.description,
    scheduled_date: formatDateOnly(quiz.scheduled_date),
    total_marks: quiz.total_marks,
    questions: quiz.questions.map((q) => ({
      question_id: q.question_id,
      topic_id: q.topic_id,
      topic_title: q.topic_title,
      question_text: q.question_text,
      options: q.options,
      marks: q.marks,
      // Only reveal explanation & correct_index if already completed
      ...(latestAttempt
        ? {
            correct_index: q.correct_index,
            explanation: q.explanation,
          }
        : {}),
    })),
    latest_attempt: latestAttempt,
  };
};

/**
 * Grade quiz submission, calculate topic breakdown, and generate actionable feedback
 */
export const gradeAndSubmitQuiz = async (userId, quizId, userAnswers = []) => {
  const quiz = await Quiz.findOne({ quiz_id: quizId });
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  let totalScore = 0;
  const answerRecords = [];
  const topicStats = new Map();

  for (const q of quiz.questions) {
    const userAns = userAnswers.find((a) => a.question_id === q.question_id);
    const selectedIndex = userAns !== undefined ? userAns.selected_index : -1;
    const isCorrect = selectedIndex === q.correct_index;

    if (isCorrect) {
      totalScore += q.marks || 1;
    }

    answerRecords.push({
      question_id: q.question_id,
      selected_index: selectedIndex,
      is_correct: isCorrect,
      topic_title: q.topic_title,
    });

    // Track topic stats
    const curStat = topicStats.get(q.topic_title) || {
      topic_title: q.topic_title,
      topic_id: q.topic_id,
      total_questions: 0,
      correct_count: 0,
      mistakes: 0,
    };
    curStat.total_questions += 1;
    if (isCorrect) {
      curStat.correct_count += 1;
    } else {
      curStat.mistakes += 1;
    }
    topicStats.set(q.topic_title, curStat);
  }

  const totalMarks = quiz.total_marks || quiz.questions.length;
  const percentage = Math.round((totalScore / totalMarks) * 100);

  let grade = "Needs Revision";
  if (percentage >= 80) {
    grade = "Mastered";
  } else if (percentage < 50) {
    grade = "Critical Focus Required";
  }

  // Calculate weak topics that require more focus
  const weakTopics = [];
  topicStats.forEach((stat) => {
    const acc = Math.round((stat.correct_count / stat.total_questions) * 100);
    const priority = acc === 0 ? "HIGH" : acc < 70 ? "MEDIUM" : "LOW";

    let recommendation = "Maintain strong understanding with periodic spaced reviews.";
    if (priority === "HIGH") {
      recommendation = `High priority topic: Review definitions, core invariants, and practice standard exam problems for "${stat.topic_title}".`;
    } else if (priority === "MEDIUM") {
      recommendation = `Moderate priority topic: Revisit edge cases, time complexity analysis, and practice 2-3 sample questions.`;
    }

    if (acc < 100) {
      weakTopics.push({
        topic_title: stat.topic_title,
        topic_id: stat.topic_id,
        total_questions: stat.total_questions,
        correct_count: stat.correct_count,
        mistakes: stat.mistakes,
        accuracy_percent: acc,
        priority,
        recommendation,
      });
    }
  });

  // Sort weak topics with highest priority and mistakes first
  weakTopics.sort((a, b) => (a.priority === "HIGH" ? -1 : 1) || b.mistakes - a.mistakes);

  // Generate personalized feedback
  let feedback = "";
  if (percentage === 100) {
    feedback = `Exceptional performance! You scored a perfect ${totalScore}/${totalMarks} (100%) on ${quiz.title}. You have demonstrated comprehensive mastery over all topics in this module.`;
  } else if (weakTopics.length > 0) {
    const topWeakNames = weakTopics.map((w) => `"${w.topic_title}" (${w.accuracy_percent}%)`).join(", ");
    feedback = `You scored ${totalScore}/${totalMarks} (${percentage}%). Actionable Focus Feedback: Focus more on ${topWeakNames} prior to your final exam. We recommend scheduling an immediate review session to reinforce these concepts.`;
  } else {
    feedback = `Good progress! You scored ${totalScore}/${totalMarks} (${percentage}%). Continue your daily schedule to prepare for the upcoming exam.`;
  }

  // Save attempt
  const attempt = await QuizAttempt.create({
    quiz_id: quizId,
    user_id: userId,
    plan_id: quiz.plan_id,
    module_name: quiz.module_name,
    score: totalScore,
    total_marks: totalMarks,
    percentage,
    grade,
    answers: answerRecords,
    weak_topics: weakTopics,
    feedback,
  });

  return {
    attempt,
    quiz_title: quiz.title,
    score: totalScore,
    total_marks: totalMarks,
    percentage,
    grade,
    weak_topics: weakTopics,
    feedback,
    questions: quiz.questions.map((q) => {
      const ans = answerRecords.find((a) => a.question_id === q.question_id);
      return {
        question_id: q.question_id,
        topic_title: q.topic_title,
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
        selected_index: ans ? ans.selected_index : -1,
        is_correct: ans ? ans.is_correct : false,
      };
    }),
  };
};

/**
 * Get aggregated weak focus topics across all completed quizzes for a plan
 */
export const getAggregatedFocusTopics = async (userId, planId) => {
  const attempts = await QuizAttempt.find({ user_id: userId, plan_id: planId }).sort({ completed_at: -1 });

  const topicAggregate = new Map();
  for (const a of attempts) {
    for (const wt of a.weak_topics) {
      const existing = topicAggregate.get(wt.topic_title) || {
        topic_title: wt.topic_title,
        topic_id: wt.topic_id,
        total_mistakes: 0,
        attempts_count: 0,
        lowest_accuracy: 100,
        recommendation: wt.recommendation,
        priority: wt.priority,
      };
      existing.total_mistakes += wt.mistakes;
      existing.attempts_count += 1;
      existing.lowest_accuracy = Math.min(existing.lowest_accuracy, wt.accuracy_percent);
      if (wt.priority === "HIGH") existing.priority = "HIGH";
      topicAggregate.set(wt.topic_title, existing);
    }
  }

  return Array.from(topicAggregate.values()).sort(
    (a, b) => (a.priority === "HIGH" ? -1 : 1) || b.total_mistakes - a.total_mistakes
  );
};

export default {
  ensureQuizzesForPlan,
  getQuizzesForUser,
  getQuizDetails,
  gradeAndSubmitQuiz,
  getAggregatedFocusTopics,
};
