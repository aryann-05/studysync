import type {
  ApiResponse,
  ExtractedTopics,
  Topic,
  UploadedFile,
} from "@/types";
import api, { post, get } from "@/services/api";

export interface UploadProgressCallback {
  (progress: number): void;
}

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB to match backend

export interface ExtractedSyllabusData extends ExtractedTopics {
  summary?: {
    total_modules: number;
    total_topics: number;
    total_estimated_hours: number;
    difficulty_breakdown?: {
      easy: number;
      medium: number;
      hard: number;
    };
    overview?: string;
    summary_points?: string[];
  };
  modules?: Array<{
    module_name: string;
    topics: Array<{
      title: string;
      estimated_hours: number;
      difficulty_weight: number;
    }>;
  }>;
}

const STORAGE_KEY_UPLOADS = "studysync_uploaded_files";

function getStoredUploads(): UploadedFile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UPLOADS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUploads(files: UploadedFile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_UPLOADS, JSON.stringify(files));
  } catch (err) {
    console.error("Failed to persist uploaded files:", err);
  }
}

/**
 * Upload syllabus file via multipart/form-data to POST /api/v1/upload
 */
export async function uploadFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<ApiResponse<UploadedFile>> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 15MB limit.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percentCompleted);
      }
    },
  });

  const resData = response.data;
  const backendFile = resData?.data || {};

  const uploadedFile: UploadedFile = {
    id: backendFile.file_id || "file_" + Date.now(),
    name: backendFile.original_name || file.name,
    size: backendFile.size || file.size,
    type: file.type || "application/octet-stream",
    uploadProgress: 100,
    uploadedAt: new Date(),
  };

  const existing = getStoredUploads();
  saveStoredUploads([uploadedFile, ...existing.filter((f) => f.id !== uploadedFile.id)]);

  return {
    success: true,
    data: uploadedFile,
    message: resData.message || "File uploaded successfully",
  };
}

/**
 * Get all user uploaded files (persisted per user)
 */
export async function getUploadedFiles(): Promise<ApiResponse<UploadedFile[]>> {
  const files = getStoredUploads();
  return { success: true, data: files };
}

/**
 * Delete uploaded file from local list
 */
export async function deleteUploadedFile(
  fileId: string
): Promise<ApiResponse<null>> {
  const existing = getStoredUploads();
  saveStoredUploads(existing.filter((f) => f.id !== fileId));
  return { success: true, data: null, message: "File removed" };
}

/**
 * Extract topics and curriculum overview from uploaded syllabus file
 * POST /api/v1/plans/extract-topics
 */
export async function extractTopics(
  fileId: string
): Promise<ApiResponse<ExtractedSyllabusData>> {
  const response = await post<{
    status: string;
    message: string;
    data: {
      file_id: string;
      original_name: string;
      summary: {
        total_modules: number;
        total_topics: number;
        total_estimated_hours: number;
        difficulty_breakdown?: {
          easy: number;
          medium: number;
          hard: number;
        };
        overview?: string;
        summary_points?: string[];
      };
      modules: Array<{
        module_name: string;
        topics: Array<{
          title: string;
          estimated_hours: number;
          difficulty_weight: number;
        }>;
      }>;
    };
  }>("/plans/extract-topics", { file_id: fileId });

  const { file_id, original_name, summary, modules = [] } = response.data;

  // Transform backend modules and topics into frontend Topic[]
  const frontendTopics: Topic[] = [];
  let topicIndex = 0;

  for (const mod of modules) {
    for (const t of mod.topics || []) {
      topicIndex += 1;
      const weight = Number(t.difficulty_weight) || 1.0;
      const diff: "easy" | "medium" | "hard" =
        weight >= 1.3 ? "hard" : weight <= 0.9 ? "easy" : "medium";

      frontendTopics.push({
        id: `extracted-${topicIndex}-${Date.now()}`,
        name: t.title,
        subject: mod.module_name,
        difficulty: diff,
        status: "new",
        confidence: "medium",
        estimatedMinutes: Math.round((Number(t.estimated_hours) || 1.0) * 60),
        actualMinutes: 0,
        dueDate: "",
        notes: `Estimated study time: ${t.estimated_hours} hrs. Difficulty weight: ${weight}.`,
      });
    }
  }

  const extractedData: ExtractedSyllabusData = {
    fileId: file_id,
    fileName: original_name,
    topics: frontendTopics,
    totalEstimatedHours: summary?.total_estimated_hours || 0,
    summary,
    modules,
  };

  return {
    success: true,
    data: extractedData,
    message: response.message,
  };
}

/**
 * Confirm topics and generate a full study plan with SRS scheduling in MongoDB
 */
export async function confirmTopics(
  topics: Topic[],
  planDetails?: {
    courseName?: string;
    fileId?: string;
    startDate?: string;
    examDate?: string;
    dailyMaxHours?: number;
    modules?: any[];
  }
): Promise<ApiResponse<{ topicCount: number; estimatedHours: number; plan?: any }>> {
  const today = new Date().toISOString().split("T")[0];
  const defaultExam = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const payload = {
    course_name: planDetails?.courseName || "General Course",
    file_id: planDetails?.fileId,
    modules: planDetails?.modules,
    start_date: planDetails?.startDate || today,
    exam_date: planDetails?.examDate || defaultExam,
    daily_max_hours: planDetails?.dailyMaxHours || 3.5,
  };

  const response = await post<{
    status: string;
    message: string;
    data: any;
  }>("/plans/generate", payload);

  return {
    success: true,
    data: {
      topicCount: response.data?.total_topics || topics.length,
      estimatedHours: response.data?.total_hours || 0,
      plan: response.data,
    },
    message: response.message || "Study plan generated successfully",
  };
}


