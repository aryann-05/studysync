"use client";

import { useCallback, useState } from "react";
import type { ExtractedTopics, UploadedFile } from "@/types";
import {
  confirmTopics,
  deleteUploadedFile,
  extractTopics,
  getUploadedFiles,
  uploadFile,
} from "@/services/upload";

interface UseUploadReturn {
  files: UploadedFile[];
  isUploading: boolean;
  uploadProgress: number;
  extractedTopics: ExtractedTopics | null;
  isExtracting: boolean;
  error: string | null;
  handleFileSelect: (file: File) => Promise<void>;
  handleRemoveFile: (fileId: string) => Promise<void>;
  handleExtractTopics: (fileId: string) => Promise<void>;
  handleConfirmTopics: () => Promise<void>;
  loadFiles: () => Promise<void>;
}

export function useUpload(): UseUploadReturn {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedTopics, setExtractedTopics] =
    useState<ExtractedTopics | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      const response = await getUploadedFiles();
      if (response.success) {
        setFiles(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    try {
      const response = await uploadFile(file, (progress) =>
        setUploadProgress(progress)
      );
      if (response.success) {
        setFiles((prev) => [...prev, response.data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemoveFile = useCallback(async (fileId: string) => {
    try {
      await deleteUploadedFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  }, []);

  const handleExtractTopics = useCallback(async (fileId: string) => {
    setIsExtracting(true);
    setError(null);
    try {
      const response = await extractTopics(fileId);
      if (response.success) {
        setExtractedTopics(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract topics");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleConfirmTopics = useCallback(async () => {
    if (!extractedTopics) return;
    try {
      await confirmTopics(extractedTopics.topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm topics");
    }
  }, [extractedTopics]);

  return {
    files,
    isUploading,
    uploadProgress,
    extractedTopics,
    isExtracting,
    error,
    handleFileSelect,
    handleRemoveFile,
    handleExtractTopics,
    handleConfirmTopics,
    loadFiles,
  };
}

