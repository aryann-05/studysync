"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK, MONTHS } from "@/lib/constants";
import { useStudyContext } from "@/context/StudyContext";
import type { Topic } from "@/types";

interface CalendarProps {
  onSelectDay?: (topics: Topic[]) => void;
}

function getStatusColor(topic: Topic): string {
  switch (topic.status) {
    case "completed":
      return "bg-emerald-500";
    case "revised":
      return "bg-violet-500";
    case "missed":
      return "bg-red-500";
    case "studying":
      return "bg-amber-500";
    default:
      return "bg-blue-500";
  }
}

export function Calendar({ onSelectDay }: CalendarProps) {
  const { topics, sessions } = useStudyContext();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startingDay = firstDayOfMonth.getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getTopicsForDate = (day: number): Topic[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const matchedTopics = [
      ...topics.filter(
        (t) =>
          t.dueDate === dateStr ||
          (t.completedDate && t.completedDate === dateStr)
      ),
    ];

    const matchedSessions = sessions.filter((s) => s.date === dateStr);
    for (const s of matchedSessions) {
      if (!matchedTopics.some((t) => t.id === s.topicId)) {
        matchedTopics.push({
          id: s.topicId,
          name: s.topicName,
          subject: s.notes?.includes("REVIEW") ? "Spaced Revision" : "Scheduled Study",
          difficulty: "medium",
          status: s.completed ? "completed" : "studying",
          confidence: s.confidence,
          estimatedMinutes: s.duration,
          actualMinutes: s.duration,
          dueDate: s.date,
        });
      }
    }

    return matchedTopics;
  };

  const cells = [];
  for (let i = 0; i < startingDay; i++) {
    cells.push(
      <div key={`empty-${i}`} className="min-h-16 rounded-lg border border-dashed" />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayTopics = getTopicsForDate(day);
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();
    const dateFormatted = `${MONTHS[currentMonth]} ${day}, ${currentYear}`;

    cells.push(
      <Tooltip key={day}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onSelectDay?.(dayTopics)}
            className={cn(
              "group flex min-h-16 flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isToday && "border-primary bg-primary/10 ring-2 ring-primary/30"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                isToday ? "bg-primary text-white" : "text-foreground"
              )}
            >
              {day}
            </span>
            {dayTopics.length > 0 && (
              <div className="flex w-full flex-wrap gap-0.5">
                {dayTopics.slice(0, 3).map((topic) => (
                  <span
                    key={topic.id}
                    className={cn("h-1.5 w-1.5 rounded-full", getStatusColor(topic))}
                  />
                ))}
                {dayTopics.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{dayTopics.length - 3}
                  </span>
                )}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="z-50 max-w-xs sm:max-w-sm rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-1.5">
              <span className="font-semibold text-xs text-foreground">
                {dateFormatted}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {dayTopics.length === 0
                  ? "Rest Day"
                  : `${dayTopics.length} topic${dayTopics.length > 1 ? "s" : ""}`}
              </span>
            </div>
            {dayTopics.length === 0 ? (
              <p className="py-1 text-xs text-muted-foreground">
                No study sessions scheduled for this date.
              </p>
            ) : (
              <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {dayTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-start gap-2 rounded-md bg-muted/50 p-2 text-left"
                  >
                    <span
                      className={cn(
                        "mt-1 h-2 w-2 shrink-0 rounded-full",
                        getStatusColor(topic)
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium text-foreground">
                        {topic.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="truncate max-w-[140px]">{topic.subject}</span>
                        <span>•</span>
                        <span>{topic.estimatedMinutes} min</span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                      {topic.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground italic text-center pt-0.5 border-t">
              Click to view full day details
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const legend = [
    { label: "New", color: "bg-blue-500" },
    { label: "Revision", color: "bg-violet-500" },
    { label: "Completed", color: "bg-emerald-500" },
    { label: "Missed", color: "bg-red-500" },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
            >
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {cells}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t pt-4">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
