"use client";

import { Upload, CalendarRange, BookOpenCheck, RefreshCw } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";

const stepIcons = [Upload, CalendarRange, BookOpenCheck, RefreshCw];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y bg-muted/30 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            From syllabus to success in 4 steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting started with StudySync takes less than a minute.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-primary/20 via-secondary/40 to-accent/20 lg:block" />
          <div className="grid gap-8 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = stepIcons[i] ?? Upload;
              return (
                <div key={step.step} className="relative">
                  <div className="flex items-center gap-4 lg:flex-col lg:text-center">
                    <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-background text-primary shadow-lg">
                      <Icon className="h-7 w-7" />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                        {step.step}
                      </span>
                    </span>
                    <div className="lg:mt-4">
                      <h3 className="text-base font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

