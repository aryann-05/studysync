import express from "express";
import adminController from "../controllers/adminController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enforce valid JWT and strictly "admin" role across all administration endpoints
router.use(authenticate, requireAdmin);

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Get real platform statistics for Admin Dashboard
 * @access  Admin Only
 */
router.get("/dashboard/stats", adminController.getStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get paginated users list with search and filters
 * @access  Admin Only
 */
router.get("/users", adminController.getUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get specific user profile and activity stats
 * @access  Admin Only
 */
router.get("/users/:id", adminController.getUserById);

/**
 * @route   PATCH /api/v1/admin/users/:id
 * @desc    Update permitted user fields (name, email, hours, account_type)
 * @access  Admin Only
 */
router.patch("/users/:id", adminController.updateUser);

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @desc    Activate or deactivate a user account
 * @access  Admin Only
 */
router.patch("/users/:id/status", adminController.updateUserStatus);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user account and cascade associated data
 * @access  Admin Only
 */
router.delete("/users/:id", adminController.deleteUser);

/**
 * @route   GET /api/v1/admin/uploads
 * @desc    Get all student and user uploads with user details
 * @access  Admin Only
 */
router.get("/uploads", adminController.getUploads);

/**
 * @route   GET /api/v1/admin/uploads/:id
 * @desc    Get details for a specific upload with user info
 * @access  Admin Only
 */
router.get("/uploads/:id", adminController.getUploadById);

/**
 * @route   DELETE /api/v1/admin/uploads/:id
 * @desc    Delete an uploaded file
 * @access  Admin Only
 */
router.delete("/uploads/:id", adminController.deleteUpload);

export default router;

