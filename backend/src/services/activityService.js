import ActivityLog from "../models/ActivityLog.js";
import AuditLog from "../models/AuditLog.js";
import AdminNotification from "../models/AdminNotification.js";
import User from "../models/User.js";

/**
 * Log user learning & platform interaction event
 */
export const logActivity = async ({
  userId,
  userName = "",
  userEmail = "",
  activityType = "other",
  description = "",
  metadata = {},
  ipAddress = "127.0.0.1",
  userAgent = "",
}) => {
  if (!userId) return null;

  try {
    // If name or email not provided, look up user
    if ((!userName || !userEmail) && typeof User.findOne === "function") {
      const u = await User.findOne({ user_id: userId }).select("full_name email");
      if (u) {
        userName = userName || u.full_name;
        userEmail = userEmail || u.email;
      }
    }

    // Touch user's last_active_at
    if (typeof User.updateOne === "function") {
      await User.updateOne(
        { user_id: userId },
        { $set: { last_active_at: new Date() } }
      ).catch(() => {});
    }

    if (typeof ActivityLog.create === "function") {
      return await ActivityLog.create({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        activity_type: activityType,
        description,
        metadata,
        ip_address: ipAddress || "127.0.0.1",
        user_agent: userAgent || "",
        created_at: new Date(),
      });
    }
  } catch (err) {
    console.warn("⚠️ Failed to record user activity log:", err.message);
  }
  return null;
};

/**
 * Create Admin Notification alert
 */
export const createNotification = async ({
  type = "info",
  title,
  message,
  severity = "info",
  metadata = {},
}) => {
  try {
    if (typeof AdminNotification.create === "function") {
      return await AdminNotification.create({
        type,
        title,
        message,
        severity,
        metadata,
        is_read: false,
        created_at: new Date(),
      });
    }
  } catch (err) {
    console.warn("⚠️ Failed to record admin notification:", err.message);
  }
  return null;
};

/**
 * Log administrative audit record
 */
export const logAdminAudit = async ({
  adminUserId,
  adminName = "Administrator",
  adminEmail = "",
  action,
  targetResource,
  targetId = "",
  details = {},
  ipAddress = "127.0.0.1",
}) => {
  try {
    if ((!adminName || !adminEmail) && adminUserId && typeof User.findOne === "function") {
      const a = await User.findOne({ user_id: adminUserId }).select("full_name email");
      if (a) {
        adminName = a.full_name;
        adminEmail = a.email;
      }
    }

    if (typeof AuditLog.create === "function") {
      return await AuditLog.create({
        admin_user_id: adminUserId || "system",
        admin_name: adminName,
        admin_email: adminEmail,
        action,
        target_resource: targetResource,
        target_id: String(targetId || ""),
        details,
        ip_address: ipAddress || "127.0.0.1",
        created_at: new Date(),
      });
    }
  } catch (err) {
    console.warn("⚠️ Failed to record admin audit log:", err.message);
  }
  return null;
};

export default {
  logActivity,
  createNotification,
  logAdminAudit,
};

