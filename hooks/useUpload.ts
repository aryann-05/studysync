"use client";

import { useCallback, useEffect, useState } from "react";
import type { UploadedFile } from "@/types";
import {
  confirmTopics,
  deleteUploadedFile,
  extractTopics,
  getUploadedFiles,
  uploadFile,
  type ExtractedSyllabusData,
} from "@/services/upload";

interface UseUploadReturn {
  files: UploadedFile[];
  isUploading: boolean;
  uploadProgress: number;
  extractedTopics: ExtractedSyllabusData | null;
  isExtracting: boolean;
  error: string | null;
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;
  handleFileSelect: (file: File) => Promise<void>;
  handleRemoveFile: (fileId: string) => Promise<void>;
  handleExtractTopics: (fileId: string) => Promise<void>;
  handleConfirmTopics: (details?: {
    courseName?: string;
    startDate?: string;
    examDate?: string;
    dailyMaxHours?: number;
    selectedTopics?: any[];
  }) => Promise<any>;
  loadFiles: () => Promise<void>;
}

export function useUpload(): UseUploadReturn {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedTopics, setExtractedTopics] =
    useState<ExtractedSyllabusData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

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

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleExtractTopics = useCallback(async (fileId: string) => {
    setIsExtracting(true);
    setSelectedFileId(fileId);
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

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      try {
        const response = await uploadFile(file, (progress) =>
          setUploadProgress(progress)
        );
        if (response.success) {
          const newFile = response.data;
          setFiles((prev) => [newFile, ...prev.filter((f) => f.id !== newFile.id)]);
          // Automatically trigger extraction for immediate preview and validation
          await handleExtractTopics(newFile.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [handleExtractTopics]
  );

  const handleRemoveFile = useCallback(async (fileId: string) => {
    try {
      await deleteUploadedFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
        setExtractedTopics(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  }, [selectedFileId]);

  const handleConfirmTopics = useCallback(
    async (details?: {
      courseName?: string;
      startDate?: string;
      examDate?: string;
      dailyMaxHours?: number;
      selectedTopics?: any[];
    }) => {
      if (!extractedTopics) return null;
      try {
        const result = await confirmTopics(extractedTopics.topics, {
          fileId: extractedTopics.fileId,
          courseName: details?.courseName || extractedTopics.fileName?.replace(/\.[^/.]+$/, "") || "Syllabus Course",
          startDate: details?.startDate,
          examDate: details?.examDate,
          dailyMaxHours: details?.dailyMaxHours,
          modules: extractedTopics.modules,
        });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to confirm topics";
        setError(message);
        throw err;
      }
    },
    [extractedTopics]
  );

  return {
    files,
    isUploading,
    uploadProgress,
    extractedTopics,
    isExtracting,
    error,
    selectedFileId,
    setSelectedFileId,
    handleFileSelect,
    handleRemoveFile,
    handleExtractTopics,
    handleConfirmTopics,
    loadFiles,
  };
}

