import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import errorHandler from "./middleware/errorMiddleware.js";
import { sendError } from "./utils/response.js";

// Import route modules
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Request Logging (skip during test execution to keep test output clean)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Request Body Parsing
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Cookie Parsing
app.use(cookieParser());

// Rate Limiting (disabled or relaxed in test mode)
if (process.env.NODE_ENV !== "test") {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "error",
      message: "Too many requests. Please try again later.",
      error: {
        code: "RATE_LIMIT_EXCEEDED",
      },
    },
  });

  app.use("/api", apiLimiter);
}

// Health Check / Root Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "StudySync Backend API is running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Primary API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/calendar", calendarRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/quizzes", quizRoutes);

// Catch-all route for undefined endpoints (404)
app.use((req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, "ROUTE_NOT_FOUND", 404);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;