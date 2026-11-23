import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const studyPlanSchema = new mongoose.Schema(
  {
    plan_id: {
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
    course_name: {
      type: String,
      required: true,
      trim: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    exam_date: {
      type: Date,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
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

export const StudyPlan = mongoose.models.StudyPlan || mongoose.model("StudyPlan", studyPlanSchema, "study_plans");
export default StudyPlan;

