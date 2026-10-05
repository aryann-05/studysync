"use client";

import { useState, useMemo } from "react";
import {
  Check,
  ChevronDown,
  Sparkles,
  BookOpen,
  Clock,
  AlertTriangle,
  Calendar,
  Award,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Topic } from "@/types";

interface SyllabusSummary {
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
}

interface TopicsPreviewProps {
  topics: Topic[];
  totalHours: number;
  summary?: SyllabusSummary;
  initialCourseName?: string;
  onConfirm?: (
    selectedTopics: Topic[],
    config: {
      courseName: string;
      startDate: string;
      examDate: string;
      dailyMaxHours: number;
    }
  ) => void;
  isGenerating?: boolean;
}

export function TopicsPreview({
  topics,
  totalHours,
  summary,
  initialCourseName = "Data Structures & Algorithms",
  onConfirm,
  isGenerating = false,
}: TopicsPreviewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(topics.map((t) => t.id))
  );

  // Plan parameters
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const defaultExamStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split("T")[0];
  }, []);

  const [courseName, setCourseName] = useState(initialCourseName);
  const [startDate, setStartDate] = useState(todayStr);
  const [examDate, setExamDate] = useState(defaultExamStr);
  const [dailyMaxHours, setDailyMaxHours] = useState(3.5);

  const toggleTopic = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(topics.map((t) => t.id)));
  const deselectAll = () => setSelected(new Set());

  const selectedTopics = useMemo(
    () => topics.filter((t) => selected.has(t.id)),
    [topics, selected]
  );

  // Calculate capacity and effort
  const selectedEffort = useMemo(() => {
    return Math.round(
      selectedTopics.reduce((acc, t) => acc + (t.estimatedMinutes / 60), 0) * 10
    ) / 10;
  }, [selectedTopics]);

  const availableDays = useMemo(() => {
    if (!startDate || !examDate) return 0;
    const diff = new Date(examDate).getTime() - new Date(startDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [startDate, examDate]);

  const totalCapacity = useMemo(() => {
    return Math.round(availableDays * dailyMaxHours * 10) / 10;
  }, [availableDays, dailyMaxHours]);

  const isOverloaded = selectedEffort > totalCapacity;

  const summaryPoints = useMemo(() => {
    if (summary?.summary_points && summary.summary_points.length > 0) {
      return summary.summary_points;
    }
    const modulesSet = new Set(topics.map((t) => t.subject).filter(Boolean));
    const easyCount = topics.filter((t) => t.difficulty === "easy").length;
    const medCount = topics.filter((t) => t.difficulty === "medium").length;
    const hardCount = topics.filter((t) => t.difficulty === "hard").length;
    return [
      `Curriculum Structure: Extracted ${modulesSet.size || summary?.total_modules || 3} thematic modules covering ${topics.length} core syllabus topics.`,
      `Workload Estimate: Total required effort estimated at ~${Math.round((summary?.total_estimated_hours ?? totalHours) * 10) / 10} hours of focused study.`,
      `Core Focus Areas: Spans ${Array.from(modulesSet).slice(0, 3).join(", ") || "Foundations, Algorithms, and Practical System Design"}.`,
      `Complexity Distribution: Comprises ${easyCount} foundational, ${medCount} intermediate, and ${hardCount} advanced topics.`,
      `Adaptive SM-2 Strategy: Spaced repetition intervals automatically adjust based on post-session confidence ratings to optimize retention.`,
    ];
  }, [summary, topics, totalHours]);

  return (
    <div className="space-y-6">
      {/* 1. Syllabus Overview & Summary Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">AI Curriculum Summarization & Extraction</h3>
        </div>

        {summary?.overview && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {summary.overview}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Modules</p>
            <p className="text-xl font-bold text-foreground">{summary?.total_modules ?? 4}</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Extracted Topics</p>
            <p className="text-xl font-bold text-primary">{topics.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Est. Study Hours</p>
            <p className="text-xl font-bold text-secondary">
              {Math.round((summary?.total_estimated_hours ?? totalHours) * 10) / 10}h
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Difficulty Mix</p>
            <div className="mt-1 flex gap-1">
              <Badge variant="outline" className="px-1 text-[10px] text-emerald-600">
                {summary?.difficulty_breakdown?.easy ?? 2} Easy
              </Badge>
              <Badge variant="outline" className="px-1 text-[10px] text-amber-600">
                {summary?.difficulty_breakdown?.medium ?? 5} Med
              </Badge>
              <Badge variant="outline" className="px-1 text-[10px] text-red-600">
                {summary?.difficulty_breakdown?.hard ?? 3} Hard
              </Badge>
            </div>
          </div>
        </div>

        {/* Summary Points List */}
        {summaryPoints.length > 0 && (
          <div className="mt-5 rounded-lg border border-primary/15 bg-card/75 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Key Curriculum Summary Points
              </h4>
            </div>
            <ul className="space-y-2.5">
              {summaryPoints.map((point, idx) => {
                const colonIndex = point.indexOf(":");
                const hasLabel = colonIndex !== -1 && colonIndex < 35;
                const label = hasLabel ? point.slice(0, colonIndex) : null;
                const text = hasLabel ? point.slice(colonIndex + 1).trim() : point;

                return (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[11px] mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      {label && (
                        <span className="font-semibold text-foreground mr-1.5">
                          {label}:
                        </span>
                      )}
                      <span className="text-muted-foreground">{text}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Interactive Topic Checklist & Validation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">
            Validate & Select Topics ({selectedTopics.length}/{topics.length} selected · {selectedEffort} hrs)
          </h4>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
              Select all
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll} className="h-7 text-xs">
              Clear
            </Button>
          </div>
        </div>

        <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="overflow-hidden rounded-lg border transition-colors hover:border-primary/30"
            >
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      selected.has(topic.id)
                        ? "border-primary bg-primary text-white"
                        : "border-border"
                    )}
                  >
                    {selected.has(topic.id) && <Check className="h-3 w-3" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.subject} · {topic.estimatedMinutes} min
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {topic.difficulty}
                  </Badge>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expanded === topic.id && "rotate-180"
                    )}
                  />
                </div>
              </button>
              {expanded === topic.id && (
                <div className="border-t bg-muted/30 p-3 text-sm text-muted-foreground">
                  {topic.notes ?? "No additional details extracted for this topic."}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Study Plan Parameters */}
      <div className="space-y-4 rounded-xl border p-4 bg-card">
        <h4 className="font-semibold text-sm">Study Plan Parameters</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="courseName" className="text-xs">Course Name</Label>
            <Input
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dailyMaxHours" className="text-xs">Daily Max Hours</Label>
            <Input
              id="dailyMaxHours"
              type="number"
              step="0.5"
              min="1"
              max="12"
              value={dailyMaxHours}
              onChange={(e) => setDailyMaxHours(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="startDate" className="text-xs">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="examDate" className="text-xs">Exam Date</Label>
            <Input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
        </div>

        {/* Capacity overload warning */}
        {isOverloaded ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Schedule Overload Warning:</span> Total required study effort (
              {selectedEffort} hrs) exceeds available capacity ({totalCapacity} hrs across {availableDays} days)
              before your exam. Please increase your daily study hours or extend the exam date.
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <Award className="h-4 w-4 shrink-0" />
            <span>
              Schedule capacity is balanced! {selectedEffort} hrs required out of {totalCapacity} hrs available.
            </span>
          </div>
        )}
      </div>

      {/* 4. Confirmation Action */}
      <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
        <div>
          <p className="text-sm font-medium">
            {selectedTopics.length} of {topics.length} topics validated
          </p>
          <Progress
            value={(selectedTopics.length / Math.max(1, topics.length)) * 100}
            className="mt-2 max-w-[200px]"
          />
        </div>
        <Button
          onClick={() =>
            onConfirm?.(selectedTopics, {
              courseName,
              startDate,
              examDate,
              dailyMaxHours,
            })
          }
          disabled={selectedTopics.length === 0 || isGenerating || isOverloaded}
          className="gap-2"
        >
          {isGenerating ? (
            <>Generating Plan...</>
          ) : (
            <>Confirm & Generate Adaptive Plan</>
          )}
        </Button>
      </div>
    </div>
  );
}


