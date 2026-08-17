"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // IMPORTANT:
  // Use the same initial values on server and client.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Read the saved theme only after the component mounts in the browser.
  useEffect(() => {
    const stored = localStorage.getItem("studysync_theme");

    if (
      stored === "light" ||
      stored === "dark" ||
      stored === "system"
    ) {
      setThemeState(stored);
    }

    setMounted(true);
  }, []);

  // Apply theme to the document.
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = getSystemTheme();

      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }

    localStorage.setItem("studysync_theme", theme);
  }, [theme, mounted]);

  // Listen for system theme changes.
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const next = e.matches ? "dark" : "light";

        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(next);

        setResolvedTheme(next);
      }
    };

    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [theme, mounted]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === "system") {
        return getSystemTheme() === "dark" ? "light" : "dark";
      }

      return prev === "dark" ? "light" : "dark";
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useThemeContext must be used within a ThemeProvider"
    );
  }

  return context;
}