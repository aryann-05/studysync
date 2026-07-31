"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-8 text-center text-white sm:p-16">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Sparkles className="h-7 w-7" />
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Your exam is coming. Be ready.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Upload your syllabus today and get a personalized study plan
            in seconds. Free to start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button
                size="lg"
                variant="ghost"
                className="w-full border border-white/30 text-white hover:bg-white/10 sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                Upload Syllabus
              </Button>
            </Link>
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-white/70">
            <CalendarClock className="h-4 w-4" />
            No credit card required · Free forever plan
          </p>
        </div>
      </div>
    </section>
  );
}

