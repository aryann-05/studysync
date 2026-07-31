"use client";

import { CheckCircle2 } from "lucide-react";

const benefits = [
  {
    title: "Better Retention",
    description:
      "Spaced repetition schedules reviews at optimal intervals to maximize long-term memory retention.",
  },
  {
    title: "Save Time",
    description:
      "No more planning. StudySync automatically creates and adapts your schedule so you can focus on studying.",
  },
  {
    title: "Stay Motivated",
    description:
      "Study streaks, mastery scores, and progress tracking keep you engaged and consistent.",
  },
  {
    title: "Reduce Anxiety",
    description:
      "Clear daily tasks and an organized plan eliminate the stress of wondering what to study next.",
  },
];

const stats = [
  { value: "87%", label: "Better retention" },
  { value: "5hrs", label: "Saved weekly" },
  { value: "10k+", label: "Active students" },
  { value: "4.9★", label: "Average rating" },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Benefits
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Why students love StudySync
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of students who transformed their study habits.
          </p>

          <div className="mt-8 space-y-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-gradient text-4xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-8 text-center text-white">
            <p className="text-2xl font-bold">
              Ready to study smarter?
            </p>
            <p className="mt-1 text-sm text-white/80">
              Create your free study plan today.
            </p>
            <a
              href="/register"
              className="mt-4 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

