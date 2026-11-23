import { Router } from "express";
import { uploadFile } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/", authenticate, upload.single("file"), uploadFile);

export default router;

