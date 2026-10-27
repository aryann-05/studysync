import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const uploadSchema = new mongoose.Schema(
  {
    upload_id: {
      type: String,
      default: () => `file_${uuidv4().replace(/-/g, "").slice(0, 12)}`,
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    original_name: {
      type: String,
      required: true,
      trim: true,
    },
    stored_name: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    document_type: {
      type: String,
      enum: ["pdf", "docx", "txt", "document"],
      default: "document",
    },
    extracted_topics_count: {
      type: Number,
      default: 0,
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

export const Upload = mongoose.models.Upload || mongoose.model("Upload", uploadSchema, "uploads");
export default Upload;

