export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  examDate?: string;
  studyHoursPerDay: number;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  reminderTime: string;
  createdAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  status: "new" | "studying" | "revised" | "completed" | "missed";
  confidence: "high" | "medium" | "low";
  estimatedMinutes: number;
  actualMinutes: number;
  dueDate: string;
  completedDate?: string;
  color?: string;
  notes?: string;
}

export interface StudySession {
  id: string;
  topicId: string;
  topicName: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  confidence: "high" | "medium" | "low";
  completed: boolean;
  notes?: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  examDate: string;
  topics: Topic[];
  sessions: StudySession[];
  weeklyGoal: number;
}

export interface ActivityItem {
  id: string;
  type: "session" | "topic" | "revision" | "achievement" | "reminder";
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  color?: string;
}

export interface Notification {
  id: string;
  type: "reminder" | "revision" | "missed" | "exam" | "achievement";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface WeeklyHours {
  day: string;
  hours: number;
  target: number;
}

export interface ConfidenceDataPoint {
  date: string;
  score: number;
}

export interface ProgressData {
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  completionPercent: number;
  studyStreak: number;
  masteryScore: number;
}

export interface ChartData {
  weeklyHours: WeeklyHours[];
  confidenceTrend: ConfidenceDataPoint[];
  progress: ProgressData;
  topicDistribution: { name: string; value: number; color: string }[];
  subjectHours: { subject: string; hours: number; color: string }[];
  monthlyActivity: { month: string; sessions: number; hours: number }[];
}

export interface CalendarDay {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  topics: Topic[];
  status: "new" | "revision" | "completed" | "missed" | "none";
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress: number;
  uploadedAt: Date;
}

export interface ExtractedTopics {
  fileId: string;
  fileName: string;
  topics: Topic[];
  totalEstimatedHours: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface StudyState {
  topics: Topic[];
  sessions: StudySession[];
  currentSession: StudySession | null;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsData {
  theme: "light" | "dark" | "system";
  reminderTime: string;
  studyHoursPerDay: number;
  emailNotifications: boolean;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

