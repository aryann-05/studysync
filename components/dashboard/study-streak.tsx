"use client";

import { Flame } from "lucide-react";
import { StatCard } from "./stat-card";
import { useStudyContext } from "@/context/StudyContext";
import { calculateStudyStreak } from "@/lib/helpers";

export function StudyStreak() {
  const { sessions } = useStudyContext();
  const streak = calculateStudyStreak(sessions);

  return (
    <StatCard
      title="Study Streak"
      value={`${streak} days`}
      icon={Flame}
      iconClassName="bg-orange-500/10 text-orange-500"
      description="Consecutive days studying"
      trend="up"
      trendValue="+1 vs last week"
    />
  );
}

