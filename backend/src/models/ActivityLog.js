import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const activityLogSchema = new mongoose.Schema(
  {
    activity_id: {
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
    user_name: {
      type: String,
      default: "",
    },
    user_email: {
      type: String,
      default: "",
    },
    activity_type: {
      type: String,
      required: true,
      index: true,
      enum: [
        "registration",
        "login",
        "logout",
        "profile_update",
        "category_selection",
        "subject_selection",
        "syllabus_upload",
        "notes_upload",
        "pdf_upload",
        "study_material_view",
        "topic_exploration",
        "ai_feature_usage",
        "study_plan_creation",
        "test_generation",
        "test_attempt",
        "test_completion",
        "test_result",
        "study_session_start",
        "study_session_complete",
        "study_session_pause",
        "other",
      ],
      default: "other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip_address: {
      type: String,
      default: "127.0.0.1",
    },
    user_agent: {
      type: String,
      default: "",
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
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

activityLogSchema.index({ user_id: 1, created_at: -1 });

export const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", activityLogSchema, "activity_logs");

export default ActivityLog;

