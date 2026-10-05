"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FileUpload } from "@/components/upload/file-upload";
import { FilePreview } from "@/components/upload/file-preview";
import { TopicsPreview } from "@/components/upload/topics-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { useStudyContext } from "@/context/StudyContext";
import { formatDate } from "@/lib/utils";

export default function UploadPage() {
  const {
    files,
    isUploading,
    uploadProgress,
    isExtracting,
    extractedTopics,
    selectedFileId,
    error,
    setSelectedFileId,
    handleFileSelect,
    handleRemoveFile,
    handleExtractTopics,
    handleConfirmTopics,
  } = useUpload();

  const { refreshStudyData } = useStudyContext();
  const [confirmed, setConfirmed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleConfirm = async (
    _selectedTopics: any[],
    config: {
      courseName: string;
      startDate: string;
      examDate: string;
      dailyMaxHours: number;
    }
  ) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await handleConfirmTopics(config);
      await refreshStudyData();
      setConfirmed(true);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Failed to generate study plan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Syllabus"
        description="Upload your syllabus (PDF, DOCX, TXT) and let AI extract, summarize, and schedule your study plan."
      >
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3 text-accent" />
          NLP Powered
        </Badge>
      </PageHeader>

      {(error || generationError) && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error || generationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UploadCloud className="h-5 w-5 text-primary" />
                Upload your syllabus file
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelected={handleFileSelect}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </CardContent>
          </Card>

          {isExtracting && (
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-semibold text-sm">Extracting and summarizing topics via NLP...</p>
                <p className="text-xs text-muted-foreground">Parsing module hierarchies, estimated study hours, and academic weights.</p>
              </CardContent>
            </Card>
          )}

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" />
                  Your Uploaded Files ({files.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {files.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    isExtracting={isExtracting && selectedFileId === file.id}
                    onRemove={(id) => handleRemoveFile(id)}
                    onExtract={(id) => {
                      setSelectedFileId(id);
                      handleExtractTopics(id);
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {extractedTopics && (
            <Card className="border-accent/30 bg-accent/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Extracted Curriculum & Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {confirmed ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Badge variant="success" className="gap-1 py-1 px-3 text-sm">
                      ✓ Adaptive Study Plan Generated!
                    </Badge>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Your syllabus has been parsed into scheduled daily study sessions and SuperMemo SM-2 review cycles.
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Button asChild>
                        <a href="/calendar">View Study Calendar</a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/dashboard">Go to Dashboard</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <TopicsPreview
                    topics={extractedTopics.topics}
                    totalHours={extractedTopics.totalEstimatedHours}
                    summary={extractedTopics.summary}
                    initialCourseName={extractedTopics.fileName?.replace(/\.[^/.]+$/, "")}
                    onConfirm={handleConfirm}
                    isGenerating={isGenerating}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supported formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "PDF", desc: "Portable Document Format", ext: ".pdf" },
                { name: "DOCX", desc: "Microsoft Word", ext: ".docx" },
                { name: "TXT", desc: "Plain text files", ext: ".txt" },
              ].map((format) => (
                <div
                  key={format.ext}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{format.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format.desc}
                    </p>
                  </div>
                  <Badge variant="outline">{format.ext}</Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Maximum file size: 15MB per file. Your documents are analyzed privately and securely.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How extraction works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "File text parsed and extracted securely",
                "NLP identifies module titles and topic hierarchies",
                "Difficulty weights and study hours calculated",
                "Interactive review to validate topics and capacity",
                "SuperMemo SM-2 adaptive daily plan generated",
              ].map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Last upload: {formatDate(files[0]?.uploadedAt ?? new Date())}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


