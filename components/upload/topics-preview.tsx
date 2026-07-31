"use client";

import { useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Topic } from "@/types";

interface TopicsPreviewProps {
  topics: Topic[];
  totalHours: number;
  onConfirm?: (topics: Topic[]) => void;
  onEdit?: (topicId: string) => void;
}

export function TopicsPreview({
  topics,
  totalHours,
  onConfirm,
}: TopicsPreviewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(topics.map((t) => t.id))
  );

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

  const selectedTopics = topics.filter((t) => selected.has(t.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border bg-accent/5 p-4">
        <Sparkles className="h-5 w-5 shrink-0 text-accent" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {topics.length} topics
          </span>{" "}
          extracted from your syllabus using NLP. Estimated total study time:{" "}
          <span className="font-semibold text-foreground">
            {Math.round(totalHours / 10) / 10} hours
          </span>
        </p>
      </div>

      <div className="space-y-2">
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

      <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            {selectedTopics.length} of {topics.length} topics selected
          </p>
          <Progress
            value={(selectedTopics.length / topics.length) * 100}
            className="mt-2 max-w-[200px]"
          />
        </div>
        <Button onClick={() => onConfirm?.(selectedTopics)} disabled={selectedTopics.length === 0}>
          Confirm & Generate Plan
        </Button>
      </div>
    </div>
  );
}

