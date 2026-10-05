"use client";

import { useState, useEffect } from "react";
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
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
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

  // Live Study Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Interval timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Reset timer on topic change
  useEffect(() => {
    if (currentTopic?.id) {
      setSecondsElapsed(0);
      setIsTimerRunning(false);
    }
  }, [currentTopic?.id]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const studiedHours = (secondsElapsed / 3600).toFixed(2);
  const studiedMinutes = Math.max(1, Math.round(secondsElapsed / 60));

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
    setIsTimerRunning(false);
    try {
      const studiedTimeFormatted = `${studiedHours} hrs (${studiedMinutes} mins)`;
      const finalDuration = secondsElapsed >= 60 ? studiedMinutes : currentTopicDetails?.estimatedMinutes || 60;
      if (currentTopic && selectedConfidence) {
        await submitConfidence(currentTopic.id, selectedConfidence, {
          topicName: currentTopic.name,
          duration: finalDuration,
          notes: notes
            ? `${notes} [Study Duration Tracked: ${studiedTimeFormatted}]`
            : `[Study Duration Tracked: ${studiedTimeFormatted}]`,
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
    setSecondsElapsed(0);
    setIsTimerRunning(false);
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
              <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                ⏱️ Studied: {studiedHours} hrs ({studiedMinutes} mins)
              </Badge>
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
              <Button variant="outline" onClick={() => router.push("/quiz")}>
                <HelpCircle className="mr-1.5 h-4 w-4 text-primary" />
                Module Quizzes
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

          {/* Live Study Session Timer */}
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      isTimerRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                    )}
                  />
                  <span className="text-sm font-semibold text-foreground">Live Study Session Timer</span>
                  <Badge variant="outline" className="text-[11px] font-medium capitalize">
                    {isTimerRunning ? "Tracking Time" : secondsElapsed > 0 ? "Paused" : "Ready"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click &apos;Start Timer&apos; to automatically measure how many hours you study this topic.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left sm:text-right">
                  <div className="font-mono text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {formatTimer(secondsElapsed)}
                  </div>
                  <div className="text-[11px] font-semibold text-primary">
                    {studiedHours} hours studied
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {!isTimerRunning ? (
                <Button
                  type="button"
                  onClick={() => setIsTimerRunning(true)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                  size="sm"
                >
                  <Play className="h-4 w-4 fill-white" />
                  {secondsElapsed > 0 ? "Resume Timer" : "Start Timer"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTimerRunning(false)}
                  className="gap-2 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 font-medium"
                  size="sm"
                >
                  <Pause className="h-4 w-4" />
                  Pause Timer
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsTimerRunning(false);
                  setSecondsElapsed(0);
                }}
                disabled={secondsElapsed === 0}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                size="sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSecondsElapsed((prev) => prev + 300)}
                className="text-xs h-8 ml-auto"
                size="sm"
              >
                +5 Mins
              </Button>
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Session Target Effort</span>
                <span>
                  {Math.min(
                    100,
                    Math.round(
                      (secondsElapsed / (Math.max(1, currentTopicDetails.estimatedMinutes) * 60)) * 100
                    )
                  )}%
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  Math.round(
                    (secondsElapsed / (Math.max(1, currentTopicDetails.estimatedMinutes) * 60)) * 100
                  )
                )}
                className="h-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Target: {formatDuration(currentTopicDetails.estimatedMinutes)} ·{" "}
                {Math.max(
                  0,
                  Math.round(currentTopicDetails.estimatedMinutes - secondsElapsed / 60)
                )}{" "}
                minutes remaining to reach estimated effort
              </p>
            </div>
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

