import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const questionSchema = new mongoose.Schema(
  {
    question_id: {
      type: String,
      default: () => uuidv4(),
    },
    topic_id: {
      type: String,
      default: null,
    },
    topic_title: {
      type: String,
      required: true,
      trim: true,
    },
    question_text: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [(val) => val.length >= 2, "Must provide at least 2 options"],
    },
    correct_index: {
      type: Number,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
    marks: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    plan_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    module_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    quiz_number: {
      type: Number,
      required: true, // 1, 2, or 3
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    scheduled_date: {
      type: Date,
      required: true,
      index: true,
    },
    total_marks: {
      type: Number,
      default: 5,
    },
    questions: [questionSchema],
    created_at: {
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

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema, "quizzes");
export default Quiz;
