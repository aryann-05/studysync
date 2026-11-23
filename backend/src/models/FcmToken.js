import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const fcmTokenSchema = new mongoose.Schema(
  {
    token_id: {
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
    token: {
      type: String,
      required: true,
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

export const FcmToken = mongoose.models.FcmToken || mongoose.model("FcmToken", fcmTokenSchema, "fcm_tokens");
export default FcmToken;

