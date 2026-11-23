import express from "express";
import adminController from "../controllers/adminController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enforce valid JWT and admin-tier privileges across all administration endpoints
router.use(authenticate, requireAdmin);

/**
 * Overview & High-Level Statistics
 */
router.get("/dashboard/stats", adminController.getStats);

/**
 * Complete User Management
 */
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id", adminController.updateUser);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

/**
 * Category-Wise User Analytics
 */
router.get("/categories", adminController.getCategories);
router.get("/categories/:categoryName/users", adminController.getCategoryUsers);

/**
 * User Activity Tracking & Monitoring
 */
router.get("/activity", adminController.getActivity);

/**
 * User Upload Management
 */
router.get("/uploads", adminController.getUploads);
router.get("/uploads/:id", adminController.getUploadById);
router.patch("/uploads/:id/moderate", adminController.moderateUpload);
router.delete("/uploads/:id", adminController.deleteUpload);

/**
 * Test & Examination Analytics
 */
router.get("/tests", adminController.getTestAnalytics);

/**
 * Learning Insights Analytics
 */
router.get("/learning", adminController.getLearningAnalytics);

/**
 * User Engagement & Retention Analytics
 */
router.get("/engagement", adminController.getEngagementAnalytics);

/**
 * Admin Notification Center
 */
router.get("/notifications", adminController.getNotifications);
router.patch("/notifications/:id/read", adminController.markNotificationRead);
router.post("/notifications/mark-all-read", adminController.markAllNotificationsRead);

/**
 * Reports & Data Export (CSV / JSON)
 */
router.get("/reports/export", adminController.exportReport);

/**
 * Security & Audit Logs
 */
router.get("/security/audit-logs", adminController.getAuditLogs);

export default router;
