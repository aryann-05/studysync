import {
  LayoutDashboard,
  Upload,
  CalendarDays,
  BookOpen,
  BarChart3,
  TrendingUp,
  User,
  Settings,
  Bell,
  type LucideIcon,
} from "lucide-react";

export const APP_NAME = "StudySync";
export const APP_TAGLINE = "Personalized Adaptive Study Plan Generator";
export const APP_DESCRIPTION =
  "Upload your syllabus, get an optimized study plan, track progress, and ace your exams with spaced repetition.";

export const NAV_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Syllabus", href: "/upload", icon: Upload },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Study Session", href: "/study", icon: BookOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Progress", href: "/progress", icon: TrendingUp },
];

export const SECONDARY_NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export const BRAND_COLORS = {
  primary: "#2563EB",
  secondary: "#4F46E5",
  accent: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
};

export const TOPIC_COLORS = {
  new: "#3B82F6",
  revision: "#8B5CF6",
  completed: "#10B981",
  missed: "#EF4444",
};

export const CONFIDENCE_COLORS = {
  high: "#10B981",
  medium: "#F59E0B",
  low: "#EF4444",
};

export const CONFIDENCE_EMOJIS = {
  high: "😊",
  medium: "😐",
  low: "😟",
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const EXAM_DATE = "2025-08-15";
export const TOTAL_TOPICS = 48;
export const COMPLETED_TOPICS = 27;

export const FEATURES = [
  {
    title: "Smart Syllabus Parsing",
    description: "Upload PDF, DOCX, or TXT files. Our NLP engine automatically extracts topics and organizes them.",
    icon: "Upload",
  },
  {
    title: "Spaced Repetition",
    description: "Optimized study schedules based on spaced repetition for better long-term retention.",
    icon: "Repeat",
  },
  {
    title: "Adaptive Scheduling",
    description: "Plans adapt automatically based on your confidence levels and missed sessions.",
    icon: "RefreshCw",
  },
  {
    title: "Progress Tracking",
    description: "Detailed analytics, streaks, and mastery scores to keep you motivated.",
    icon: "TrendingUp",
  },
  {
    title: "Smart Reminders",
    description: "Get notified about upcoming sessions, revisions, and exam countdown.",
    icon: "Bell",
  },
  {
    title: "Confidence-Based Learning",
    description: "Rate your understanding after each session to personalize future study plans.",
    icon: "Brain",
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Upload Syllabus",
    description: "Upload your syllabus PDF, DOCX, or TXT file. StudySync automatically parses and extracts all topics.",
  },
  {
    step: 2,
    title: "Get Your Plan",
    description: "An optimized study schedule is generated using spaced repetition, tailored to your exam date.",
  },
  {
    step: 3,
    title: "Study & Track",
    description: "Follow the plan, complete sessions, and rate your confidence after each topic.",
  },
  {
    step: 4,
    title: "Adapt & Improve",
    description: "StudySync adapts future sessions based on your progress and confidence levels.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Medical Student",
    avatar: "SJ",
    content:
      "StudySync completely transformed my exam preparation. The spaced repetition algorithm helped me retain information much better than traditional methods.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Engineering Student",
    avatar: "MC",
    content:
      "I love how the app adapts to my learning pace. When I'm struggling with a topic, it automatically schedules more review sessions.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Law Student",
    avatar: "ER",
    content:
      "The analytics and progress tracking keep me motivated. Seeing my mastery score improve every week is incredibly satisfying.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Computer Science Student",
    avatar: "DP",
    content:
      "The calendar view is a game-changer. I can see exactly what I need to study each day and never miss a revision session.",
    rating: 4,
  },
];

