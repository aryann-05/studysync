"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { APP_NAME } from "@/lib/constants";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Brand panel - hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </span>
          {APP_NAME}
        </Link>

        <div className="animate-fade-in-up">
          <h1 className="max-w-md text-4xl font-bold leading-tight">
            Study smarter, not harder.
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Upload your syllabus and get a personalized adaptive study plan
            powered by spaced repetition.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "AI-powered syllabus parsing",
              "Adaptive spaced repetition scheduling",
              "Confidence-based study adjustments",
              "Progress tracking & smart reminders",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            {APP_NAME}
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-md animate-fade-in-up">{children}</div>
        </div>
      </div>
    </div>
  );
}

