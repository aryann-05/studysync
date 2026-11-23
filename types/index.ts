export interface User {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "user";
  status?: "active" | "inactive";
  accountType?: "student" | "regular";
  avatar?: string;
  examDate?: string;
  studyHoursPerDay: number;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  reminderTime: string;
  createdAt: Date;
}

export interface AdminUser {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "super_admin" | "admin" | "moderator" | "user";
  status: "active" | "inactive" | "suspended";
  account_type: "student" | "regular";
  academic_qualification?: string;
  university_college?: string;
  course_name?: string;
  specialization?: string;
  current_semester_year?: string;
  academic_interests?: string[];
  study_categories?: string[];
  daily_max_hours?: number;
  last_login_at?: string | null;
  last_active_at?: string | null;
  created_at: string;
}

export interface AdminDashboardStats {
  total_users: number;
  total_students: number;
  total_regular_users: number;
  active_users: number;
  inactive_users: number;
  suspended_users?: number;
  total_admins: number;
  total_moderators?: number;
  dau?: number;
  wau?: number;
  mau?: number;
  new_registrations: { daily: number; weekly: number; monthly: number } | any;
  total_uploads?: number;
  total_upload_bytes?: number;
  total_quizzes?: number;
  total_quiz_attempts?: number;
  completed_quizzes?: number;
  incomplete_quizzes?: number;
  avg_quiz_score?: number;
  highest_quiz_score?: number;
  lowest_quiz_score?: number;
  quiz_pass_percentage?: number;
  total_study_hours?: number;
  recent_registrations: AdminUser[];
  growth_trend?: { date: string; users: number; active: number }[];
  engagement_trend?: { day: string; sessions: number; tests: number }[];
  popular_categories?: { name: string; count: number }[];
  most_active_users?: {
    user_id: string;
    full_name: string;
    email: string;
    course_name?: string;
    specialization?: string;
    study_hours?: number;
    last_active_at?: string;
  }[];
}

export interface AdminUsersPagination {
  total_users: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: AdminUsersPagination;
}

export interface AcademicCategoryItem {
  category_name: string;
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users: number;
  total_uploads: number;
  total_tests_attempted: number;
  average_test_score: number;
  most_active_users: { user_id: string; full_name: string; email: string }[];
  user_count_for_chart?: number;
}

export interface CategoriesAnalyticsResponse {
  categories: AcademicCategoryItem[];
  comparison: { name: string; users: number; tests: number; avg_score: number; uploads: number }[];
}

export interface CategoryUsersResponse {
  category_name: string;
  total_users: number;
  users: AdminUser[];
  pagination: { page: number; limit: number; total_pages: number };
}

export interface ActivityLogItem {
  activity_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface ActivityAnalyticsResponse {
  activities: ActivityLogItem[];
  activity_distribution: { type: string; count: number }[];
  pagination: { total: number; page: number; limit: number; total_pages: number };
}

export interface TestAttemptItem {
  attempt_id: string;
  quiz_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  test_name: string;
  subject: string;
  academic_category: string;
  test_start_time: string;
  test_completion_time: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unattempted_questions: number;
  obtained_marks: number;
  total_marks: number;
  percentage: number;
  time_taken_minutes: number;
  attempt_status: string;
  grade: string;
  feedback?: string;
}

export interface TestAnalyticsResponse {
  metrics: {
    total_available_tests: number;
    total_attempts: number;
    completed_tests: number;
    incomplete_tests: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    average_completion_time_minutes: number;
    pass_percentage: number;
    failed_attempts: number;
  };
  attempts: TestAttemptItem[];
  pagination: { total: number; page: number; limit: number; total_pages: number };
}

export interface LearningAnalyticsResponse {
  overview: {
    total_study_hours: number;
    total_sessions_created: number;
    completed_sessions: number;
    average_completion_rate: number;
    active_study_plans: number;
    peak_study_hours: string;
    drop_off_point: string;
  };
  weekly_pattern: { day: string; hours: number }[];
  subjects_studied: { subject: string; hours: number; completion: number }[];
}

export interface EngagementAnalyticsResponse {
  metrics: {
    retention_7_day: number;
    retention_30_day: number;
    returning_users_percentage: number;
    new_users_percentage: number;
    daily_active_ratio: number;
  };
  most_active_users: {
    user_id: string;
    full_name: string;
    email: string;
    course_name: string;
    last_active_at: string;
    engagement_score: number;
  }[];
  at_risk_users: {
    user_id: string;
    full_name: string;
    email: string;
    course_name: string;
    last_active_at: string;
    status: string;
    risk_level: string;
  }[];
  feature_usage: { feature: string; usage_count: number; percentage: number }[];
}

export interface AdminNotificationItem {
  notification_id: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: AdminNotificationItem[];
  unread_count: number;
}

export interface AuditLogItem {
  audit_id: string;
  admin_user_id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  target_resource: string;
  target_id: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface AuditLogsResponse {
  logs: AuditLogItem[];
  pagination: { total: number; page: number; limit: number; total_pages: number };
}

export interface UserDetailedProfile {
  user: AdminUser;
  learning_stats: {
    total_study_hours: number;
    total_sessions: number;
    completed_sessions: number;
    completion_rate: number;
    plans_count: number;
    uploads_count: number;
  };
  test_performance: {
    total_attempts: number;
    average_score: number;
    highest_score: number;
    passed_count: number;
    pass_rate: number;
    weak_topics: { title: string; priority: string; recommendation: string }[];
  };
  study_plans: {
    plan_id: string;
    course_name: string;
    start_date: string;
    exam_date: string;
    is_active: boolean;
    created_at: string;
  }[];
  study_sessions: {
    session_id: string;
    topic_id: string;
    scheduled_date: string;
    duration_hours: number;
    session_type: string;
    is_completed: boolean;
    confidence_score?: number | null;
    completed_at?: string | null;
  }[];
  quiz_attempts: {
    attempt_id: string;
    quiz_id: string;
    module_name?: string;
    score: number;
    total_marks: number;
    percentage: number;
    grade: string;
    feedback?: string;
    completed_at: string;
  }[];
  uploads: {
    upload_id: string;
    original_name: string;
    mime_type: string;
    size: number;
    document_type: string;
    subject?: string;
    academic_category?: string;
    moderation_status?: string;
    uploaded_at: string;
  }[];
  activities: {
    activity_id: string;
    activity_type: string;
    description: string;
    metadata?: Record<string, any>;
    created_at: string;
  }[];
  login_history: {
    timestamp: string;
    ip_address: string;
    user_agent: string;
  }[];
  ai_feature_usage: {
    total_invocations: number;
    syllabus_extractions: number;
    plans_generated: number;
    recent_actions: any[];
  };
}

export interface AdminUserDetailResponse {
  user: AdminUser;
  stats: {
    study_plans_count: number;
    study_sessions_count: number;
    quizzes_attempted_count: number;
  };
  learning_stats?: UserDetailedProfile["learning_stats"];
  test_performance?: UserDetailedProfile["test_performance"];
  study_plans?: UserDetailedProfile["study_plans"];
  study_sessions?: UserDetailedProfile["study_sessions"];
  quiz_attempts?: UserDetailedProfile["quiz_attempts"];
  uploads?: UserDetailedProfile["uploads"];
  activities?: UserDetailedProfile["activities"];
  login_history?: UserDetailedProfile["login_history"];
  ai_feature_usage?: UserDetailedProfile["ai_feature_usage"];
}

export interface AdminUploadItem {
  upload_id: string;
  original_name: string;
  stored_name?: string;
  mime_type: string;
  size: number;
  document_type: string;
  subject?: string;
  academic_category?: string;
  moderation_status?: "approved" | "pending" | "flagged" | "rejected" | string;
  processing_status?: "processed" | "pending" | "failed" | string;
  uploaded_at: string;
  extracted_topics_count?: number;
  user: {
    user_id: string;
    full_name: string;
    email: string;
    role?: string;
    account_type?: string;
    status?: string;
    course_name?: string;
    specialization?: string;
  };
}

export interface AdminUploadsStats {
  total_uploads: number;
  total_size_bytes: number;
  pdf_count: number;
  docx_txt_count: number;
  unique_users_count: number;
}

export interface AdminUploadsPagination {
  total_uploads: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface AdminUploadsResponse {
  uploads: AdminUploadItem[];
  stats: AdminUploadsStats;
  pagination: AdminUploadsPagination;
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
  description?: string;
  contentCovered?: string[];
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
  role?: "admin" | "user";
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "admin" | "user";
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

export interface QuizQuestion {
  question_id: string;
  topic_id?: string | null;
  topic_title: string;
  question_text: string;
  options: string[];
  marks?: number;
  correct_index?: number;
  explanation?: string;
  selected_index?: number;
  is_correct?: boolean;
}

export interface WeakTopicFocus {
  topic_title: string;
  topic_id?: string | null;
  total_questions?: number;
  correct_count?: number;
  mistakes: number;
  accuracy_percent: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
  attempts_count?: number;
  lowest_accuracy?: number;
}

export interface QuizAttemptRecord {
  attempt_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade: "Mastered" | "Needs Revision" | "Critical Focus Required";
  feedback: string;
  weak_topics: WeakTopicFocus[];
  completed_at: string;
}

export interface Quiz {
  quiz_id: string;
  plan_id: string;
  module_name: string;
  quiz_number: number;
  title: string;
  description: string;
  scheduled_date: string;
  total_marks: number;
  question_count?: number;
  questions?: QuizQuestion[];
  is_completed?: boolean;
  latest_attempt?: QuizAttemptRecord | null;
}

export interface QuizSubmissionResult {
  attempt: QuizAttemptRecord;
  quiz_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade: string;
  weak_topics: WeakTopicFocus[];
  feedback: string;
  questions: QuizQuestion[];
}

