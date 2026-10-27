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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(topics.map((t) => t.id))
  );

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(topics.map((t) => t.id)));
  const collapseAll = () => setExpandedIds(new Set());
  const allExpanded = topics.length > 0 && expandedIds.size === topics.length;

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

  const toggleTopic = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Validate & Select Topics ({selectedTopics.length}/{topics.length} selected · {selectedEffort} hrs)
            </h4>
            <p className="text-xs text-muted-foreground">
              Click any topic to inspect what it covers and what content is included.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={allExpanded ? collapseAll : expandAll}
              className="h-7 text-xs gap-1 border-primary/25 text-primary hover:bg-primary/5"
            >
              <BookOpen className="h-3 w-3" />
              {allExpanded ? "Collapse all details" : "Expand all details"}
            </Button>
            <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
              Select all
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll} className="h-7 text-xs">
              Clear
            </Button>
          </div>
        </div>

        <div className="max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={cn(
                "overflow-hidden rounded-lg border transition-all duration-200",
                selected.has(topic.id)
                  ? "border-primary/30 bg-card shadow-xs"
                  : "border-border/60 bg-muted/10 opacity-75",
                expandedIds.has(topic.id) && "ring-1 ring-primary/20"
              )}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => toggleExpand(topic.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpand(topic.id);
                  }
                }}
                className="flex w-full cursor-pointer items-start justify-between gap-3 p-3.5 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {/* Select Checkbox Button */}
                  <button
                    type="button"
                    aria-label={`Select ${topic.name}`}
                    onClick={(e) => toggleTopic(topic.id, e)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors mt-0.5",
                      selected.has(topic.id)
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-muted-foreground/40 bg-background hover:border-primary"
                    )}
                  >
                    {selected.has(topic.id) && <Check className="h-3.5 w-3.5" />}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {topic.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{topic.subject}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {topic.estimatedMinutes >= 60
                          ? `${Math.round((topic.estimatedMinutes / 60) * 10) / 10} hrs`
                          : `${topic.estimatedMinutes} mins`}
                      </span>
                    </div>

                    {/* Preview description snippet when collapsed */}
                    {!expandedIds.has(topic.id) && (topic.description || topic.notes) && (
                      <p className="line-clamp-1 text-xs text-muted-foreground/85 pt-0.5">
                        {topic.description || topic.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize text-[11px] font-medium px-2 py-0.5",
                      topic.difficulty === "easy" &&
                        "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
                      topic.difficulty === "medium" &&
                        "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5",
                      topic.difficulty === "hard" &&
                        "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5"
                    )}
                  >
                    {topic.difficulty}
                  </Badge>
                  <span className="text-muted-foreground hover:text-foreground p-0.5 transition-transform duration-200">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        expandedIds.has(topic.id) && "rotate-180 text-primary"
                      )}
                    />
                  </span>
                </div>
              </div>

              {/* Expanded Details Panel: What this topic covers & What content is included */}
              {expandedIds.has(topic.id) && (
                <div className="border-t border-border/70 bg-muted/20 p-4 space-y-4 text-sm animate-in fade-in-50 duration-200">
                  {/* 1. What this topic covers */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>What this topic covers</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-5">
                      {topic.description ||
                        topic.notes ||
                        "Covers core theoretical principles, foundational concepts, and functional mechanics for this curriculum topic."}
                    </p>
                  </div>

                  {/* 2. What content is included */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      <ListChecks className="h-3.5 w-3.5 text-secondary" />
                      <span>What content is included</span>
                    </div>
                    {topic.contentCovered && topic.contentCovered.length > 0 ? (
                      <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {topic.contentCovered.map((item, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-start gap-2 rounded-md border border-border/50 bg-background/80 p-2 text-xs text-foreground/85"
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                              ✓
                            </span>
                            <span className="leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2 rounded-md border border-border/50 bg-background/80 p-2 text-xs text-foreground/85">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                            ✓
                          </span>
                          <span className="leading-tight">Foundational principles and theoretical definitions</span>
                        </div>
                        <div className="flex items-start gap-2 rounded-md border border-border/50 bg-background/80 p-2 text-xs text-foreground/85">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                            ✓
                          </span>
                          <span className="leading-tight">Architectural designs, core methods, and workflows</span>
                        </div>
                        <div className="flex items-start gap-2 rounded-md border border-border/50 bg-background/80 p-2 text-xs text-foreground/85">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                            ✓
                          </span>
                          <span className="leading-tight">Practical implementation examples and edge cases</span>
                        </div>
                        <div className="flex items-start gap-2 rounded-md border border-border/50 bg-background/80 p-2 text-xs text-foreground/85">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                            ✓
                          </span>
                          <span className="leading-tight">Analysis, performance benchmarks, and exam review focus</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Topic Study Metadata Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>
                        Module: <strong className="text-foreground">{topic.subject}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Pacing: <strong className="text-foreground">{topic.estimatedMinutes} mins</strong> (~
                        {Math.round((topic.estimatedMinutes / 60) * 10) / 10}h)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-xs">
                      <Sparkles className="h-3 w-3" />
                      <span>SM-2 Spaced Repetition Enabled</span>
                    </div>
                  </div>
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


