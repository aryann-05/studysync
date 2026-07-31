"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FileUpload } from "@/components/upload/file-upload";
import { FilePreview } from "@/components/upload/file-preview";
import { TopicsPreview } from "@/components/upload/topics-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, UploadCloud } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { useStudyContext } from "@/context/StudyContext";
import { dummyUploadedFiles } from "@/lib/dummy-data";
import { formatDate } from "@/lib/utils";

export default function UploadPage() {
  const {
    files,
    isExtracting,
    extractedTopics,
    handleRemoveFile,
    handleExtractTopics,
  } = useUpload();
  const { addTopic } = useStudyContext();
  const [confirmed, setConfirmed] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const recentFiles = files.length > 0 ? files : dummyUploadedFiles;

  const handleConfirm = () => {
    if (extractedTopics) {
      extractedTopics.topics.forEach((topic) => addTopic(topic));
      setConfirmed(true);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Syllabus"
        description="Upload your syllabus and let AI extract all the topics automatically."
      >
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3 text-accent" />
          NLP Powered
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UploadCloud className="h-5 w-5 text-primary" />
                Upload your file
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload />
            </CardContent>
          </Card>

          {recentFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" />
                  Uploaded files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentFiles.map((file) => (
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
                  Extracted Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {confirmed ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Badge variant="success" className="gap-1">
                      ✓ Plan generated!
                    </Badge>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Your topics have been added to the study plan. Check your
                      calendar for the schedule.
                    </p>
                    <Button asChild>
                      <a href="/calendar">View Calendar</a>
                    </Button>
                  </div>
                ) : (
                  <TopicsPreview
                    topics={extractedTopics.topics}
                    totalHours={extractedTopics.totalEstimatedHours}
                    onConfirm={handleConfirm}
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
                Maximum file size: 10MB per file. Your files are processed
                securely and never shared.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How extraction works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "File is parsed and text is extracted",
                "NLP identifies headings & topics",
                "Topics are categorized by subject",
                "Difficulty and study time estimated",
                "Personalized plan generated",
              ].map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Last upload:{" "}
                {formatDate(recentFiles[0]?.uploadedAt ?? new Date())}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

