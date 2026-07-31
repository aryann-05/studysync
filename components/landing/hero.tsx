"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, Upload, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-24 right-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-in-up">
            <Badge
              variant="outline"
              className="mb-6 gap-2 rounded-full px-4 py-1.5 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Powered by AI & Spaced Repetition
            </Badge>
          </div>

          <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Study smarter,{" "}
            <span className="text-gradient">not harder.</span>
          </h1>

          <p
            className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            style={{ animationDelay: "100ms" }}
          >
            Upload your syllabus. StudySync automatically extracts topics,
            generates a personalized adaptive study plan using spaced
            repetition, and adapts to your confidence levels.
          </p>

          <div
            className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <PlayCircle className="h-4 w-4" />
                See How It Works
              </Button>
            </Link>
          </div>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              PDF · DOCX · TXT
            </span>
            <span className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-secondary" />
              Adaptive Scheduling
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Progress Tracking
            </span>
          </div>
        </div>

        {/* Hero mockup preview */}
        <div className="animate-fade-in-up mx-auto mt-16 max-w-5xl" style={{ animationDelay: "400ms" }}>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-muted-foreground">
                studysync.app/dashboard
              </span>
            </div>
            <div className="grid gap-4 p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Exam Countdown", value: "95 days" },
                  { label: "Completion", value: "56%" },
                  { label: "Study Streak", value: "5 days" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border bg-card p-4 transition-transform hover:-translate-y-0.5"
                  >
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold">{card.value}</p>
                    <div className="mt-3 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Weekly Study Hours
                  </p>
                  <div className="flex h-24 items-end gap-2">
                    {[40, 65, 50, 80, 55, 90, 35].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all hover:from-primary/80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Today's Tasks
                  </p>
                  {["Integration Techniques", "Electromagnetism", "Revision: Bonding"].map(
                    (task, i) => (
                      <div
                        key={task}
                        className="mb-2 flex items-center gap-2 rounded-lg border bg-muted/30 p-2.5"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            i === 0 ? "bg-amber-500" : i === 1 ? "bg-blue-500" : "bg-violet-500"
                          }`}
                        />
                        <span className="text-xs font-medium">{task}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

