-- StudySync Database Schema
-- Target: PostgreSQL 15+
-- MCA Major Project

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    daily_max_hours NUMERIC(3,1) DEFAULT 4.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Study Plans Table
CREATE TABLE IF NOT EXISTS study_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    exam_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Topics Table (Hierarchical support via parent_topic_id)
CREATE TABLE IF NOT EXISTS topics (
    topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES study_plans(plan_id) ON DELETE CASCADE,
    parent_topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    estimated_hours NUMERIC(4,2) DEFAULT 1.00,
    difficulty_weight NUMERIC(3,2) DEFAULT 1.00,
    ease_factor NUMERIC(4,2) DEFAULT 2.50,
    repetition_number INT DEFAULT 0
);

-- 4. Study Sessions Table
CREATE TABLE IF NOT EXISTS study_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    duration_hours NUMERIC(3,1) NOT NULL,
    session_type VARCHAR(30) DEFAULT 'INITIAL',
    is_completed BOOLEAN DEFAULT FALSE,
    confidence_score INT CHECK (confidence_score BETWEEN 1 AND 5),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. FCM Tokens Table
CREATE TABLE IF NOT EXISTS fcm_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_plan_id ON topics(plan_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_topic_id ON topics(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_topic_id ON study_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_scheduled_date ON study_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);

