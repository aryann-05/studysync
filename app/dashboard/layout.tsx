"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

