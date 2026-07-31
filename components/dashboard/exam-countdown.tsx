"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Timer } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { EXAM_DATE } from "@/lib/constants";
import { getDaysUntil } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const target = new Date(EXAM_DATE);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function ExamCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());
  const daysUntil = getDaysUntil(EXAM_DATE);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <DashboardCard
      title="Exam Countdown"
      description="Final exam date"
      icon={<CalendarClock className="h-4 w-4 text-destructive" />}
      iconClassName="bg-destructive/10"
    >
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center rounded-lg border bg-muted/40 p-3"
          >
            <span className="text-xl font-bold tabular-nums sm:text-2xl">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/5 p-3 text-sm">
        <Timer className="h-4 w-4 shrink-0 text-destructive" />
        <span className="text-muted-foreground">
          <span className="font-semibold text-destructive">{daysUntil} days</span>{" "}
          remaining — stay on track!
        </span>
      </div>
    </DashboardCard>
  );
}

