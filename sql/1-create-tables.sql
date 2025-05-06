-- Enable the uuid-ossp extension if it's not already enabled (for generating UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the 'users' table
CREATE TABLE users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Foreign key to auth.users
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT,
    pfp_url TEXT,
    approved BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'badges' table
CREATE TABLE badges (
    badge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key to users
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    xp_threshold INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN
);

-- Create the 'user_badges' table (junction table for users and badges)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_id UUID REFERENCES badges(badge_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'bans' table
CREATE TABLE bans (
    ban_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key to users
    admin_id UUID REFERENCES users(user_id) ON DELETE CASCADE,   -- Foreign key to users
    reason TEXT,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'user_streaks' table
CREATE TABLE user_streaks (
    user_streaks_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key to users, UNIQUE constraint
    current_streak INTEGER DEFAULT 0,
    streak_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    longest_streak INTEGER DEFAULT 0
);

-- Create the 'user_xp' table
CREATE TABLE user_xp (
    user_xp_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key to users
    total_xp INTEGER DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'xp_transactions' table
CREATE TABLE xp_transactions (
    xp_transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key to users
    xp_amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'quizzes' table
CREATE TABLE quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key to users
    name TEXT NOT NULL,
    description TEXT,
    public_visibility BOOLEAN,
    join_code TEXT,
    quiz_cover_url TEXT,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the 'questions' table
CREATE TABLE questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE, -- Foreign key to quizzes
    question_type TEXT NOT NULL,
    question_text TEXT NOT NULL,
    image_urls TEXT[],
    video_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN
);

-- Create the 'question_options' table
CREATE TABLE question_options (
    option_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(question_id) ON DELETE CASCADE, -- Foreign key to questions
    option_text TEXT NOT NULL,
    option_url TEXT,
    is_correct BOOLEAN,
    pos_x INTEGER,
    pos_y INTEGER,
    is_active BOOLEAN
);

-- Create the 'question_matches' table
CREATE TABLE question_matches (
    question_id UUID PRIMARY KEY REFERENCES questions(question_id) ON DELETE CASCADE, -- Foreign key to questions
    source_option_id UUID REFERENCES question_options(option_id) ON DELETE CASCADE, -- Foreign key to question_options
    target_option_id UUID REFERENCES question_options(option_id) ON DELETE CASCADE  -- Foreign key to question_options
);

-- Create the 'quiz_attempts' table
CREATE TABLE quiz_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,   -- Foreign Key to quizzes
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,      -- Foreign Key to users
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    correct_questions INTEGER,
    total_questions INTEGER,
    difficulty_rating INTEGER
);

-- Create the 'question_attempts' table
CREATE TABLE question_attempts(
    question_attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE, -- Foreign Key to quiz_attempts
    question_id UUID REFERENCES questions(question_id) ON DELETE CASCADE,  -- Foreign Key to questions
    selected_option_id UUID REFERENCES question_options(option_id) ON DELETE CASCADE, -- Foreign Key to question_options
    correct_option_id  UUID REFERENCES question_options(option_id) ON DELETE CASCADE,
    is_correct BOOLEAN,
    mistake_count INTEGER
);
