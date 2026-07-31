"use client";

import {
  Upload,
  Repeat,
  RefreshCw,
  TrendingUp,
  Bell,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Upload,
  Repeat,
  RefreshCw,
  TrendingUp,
  Bell,
  Brain,
};

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Features
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to ace your exams
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A complete study companion powered by artificial intelligence and
          learning science.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => {
          const Icon = iconMap[feature.icon] ?? Upload;
          return (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

