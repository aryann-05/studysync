"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDuration, formatDate } from "@/lib/utils";
import { CONFIDENCE_EMOJIS } from "@/lib/constants";
import {
  BookOpen,
  Clock,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Timer,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useStudyPlan } from "@/hooks/useStudyPlan";

export default function StudySessionPage() {
  const router = useRouter();
  const {
    currentTopic,
    topics,
    sessions,
    setCurrentTopic,
    submitConfidence,
    markTopicCompleted,
  } = useStudyPlan();

  const [selectedConfidence, setSelectedConfidence] = useState<
    "high" | "medium" | "low" | null
  >(null);
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const confidenceOptions = [
    {
      value: "high" as const,
      label: "High",
      emoji: CONFIDENCE_EMOJIS.high,
      description: "I understand this topic well",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-600",
    },
    {
      value: "medium" as const,
      label: "Medium",
      emoji: CONFIDENCE_EMOJIS.medium,
      description: "I need some more practice",
      color: "border-amber-500 bg-amber-500/10 text-amber-600",
    },
    {
      value: "low" as const,
      label: "Low",
      emoji: CONFIDENCE_EMOJIS.low,
      description: "I'm struggling with this topic",
      color: "border-red-500 bg-red-500/10 text-red-600",
    },
  ];

  const todaySessions = sessions.filter(
    (s) =>
      s.date === new Date().toISOString().split("T")[0] && s.completed
  ).length;

  const currentTopicDetails = currentTopic
    ? topics.find((t) => t.id === currentTopic.id) ?? currentTopic
    : null;

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      if (currentTopic && selectedConfidence) {
        await submitConfidence(currentTopic.id, selectedConfidence, {
          topicName: currentTopic.name,
          duration: currentTopic.estimatedMinutes,
          notes: notes || undefined,
        });
      } else if (currentTopic) {
        markTopicCompleted(currentTopic.id);
      }
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextTopic = () => {
    const remaining = topics.filter(
      (t) => t.status === "new" || t.status === "studying"
    );
    if (remaining.length > 0) {
      setCurrentTopic(remaining[0]);
    }
    setSelectedConfidence(null);
    setNotes("");
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title="Session Complete" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </span>
            <h2 className="text-2xl font-bold">Great work! 🎉</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your confidence has been recorded. StudySync will adapt your
              future sessions accordingly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {selectedConfidence && (
                <Badge
                  variant={
                    selectedConfidence === "high"
                      ? "success"
                      : selectedConfidence === "medium"
                      ? "warning"
                      : "destructive"
                  }
                >
                  Confidence: {selectedConfidence}
                </Badge>
              )}
              <Badge variant="outline">Plan updated</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={() => router.push("/calendar")}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Calendar
              </Button>
              <Button onClick={handleNextTopic}>
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Next Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentTopicDetails) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title="Study Session" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Sparkles className="h-12 w-12 text-primary" />
            <h2 className="text-2xl font-bold">You're all caught up!</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              No topics pending. Upload a new syllabus or check your calendar
              for upcoming revisions.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <a href="/upload">Upload Syllabus</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/calendar">View Calendar</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Study Session"
        description="Focus on the current topic, then rate your confidence."
      />

      {/* Topic card */}
      <Card className="overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {currentTopicDetails.status}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {currentTopicDetails.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {currentTopicDetails.subject}
            </span>
          </div>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <BookOpen className="h-5 w-5 text-primary" />
            {currentTopicDetails.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Estimated
              </div>
              <p className="mt-1 font-semibold">
                {formatDuration(currentTopicDetails.estimatedMinutes)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                Elapsed
              </div>
              <p className="mt-1 font-semibold">
                {formatDuration(currentTopicDetails.actualMinutes)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Due
              </div>
              <p className="mt-1 font-semibold">
                {formatDate(currentTopicDetails.dueDate)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Today
              </div>
              <p className="mt-1 font-semibold">{todaySessions} done</p>
            </div>
          </div>

          {/* Study timer */}
          <div className="mt-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Study timer</span>
              <span className="text-2xl font-bold tabular-nums">00:00</span>
            </div>
            <Progress value={currentTopicDetails.actualMinutes} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDuration(
                Math.max(
                  0,
                  currentTopicDetails.estimatedMinutes -
                    currentTopicDetails.actualMinutes
                )
              )}{" "}
              remaining for this session
            </p>
          </div>

          {/* Study notes */}
          <div className="mt-4">
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium"
            >
              Study Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Write down key concepts, formulas, or questions you want to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Confidence rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            How confident do you feel about this topic?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {confidenceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedConfidence(option.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md",
                selectedConfidence === option.value
                  ? option.color
                  : "border-border hover:border-muted-foreground/30"
              )}
              aria-pressed={selectedConfidence === option.value}
            >
              <span className="text-3xl" aria-hidden>
                {option.emoji}
              </span>
              <span className="font-semibold">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {!currentTopicDetails.status.includes("new") && (
          <Button
            variant="outline"
            onClick={() => currentTopic && markTopicCompleted(currentTopic.id)}
          >
            <AlertTriangle className="h-4 w-4" />
            Skip for Now
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleComplete}
          disabled={submitting || !selectedConfidence}
        >
          {submitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Complete Session
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

