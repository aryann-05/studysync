"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/shared/footer";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

