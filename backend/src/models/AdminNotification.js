import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const adminNotificationSchema = new mongoose.Schema(
  {
    notification_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
      enum: [
        "new_user",
        "unusual_login",
        "upload_failure",
        "suspicious_test",
        "storage_warning",
        "user_inactivity",
        "system_error",
        "processing_failure",
        "info",
      ],
      default: "info",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
      index: true,
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

adminNotificationSchema.index({ created_at: -1 });

export const AdminNotification =
  mongoose.models.AdminNotification ||
  mongoose.model("AdminNotification", adminNotificationSchema, "admin_notifications");

export default AdminNotification;

