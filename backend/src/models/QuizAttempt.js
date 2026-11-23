import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const answerSchema = new mongoose.Schema(
  {
    question_id: { type: String, required: true },
    selected_index: { type: Number, required: true },
    is_correct: { type: Boolean, required: true },
    topic_title: { type: String, default: "" },
  },
  { _id: false }
);

const weakTopicSchema = new mongoose.Schema(
  {
    topic_title: { type: String, required: true },
    topic_id: { type: String, default: null },
    total_questions: { type: Number, default: 0 },
    correct_count: { type: Number, default: 0 },
    mistakes: { type: Number, default: 0 },
    accuracy_percent: { type: Number, default: 0 },
    priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "MEDIUM" },
    recommendation: { type: String, default: "" },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    attempt_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    quiz_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    plan_id: {
      type: String,
      required: true,
      index: true,
    },
    module_name: {
      type: String,
      default: "",
    },
    score: {
      type: Number,
      required: true,
    },
    total_marks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    grade: {
      type: String, // "Mastered", "Needs Revision", "Critical Focus Required"
      required: true,
    },
    answers: [answerSchema],
    weak_topics: [weakTopicSchema],
    feedback: {
      type: String,
      required: true,
    },
    completed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema, "quiz_attempts");
export default QuizAttempt;
