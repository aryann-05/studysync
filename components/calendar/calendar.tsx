"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { topics } = useStudyContext();
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
    return topics.filter(
      (t) =>
        t.dueDate === dateStr ||
        (t.completedDate && t.completedDate === dateStr)
    );
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

    cells.push(
      <button
        key={day}
        type="button"
        onClick={() => onSelectDay?.(dayTopics)}
        className={cn(
          "group flex min-h-16 flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5",
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
                title={topic.name}
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
    );
  }

  const legend = [
    { label: "New", color: "bg-blue-500" },
    { label: "Revision", color: "bg-violet-500" },
    { label: "Completed", color: "bg-emerald-500" },
    { label: "Missed", color: "bg-red-500" },
  ];

  return (
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
  );
}

