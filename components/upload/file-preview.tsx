"use client";

import { FileText, CalendarDays, HardDrive, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatDate } from "@/lib/utils";
import type { UploadedFile } from "@/types";

interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: (id: string) => void;
  onExtract?: (id: string) => void;
  isExtracting?: boolean;
}

const fileTypeLabels: Record<string, string> = {
  "application/pdf": "PDF",
  "text/plain": "Text",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",
};

export function FilePreview({
  file,
  onRemove,
  onExtract,
  isExtracting,
}: FilePreviewProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{file.name}</p>
          <Badge variant="outline" className="shrink-0">
            {fileTypeLabels[file.type] ?? "File"}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(file.size)}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(file.uploadedAt)}
          </span>
          {file.uploadProgress === 100 && (
            <Badge variant="success" className="text-[10px]">
              Uploaded
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onExtract && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onExtract(file.id)}
            disabled={isExtracting}
          >
            {isExtracting ? "Extracting..." : "Extract Topics"}
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(file.id)}
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

