import type {
  ApiResponse,
  ExtractedTopics,
  Topic,
  UploadedFile,
} from "@/types";
import { dummyExtractedTopics, dummyUploadedFiles } from "@/lib/dummy-data";

const MOCK_DELAY = 1200;

export interface UploadProgressCallback {
  (progress: number): void;
}

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<ApiResponse<UploadedFile>> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress?.(progress);

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          reject(new Error(`File type "${file.type}" is not supported.`));
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          reject(new Error("File size exceeds 10MB limit."));
          return;
        }

        resolve({
          success: true,
          data: {
            id: "file-" + Date.now(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadProgress: 100,
            uploadedAt: new Date(),
          },
        });
      } else {
        onProgress?.(progress);
      }
    }, 150);
  });
}

export async function getUploadedFiles(): Promise<ApiResponse<UploadedFile[]>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return { success: true, data: dummyUploadedFiles };
}

export async function deleteUploadedFile(
  fileId: string
): Promise<ApiResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, data: null, message: "File deleted" };
}

export async function extractTopics(
  fileId: string
): Promise<ApiResponse<ExtractedTopics>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return { success: true, data: dummyExtractedTopics };
}

export async function confirmTopics(
  topics: Topic[]
): Promise<ApiResponse<{ topicCount: number; estimatedHours: number }>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  const totalMinutes = topics.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  return {
    success: true,
    data: {
      topicCount: topics.length,
      estimatedHours: Math.round(totalMinutes / 60),
    },
    message: "Topics confirmed and added to your study plan",
  };
}

