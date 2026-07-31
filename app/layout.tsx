import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/context/Providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StudySync — Personalized Adaptive Study Plan Generator",
    template: "%s | StudySync",
  },
  description:
    "Upload your syllabus and get a personalized adaptive study plan powered by spaced repetition. Track progress, revise smarter, and ace your exams.",
  keywords: [
    "study planner",
    "spaced repetition",
    "exam preparation",
    "syllabus",
    "adaptive learning",
    "StudySync",
  ],
  authors: [{ name: "StudySync" }],
  openGraph: {
    title: "StudySync — Personalized Adaptive Study Plan Generator",
    description:
      "Upload your syllabus and get a personalized adaptive study plan powered by spaced repetition.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudySync — Personalized Adaptive Study Plan Generator",
    description:
      "Upload your syllabus and get a personalized adaptive study plan powered by spaced repetition.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}

