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
        delete ret.password_hash;
        return ret;
      },
    },
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema, "users");
export default User;

