"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Navbar } from "@/components/navbar/navbar";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="hidden lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Navbar variant="dashboard" />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

