"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  AlertTriangle,
  RefreshCw,
  History,
} from "lucide-react";
import { useStudyContext } from "@/context/StudyContext";
import {
  getProgressData,
  getWeakTopics,
  getStrongTopics,
} from "@/lib/helpers";
import { formatDuration, formatDate } from "@/lib/utils";
import { CONFIDENCE_EMOJIS } from "@/lib/constants";

export default function ProgressPage() {
  const { topics, sessions } = useStudyContext();
  const progress = getProgressData(topics, sessions);
  const weakTopics = getWeakTopics(topics).slice(0, 5);
  const strongTopics = getStrongTopics(topics).slice(0, 5);
  const completedSessions = sessions
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
  const revisionHistory = topics
    .filter((t) => t.status === "revised" || t.status === "completed")
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress"
        description="Your journey to mastery, tracked."
      />

      {/* Overall progress */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              Completion
            </div>
            <p className="mt-2 text-2xl font-bold">
              {progress.completionPercent}%
            </p>
            <Progress
              value={progress.completionPercent}
              className="mt-3"
              indicatorClassName="bg-primary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Completed
            </div>
            <p className="mt-2 text-2xl font-bold">
              {progress.completedTopics}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {progress.totalTopics} topics
              </span>
            </p>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${(progress.completedTopics / progress.totalTopics) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Mastery Score
            </div>
            <p className="mt-2 text-2xl font-bold">{progress.masteryScore}%</p>
            <Progress
              value={progress.masteryScore}
              className="mt-3"
              indicatorClassName="bg-secondary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-orange-500" />
              Total Hours
            </div>
            <p className="mt-2 text-2xl font-bold">
              {(sessions.reduce((acc, s) => acc + s.duration, 0) / 60).toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground"> hrs</span>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Across {sessions.filter((s) => s.completed).length} sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              Study Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-6 pl-5">
              <span className="absolute bottom-0 left-[7px] top-0 w-0.5 bg-border" />
              {completedSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No completed sessions yet. Start studying!
                </p>
              ) : (
                completedSessions.map((session) => (
                  <div key={session.id} className="relative">
                    <span className="absolute -left-5 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-accent bg-background" />
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{session.topicName}</p>
                        <Badge
                          variant={
                            session.confidence === "high"
                              ? "success"
                              : session.confidence === "medium"
                              ? "warning"
                              : "destructive"
                          }
                          className="shrink-0"
                        >
                          {CONFIDENCE_EMOJIS[session.confidence]}{" "}
                          {session.confidence}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(session.date)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed sessions list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Completed Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {completedSessions.slice(0, 6).map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {session.topicName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(session.duration)}
                    </Badge>
                    <Badge variant="success" className="text-[10px]">
                      Done
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weak topics */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Weak Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {weakTopics.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No weak topics. Keep it up! 🎉
                </p>
              ) : (
                weakTopics.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/[0.03] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{topic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.subject}
                      </p>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      Low
                    </Badge>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Strong topics */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-accent" />
              Strong Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strongTopics.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No strong topics yet.
                </p>
              ) : (
                strongTopics.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent/[0.03] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{topic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.subject}
                      </p>
                    </div>
                    <Badge variant="success" className="shrink-0">
                      High
                    </Badge>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Revision history */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-secondary" />
              Revision History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {revisionHistory.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No revisions scheduled yet.
                </p>
              ) : (
                revisionHistory.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: topic.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {topic.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {topic.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(topic.dueDate)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize"
                      >
                        {topic.status}
                      </Badge>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

