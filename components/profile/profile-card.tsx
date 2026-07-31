"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, CalendarDays, Clock, Target } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import type { User } from "@/types";

interface ProfileCardProps {
  user: User;
  stats?: {
    completedTopics: number;
    totalTopics: number;
    studyHours: number;
    streak: number;
  };
}

export function ProfileCard({ user, stats }: ProfileCardProps) {
  const statItems = stats
    ? [
        { label: "Topics", value: `${stats.completedTopics}/${stats.totalTopics}` },
        { label: "Hours", value: `${stats.studyHours}h` },
        { label: "Streak", value: `${stats.streak}d` },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">
              <Target className="mr-1 h-3 w-3" />
              {user.studyHoursPerDay}h/day goal
            </Badge>
            {user.examDate && (
              <Badge variant="outline">
                <CalendarDays className="mr-1 h-3 w-3" />
                Exam: {formatDate(user.examDate)}
              </Badge>
            )}
          </div>

          {statItems.length > 0 && (
            <div className="mt-2 grid w-full grid-cols-3 gap-2">
              {statItems.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border bg-muted/30 p-3"
                >
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Member since {formatDate(user.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

