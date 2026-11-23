import mongoose from "mongoose";
import config from "./env.js";

/**
 * Connect to MongoDB database using Mongoose ODM
 */
export const connectDB = async () => {
  // In test environment, mocked driver or memory server handles testing
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn("⚠️ MongoDB connection warning:", error.message);
    console.warn("ℹ️ Ensure MongoDB is running or specify a valid MONGODB_URI in .env");
    return false;
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDB = async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error.message);
  }
};

export default mongoose;
