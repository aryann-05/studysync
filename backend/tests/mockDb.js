import { v4 as uuidv4 } from "uuid";
import User from "../src/models/User.js";
import StudyPlan from "../src/models/StudyPlan.js";
import Topic from "../src/models/Topic.js";
import StudySession from "../src/models/StudySession.js";
import FcmToken from "../src/models/FcmToken.js";
import Quiz from "../src/models/Quiz.js";
import QuizAttempt from "../src/models/QuizAttempt.js";
import Upload from "../src/models/Upload.js";

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
  uploads: [],
};

export const resetMockDb = () => {
  tables.users = [];
  tables.studyPlans = [];
  tables.topics = [];
  tables.studySessions = [];
  tables.fcmTokens = [];
  tables.quizzes = [];
  tables.quizAttempts = [];
  tables.uploads = [];
};

// Helper to create a Mongoose query chain (thenable)
const createQuery = (resultFn) => {
  const query = {
    _select: null,
    _sort: null,
    _skip: 0,
    _limit: null,
    select(fields) {
      this._select = fields;
      return this;
    },
    sort(fields) {
      this._sort = fields;
      return this;
    },
    skip(n) {
      this._skip = n;
      return this;
    },
    limit(n) {
      this._limit = n;
      return this;
    },
    lean() {
      return this;
    },
    then(resolve, reject) {
      try {
        let res = resultFn(this._select, this._sort);
        if (Array.isArray(res)) {
          if (this._sort) {
            for (const [key, dir] of Object.entries(this._sort)) {
              res = [...res].sort((a, b) => {
                const aVal = a[key] instanceof Date ? a[key].getTime() : a[key];
                const bVal = b[key] instanceof Date ? b[key].getTime() : b[key];
                if (aVal < bVal) return dir === -1 ? 1 : -1;
                if (aVal > bVal) return dir === -1 ? -1 : 1;
                return 0;
              });
            }
          }
          if (this._skip) {
            res = res.slice(this._skip);
          }
          if (this._limit !== null && this._limit !== undefined) {
            res = res.slice(0, this._limit);
          }
        }
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
    if (key === "$or" && Array.isArray(val)) {
      const anyMatch = val.some((subFilter) => matchFilter(item, subFilter));
      if (!anyMatch) return false;
      continue;
    }

    if (val instanceof RegExp) {
      if (!val.test(String(item[key] || ""))) return false;
      continue;
    }

    if (val !== null && typeof val === "object" && !(val instanceof Date)) {
      if (val.$regex) {
        const flags = val.$options || "";
        const r = new RegExp(val.$regex, flags);
        if (!r.test(String(item[key] || ""))) return false;
        continue;
      }
      if (val.$ne !== undefined) {
        if (item[key] === val.$ne) return false;
        continue;
      }
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

  User.find = (filter) =>
    createQuery(() => {
      return tables.users.filter((u) => matchFilter(u, filter)).map((u) => ({ ...u }));
    });

  User.countDocuments = async (filter = {}) => {
    return tables.users.filter((u) => matchFilter(u, filter)).length;
  };

  User.updateOne = async (filter, update) => {
    const item = tables.users.find((u) => matchFilter(u, filter));
    if (item) {
      const setFields = update.$set || update;
      Object.assign(item, setFields);
    }
    return { acknowledged: true, modifiedCount: item ? 1 : 0 };
  };

  User.deleteOne = async (filter) => {
    const idx = tables.users.findIndex((u) => matchFilter(u, filter));
    if (idx !== -1) {
      tables.users.splice(idx, 1);
    }
    return { acknowledged: true, deletedCount: idx !== -1 ? 1 : 0 };
  };

  User.deleteMany = async (filter) => {
    const before = tables.users.length;
    tables.users = tables.users.filter((u) => !matchFilter(u, filter));
    return { acknowledged: true, deletedCount: before - tables.users.length };
  };

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
      role: data.role || "user",
      status: data.status || "active",
      account_type: data.account_type || "student",
      created_at: data.created_at || new Date(),
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

  StudyPlan.countDocuments = async (filter = {}) => {
    return tables.studyPlans.filter((p) => matchFilter(p, filter)).length;
  };

  StudyPlan.deleteMany = async (filter) => {
    const before = tables.studyPlans.length;
    tables.studyPlans = tables.studyPlans.filter((p) => !matchFilter(p, filter));
    return { deletedCount: before - tables.studyPlans.length };
  };

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

  QuizAttempt.countDocuments = async (filter = {}) => {
    return tables.quizAttempts.filter((a) => matchFilter(a, filter)).length;
  };

  QuizAttempt.deleteMany = async (filter) => {
    const before = tables.quizAttempts.length;
    tables.quizAttempts = tables.quizAttempts.filter((a) => !matchFilter(a, filter));
    return { deletedCount: before - tables.quizAttempts.length };
  };

  StudySession.countDocuments = async (filter = {}) => {
    return tables.studySessions.filter((s) => matchFilter(s, filter)).length;
  };

  StudySession.deleteMany = async (filter) => {
    const before = tables.studySessions.length;
    tables.studySessions = tables.studySessions.filter((s) => !matchFilter(s, filter));
    return { deletedCount: before - tables.studySessions.length };
  };

  FcmToken.deleteMany = async (filter) => {
    const before = tables.fcmTokens.length;
    tables.fcmTokens = tables.fcmTokens.filter((f) => !matchFilter(f, filter));
    return { deletedCount: before - tables.fcmTokens.length };
  };

  Upload.create = async (data) => {
    const record = {
      upload_id: data.upload_id || `file_${uuidv4().replace(/-/g, "").slice(0, 12)}`,
      user_id: data.user_id,
      original_name: data.original_name,
      stored_name: data.stored_name,
      file_path: data.file_path,
      mime_type: data.mime_type,
      size: data.size,
      document_type: data.document_type || "document",
      extracted_topics_count: data.extracted_topics_count || 0,
      created_at: data.created_at || new Date(),
    };
    tables.uploads.push(record);
    return { ...record };
  };

  Upload.find = (filter = {}) =>
    createQuery((select, sort) => {
      let results = tables.uploads.filter((u) => matchFilter(u, filter));
      if (sort?.created_at === -1) {
        results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      }
      return results.map((u) => ({ ...u }));
    });

  Upload.findOne = (filter = {}) =>
    createQuery((select, sort) => {
      const match = tables.uploads.find((u) => matchFilter(u, filter));
      return match ? { ...match } : null;
    });

  Upload.findOneAndDelete = async (filter = {}) => {
    const idx = tables.uploads.findIndex((u) => matchFilter(u, filter));
    if (idx !== -1) {
      const removed = tables.uploads.splice(idx, 1)[0];
      return { ...removed };
    }
    return null;
  };

  Upload.countDocuments = async (filter = {}) => {
    return tables.uploads.filter((u) => matchFilter(u, filter)).length;
  };
};
