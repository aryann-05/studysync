import { v4 as uuidv4 } from "uuid";
import User from "../src/models/User.js";
import StudyPlan from "../src/models/StudyPlan.js";
import Topic from "../src/models/Topic.js";
import StudySession from "../src/models/StudySession.js";
import FcmToken from "../src/models/FcmToken.js";
import Quiz from "../src/models/Quiz.js";
import QuizAttempt from "../src/models/QuizAttempt.js";

/**
 * In-memory Mock Data Store for Mongoose Models
 */
export const tables = {
  users: [],
  studyPlans: [],
  topics: [],
  studySessions: [],
  fcmTokens: [],
  quizzes: [],
  quizAttempts: [],
};

export const resetMockDb = () => {
  tables.users = [];
  tables.studyPlans = [];
  tables.topics = [];
  tables.studySessions = [];
  tables.fcmTokens = [];
  tables.quizzes = [];
  tables.quizAttempts = [];
};

// Helper to create a Mongoose query chain (thenable)
const createQuery = (resultFn) => {
  const query = {
    _select: null,
    _sort: null,
    select(fields) {
      this._select = fields;
      return this;
    },
    sort(fields) {
      this._sort = fields;
      return this;
    },
    then(resolve, reject) {
      try {
        const res = resultFn(this._select, this._sort);
        resolve(res);
      } catch (err) {
        reject(err);
      }
    },
  };
  return query;
};

// Match MongoDB-style query object against an item
const matchFilter = (item, filter) => {
  if (!filter) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (val !== null && typeof val === "object" && !(val instanceof Date)) {
      // Comparison operators
      if (val.$gte !== undefined) {
        const itemDate = new Date(item[key]).getTime();
        const targetDate = new Date(val.$gte).getTime();
        if (itemDate < targetDate) return false;
      }
      if (val.$lte !== undefined) {
        const itemDate = new Date(item[key]).getTime();
        const targetDate = new Date(val.$lte).getTime();
        if (itemDate > targetDate) return false;
      }
      if (val.$lt !== undefined) {
        const itemDate = new Date(item[key]).getTime();
        const targetDate = new Date(val.$lt).getTime();
        if (itemDate >= targetDate) return false;
      }
      if (val.$gt !== undefined) {
        const itemDate = new Date(item[key]).getTime();
        const targetDate = new Date(val.$gt).getTime();
        if (itemDate <= targetDate) return false;
      }
    } else if (val instanceof Date) {
      const itemDateStr = new Date(item[key]).toISOString().split("T")[0];
      const targetDateStr = val.toISOString().split("T")[0];
      if (itemDateStr !== targetDateStr) return false;
    } else {
      if (typeof val === "string" && typeof item[key] === "string") {
        if (val.toLowerCase() !== item[key].toLowerCase()) return false;
      } else if (item[key] !== val) {
        return false;
      }
    }
  }
  return true;
};

export const setupMockMongoose = () => {
  // 1. User
  User.findOne = (filter) =>
    createQuery(() => {
      const found = tables.users.find((u) => matchFilter(u, filter));
      return found ? { ...found } : null;
    });

  User.create = async (data) => {
    const email = data.email.toLowerCase().trim();
    if (tables.users.some((u) => u.email.toLowerCase() === email)) {
      const err = new Error("An account with this email address already exists.");
      err.code = 11000;
      err.keyPattern = { email: 1 };
      throw err;
    }
    const record = {
      user_id: data.user_id || uuidv4(),
      email,
      password_hash: data.password_hash,
      full_name: data.full_name,
      daily_max_hours: data.daily_max_hours !== undefined ? data.daily_max_hours : 4.0,
      created_at: new Date(),
    };
    tables.users.push(record);
    return { ...record };
  };

  // 2. StudyPlan
  StudyPlan.create = async (data) => {
    const record = {
      plan_id: data.plan_id || uuidv4(),
      user_id: data.user_id,
      course_name: data.course_name,
      start_date: data.start_date,
      exam_date: data.exam_date,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date(),
    };
    tables.studyPlans.push(record);
    return { ...record };
  };

  StudyPlan.findOne = (filter) =>
    createQuery(() => {
      const found = tables.studyPlans.find((p) => matchFilter(p, filter));
      return found ? { ...found } : null;
    });

  StudyPlan.find = (filter) =>
    createQuery(() => {
      return tables.studyPlans.filter((p) => matchFilter(p, filter)).map((p) => ({ ...p }));
    });

  // 3. Topic
  Topic.create = async (data) => {
    const record = {
      topic_id: data.topic_id || uuidv4(),
      plan_id: data.plan_id,
      parent_topic_id: data.parent_topic_id || null,
      title: data.title,
      estimated_hours: data.estimated_hours !== undefined ? data.estimated_hours : 1.0,
      difficulty_weight: data.difficulty_weight !== undefined ? data.difficulty_weight : 1.0,
      ease_factor: data.ease_factor !== undefined ? data.ease_factor : 2.5,
      repetition_number: data.repetition_number !== undefined ? data.repetition_number : 0,
    };
    tables.topics.push(record);
    return { ...record };
  };

  Topic.findOne = (filter) =>
    createQuery(() => {
      const found = tables.topics.find((t) => matchFilter(t, filter));
      return found ? { ...found } : null;
    });

  Topic.find = (filter) =>
    createQuery(() => {
      return tables.topics.filter((t) => matchFilter(t, filter)).map((t) => ({ ...t }));
    });

  Topic.updateOne = async (filter, update) => {
    const topic = tables.topics.find((t) => matchFilter(t, filter));
    if (topic && update.$set) {
      Object.assign(topic, update.$set);
    }
    return { modifiedCount: topic ? 1 : 0 };
  };

  // 4. StudySession
  StudySession.create = async (data) => {
    const record = {
      session_id: data.session_id || uuidv4(),
      user_id: data.user_id,
      topic_id: data.topic_id,
      scheduled_date: data.scheduled_date instanceof Date ? data.scheduled_date : new Date(data.scheduled_date),
      duration_hours: data.duration_hours,
      session_type: data.session_type || "INITIAL",
      is_completed: data.is_completed !== undefined ? data.is_completed : false,
      confidence_score: data.confidence_score !== undefined ? data.confidence_score : null,
      completed_at: data.completed_at || null,
    };
    tables.studySessions.push(record);
    return { ...record };
  };

  StudySession.findOne = (filter) =>
    createQuery((select, sort) => {
      let matches = tables.studySessions.filter((s) => matchFilter(s, filter));
      if (sort?.completed_at === -1) {
        matches.sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
      }
      const match = matches[0];
      return match ? { ...match } : null;
    });

  StudySession.find = (filter) =>
    createQuery((select, sort) => {
      let results = tables.studySessions.filter((s) => matchFilter(s, filter));
      if (sort?.scheduled_date === 1) {
        results.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
      }
      return results.map((s) => ({ ...s }));
    });

  StudySession.updateOne = async (filter, update) => {
    const session = tables.studySessions.find((s) => matchFilter(s, filter));
    if (session && update.$set) {
      Object.assign(session, update.$set);
    }
    return { modifiedCount: session ? 1 : 0 };
  };

  // 5. FcmToken
  FcmToken.create = async (data) => {
    const record = {
      token_id: data.token_id || uuidv4(),
      user_id: data.user_id,
      token: data.token,
      created_at: new Date(),
    };
    tables.fcmTokens.push(record);
    return { ...record };
  };

  FcmToken.findOne = (filter) =>
    createQuery(() => {
      const found = tables.fcmTokens.find((t) => matchFilter(t, filter));
      return found ? { ...found } : null;
    });

  FcmToken.find = (filter) =>
    createQuery(() => {
      return tables.fcmTokens.filter((t) => matchFilter(t, filter)).map((t) => ({ ...t }));
    });

  // 6. Quiz
  Quiz.create = async (data) => {
    const record = {
      quiz_id: data.quiz_id || uuidv4(),
      plan_id: data.plan_id,
      user_id: data.user_id,
      module_name: data.module_name,
      quiz_number: data.quiz_number,
      title: data.title,
      description: data.description || "",
      scheduled_date: data.scheduled_date instanceof Date ? data.scheduled_date : new Date(data.scheduled_date),
      total_marks: data.total_marks || 5,
      questions: (data.questions || []).map((q) => ({
        question_id: q.question_id || uuidv4(),
        topic_id: q.topic_id || null,
        topic_title: q.topic_title,
        question_text: q.question_text,
        options: q.options || [],
        correct_index: q.correct_index,
        explanation: q.explanation || "",
        marks: q.marks || 1,
      })),
      created_at: new Date(),
    };
    tables.quizzes.push(record);
    return { ...record };
  };

  Quiz.findOne = (filter) =>
    createQuery(() => {
      const found = tables.quizzes.find((q) => matchFilter(q, filter));
      return found ? { ...found } : null;
    });

  Quiz.find = (filter) =>
    createQuery((select, sort) => {
      let results = tables.quizzes.filter((q) => matchFilter(q, filter));
      if (sort?.scheduled_date === 1) {
        results.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
      }
      return results.map((q) => ({ ...q }));
    });

  // 7. QuizAttempt
  QuizAttempt.create = async (data) => {
    const record = {
      attempt_id: data.attempt_id || uuidv4(),
      quiz_id: data.quiz_id,
      user_id: data.user_id,
      plan_id: data.plan_id,
      module_name: data.module_name || "",
      score: data.score,
      total_marks: data.total_marks,
      percentage: data.percentage,
      grade: data.grade,
      answers: data.answers || [],
      weak_topics: data.weak_topics || [],
      feedback: data.feedback || "",
      completed_at: new Date(),
    };
    tables.quizAttempts.push(record);
    return { ...record };
  };

  QuizAttempt.findOne = (filter) =>
    createQuery((select, sort) => {
      let matches = tables.quizAttempts.filter((a) => matchFilter(a, filter));
      if (sort?.completed_at === -1) {
        matches.sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
      }
      const match = matches[0];
      return match ? { ...match } : null;
    });

  QuizAttempt.find = (filter) =>
    createQuery((select, sort) => {
      let results = tables.quizAttempts.filter((a) => matchFilter(a, filter));
      if (sort?.completed_at === -1) {
        results.sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
      }
      return results.map((a) => ({ ...a }));
    });
};
