import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    daily_max_hours: {
      type: Number,
      default: 4.0,
      min: 0.5,
      max: 24.0,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator", "user"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    account_type: {
      type: String,
      enum: ["student", "regular"],
      default: "student",
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    last_login_at: {
      type: Date,
      default: null,
      index: true,
    },
    last_active_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    academic_qualification: {
      type: String,
      default: "Undergraduate",
      trim: true,
    },
    university_college: {
      type: String,
      default: "",
      trim: true,
    },
    course_name: {
      type: String,
      default: "Computer Science",
      trim: true,
      index: true,
    },
    specialization: {
      type: String,
      default: "Computer Science & Engineering",
      trim: true,
      index: true,
    },
    current_semester_year: {
      type: String,
      default: "Semester 4",
      trim: true,
    },
    academic_interests: {
      type: [String],
      default: [],
    },
    study_categories: {
      type: [String],
      default: [],
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
        delete ret.password_hash;
        return ret;
      },
    },
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema, "users");
export default User;

