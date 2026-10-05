import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/database.js";
import config from "./config/env.js";

const PORT = config.port;

let server;

// Start Server and verify database connectivity
const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 StudySync Backend API is active`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📚 SRS Version: 1.0 Major Project Release`);
    console.log(`=========================================`);
  });
};

startServer();

// Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully terminating StudySync server...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectDB();
      console.log("Database connection terminated.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

export default server;