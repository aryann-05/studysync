"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Calendar } from "@/components/calendar/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ListTodo, CalendarClock, Plus } from "lucide-react";
import { useStudyContext } from "@/context/StudyContext";
import { getTodayTasks, getUpcomingRevisions } from "@/lib/helpers";
import { formatDuration, formatDate } from "@/lib/utils";
import type { Topic } from "@/types";

export default function CalendarPage() {
  const { topics } = useStudyContext();
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const todayTasks = getTodayTasks(topics).slice(0, 4);
  const upcoming = getUpcomingRevisions(topics, 5);
  const newTopics = topics.filter((t) => t.status === "new").slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Calendar"
        description="Visualize your study schedule, revisions, and completed topics."
      >
        <Button size="sm" asChild>
          <a href="/upload">
            <Plus className="h-4 w-4" />
            Add Syllabus
          </a>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Calendar onSelectDay={(dayTopics) => setSelectedTopics(dayTopics)} />
        </div>

        <div className="space-y-6">
          {/* Selected day detail */}
          {selectedTopics.length > 0 && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-base">Day Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedTopics.map((topic) => (
                  <div key={topic.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {topic.name}
                      </p>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {topic.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {topic.subject} · {formatDuration(topic.estimatedMinutes)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Today's tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTodo className="h-4 w-4 text-primary" />
                Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Nothing scheduled for today
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {todayTasks.map((topic) => (
                    <li
                      key={topic.id}
                      className="flex items-center gap-2 rounded-lg border p-2.5"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: topic.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {topic.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(topic.estimatedMinutes)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Upcoming topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4 text-blue-500" />
                Upcoming Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {newTopics.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center gap-2 rounded-lg border p-2.5"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{topic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.subject}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Revision schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-violet-500" />
                Revision Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {upcoming.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {topic.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {topic.subject}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(topic.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

