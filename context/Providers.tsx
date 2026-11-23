"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeContext";
import { AuthProvider } from "./AuthContext";
import { StudyProvider } from "./StudyContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudyProvider>{children}</StudyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

