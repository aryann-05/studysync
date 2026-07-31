"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { useUpload } from "@/hooks/useUpload";
import type { UploadedFile } from "@/types";

interface FileUploadProps {
  onFileSelected?: (file: File) => void;
}

export function FileUpload({ onFileSelected }: FileUploadProps) {
  const {
    isUploading,
    uploadProgress,
    handleFileSelect,
    handleRemoveFile,
  } = useUpload();

  const [dragActive, setDragActive] = useState(false);
  const [localFiles, setLocalFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      onFileSelected?.(file);
      await handleFileSelect(file);
      setLocalFiles((prev) => [
        ...prev,
        {
          id: "local-" + Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 100,
          uploadedAt: new Date(),
        },
      ]);
    },
    [handleFileSelect, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const removeLocalFile = (id: string) => {
    setLocalFiles((prev) => prev.filter((f) => f.id !== id));
    handleRemoveFile(id);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-all sm:p-12",
          dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        )}
        aria-label="Upload a file"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,application/pdf,text/plain"
          onChange={handleInputChange}
        />
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform",
            dragActive && "scale-110"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <UploadCloud className="h-7 w-7" />
          )}
        </span>
        <div>
          <p className="text-base font-semibold">
            {dragActive ? "Drop it here!" : "Drag & drop your syllabus"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or <span className="font-medium text-primary">browse files</span> on
            your device
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2.5 py-1">PDF</span>
          <span className="rounded-full border px-2.5 py-1">DOCX</span>
          <span className="rounded-full border px-2.5 py-1">TXT</span>
          <span className="rounded-full border px-2.5 py-1">Max 10MB</span>
        </div>
      </div>

      {isUploading && (
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Uploading...</span>
            <span className="text-muted-foreground">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="mt-2" />
        </div>
      )}

      {localFiles.length > 0 && (
        <div className="space-y-2">
          {localFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · Uploaded just now
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLocalFile(file.id)}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

