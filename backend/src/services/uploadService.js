import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { UPLOAD_DIR } from "../middleware/uploadMiddleware.js";

const METADATA_FILE = path.join(UPLOAD_DIR, "uploads_registry.json");

// In-memory cache synced with metadata file
let metadataStore = {};

const loadRegistry = () => {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, "utf-8");
      metadataStore = JSON.parse(data);
    }
  } catch (err) {
    metadataStore = {};
  }
};

const saveRegistry = () => {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadataStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist file upload metadata registry:", err.message);
  }
};

// Initial load
loadRegistry();

/**
 * Register an uploaded file and generate a unique file_id
 */
export const registerUploadedFile = async (file, userId) => {
  const file_id = `file_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

  const record = {
    file_id,
    user_id: userId,
    original_name: file.originalname,
    stored_name: file.filename,
    file_path: file.path,
    mime_type: file.mimetype,
    size: file.size,
    uploaded_at: new Date().toISOString(),
  };

  metadataStore[file_id] = record;
  saveRegistry();

  return {
    file_id: record.file_id,
    original_name: record.original_name,
    size: record.size,
  };
};

/**
 * Retrieve metadata of an uploaded file by file_id
 */
export const getUploadedFile = (fileId) => {
  loadRegistry();
  const record = metadataStore[fileId];
  if (!record) {
    const error = new Error(`Uploaded file with id '${fileId}' was not found.`);
    error.statusCode = 404;
    error.code = "FILE_NOT_FOUND";
    throw error;
  }
  return record;
};

