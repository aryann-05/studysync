"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={
        resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      className="rounded-full"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}

