import { registerUploadedFile } from "../services/uploadService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Handle document upload: POST /api/v1/upload
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "No file uploaded. Please provide a PDF, DOCX, or TXT document.", "NO_FILE_PROVIDED", 400);
    }

    const userId = req.user.user_id;
    const fileData = await registerUploadedFile(req.file, userId);

    return sendSuccess(
      res,
      "File uploaded successfully",
      fileData,
      200
    );
  } catch (error) {
    next(error);
  }
};

