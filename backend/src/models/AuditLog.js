import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const auditLogSchema = new mongoose.Schema(
  {
    audit_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    admin_user_id: {
      type: String,
      required: true,
      index: true,
    },
    admin_name: {
      type: String,
      default: "System Admin",
    },
    admin_email: {
      type: String,
      default: "",
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    target_resource: {
      type: String,
      required: true,
      index: true,
    },
    target_id: {
      type: String,
      default: "",
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip_address: {
      type: String,
      default: "127.0.0.1",
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

auditLogSchema.index({ created_at: -1 });

export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema, "audit_logs");

export default AuditLog;

