"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Sparkles } from "lucide-react";
import { NAV_LINKS, SECONDARY_NAV, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useStudyContext } from "@/context/StudyContext";
import { calculateCompletionPercent } from "@/lib/helpers";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { topics } = useStudyContext();
  const completion = calculateCompletionPercent(topics);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex",
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin" aria-label="Sidebar">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Main
        </p>
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                )}
              />
              {link.label}
              {isActive(link.href) && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            General
          </p>
          {SECONDARY_NAV.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Exam countdown mini-card */}
      <div className="border-t p-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">Exam Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">{completion}%</span>
          </div>
          <Progress value={completion} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">
            {topics.filter((t) => t.status === "completed").length} of{" "}
            {topics.length} topics completed
          </p>
        </div>
      </div>
    </aside>
  );
}

