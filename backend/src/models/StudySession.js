import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const studySessionSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    topic_id: {
      type: String,
      required: true,
      index: true,
    },
    scheduled_date: {
      type: Date,
      required: true,
      index: true,
    },
    duration_hours: {
      type: Number,
      required: true,
    },
    session_type: {
      type: String,
      enum: ["INITIAL", "REVIEW", "REMEDIAL"],
      default: "INITIAL",
    },
    is_completed: {
      type: Boolean,
      default: false,
    },
    confidence_score: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    completed_at: {
      type: Date,
      default: null,
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

// Compound index for user date queries
studySessionSchema.index({ user_id: 1, scheduled_date: 1 });

export const StudySession = mongoose.models.StudySession || mongoose.model("StudySession", studySessionSchema, "study_sessions");
export default StudySession;

