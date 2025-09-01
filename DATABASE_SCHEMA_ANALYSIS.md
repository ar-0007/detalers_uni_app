# Complete Database Schema Analysis

Based on the frontend API interfaces and endpoints, here's the comprehensive database schema for the Detailers University application:

## 📊 Core Database Tables

### 1. **Users Table**
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'ADMIN', 'INSTRUCTOR')),
    is_active BOOLEAN DEFAULT true,
    password_hash VARCHAR(255), -- Missing from frontend interface
    phone VARCHAR(20), -- Referenced in userProfile
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **Categories Table**
```sql
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **Courses Table**
```sql
CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category_id UUID REFERENCES categories(category_id),
    instructor_id UUID REFERENCES users(user_id),
    duration_hours INTEGER,
    level VARCHAR(20) CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    is_published BOOLEAN DEFAULT false,
    thumbnail_url VARCHAR(500),
    intro_video_url VARCHAR(500),
    video_series VARCHAR(255),
    video_part INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **Video Series Table**
```sql
CREATE TABLE video_series (
    series_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    duration VARCHAR(20),
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. **Chapters Table** (Missing - Referenced in Quiz/Assignment)
```sql
CREATE TABLE chapters (
    chapter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. **Enrollments Table**
```sql
CREATE TABLE enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    requested_at TIMESTAMP DEFAULT NOW(),
    enrolled_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);
```

### 7. **Progress Table**
```sql
CREATE TABLE progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id, chapter_id)
);
```

### 8. **Video Progress Table**
```sql
CREATE TABLE video_progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(chapter_id),
    video_url VARCHAR(500) NOT NULL,
    current_time INTEGER DEFAULT 0, -- in seconds
    total_duration INTEGER NOT NULL, -- in seconds
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id, video_url)
);
```

### 9. **Quizzes Table**
```sql
CREATE TABLE quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions_data JSONB NOT NULL, -- Store quiz questions as JSON
    max_attempts INTEGER DEFAULT 3,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 10. **Quiz Attempts Table**
```sql
CREATE TABLE quiz_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    answers_data JSONB NOT NULL, -- Store user answers as JSON
    score INTEGER,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 11. **Assignments Table**
```sql
CREATE TABLE assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_file_url VARCHAR(500),
    max_score INTEGER DEFAULT 100,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 12. **Submissions Table**
```sql
CREATE TABLE submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    submission_file_url VARCHAR(500),
    submission_text TEXT,
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    graded_at TIMESTAMP,
    graded_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 13. **Podcasts Table**
```sql
CREATE TABLE podcasts (
    podcast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration VARCHAR(20),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 14. **Podcast Likes Table** (Missing)
```sql
CREATE TABLE podcast_likes (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    podcast_id UUID REFERENCES podcasts(podcast_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(podcast_id, user_id)
);
```

### 15. **Instructors Table**
```sql
CREATE TABLE instructors (
    instructor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- CRITICAL: This was NULL causing booking failures
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    bio TEXT,
    specialization VARCHAR(255),
    experience_years INTEGER,
    education TEXT,
    certifications TEXT[], -- Array of certifications
    hourly_rate DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 16. **Mentorship Slots Table**
```sql
CREATE TABLE mentorship_slots (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES instructors(instructor_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(instructor_id, date, start_time)
);
```

### 17. **Mentorship Bookings Table**
```sql
CREATE TABLE mentorship_bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES mentorship_slots(slot_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id), -- NULL for guest bookings
    instructor_id UUID REFERENCES instructors(instructor_id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')),
    meeting_link VARCHAR(500),
    message TEXT,
    preferred_topics TEXT[],
    session_duration INTEGER DEFAULT 1, -- in hours
    is_free_subscription_benefit BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 18. **Subscription Plans Table** (Missing)
```sql
CREATE TABLE subscription_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('MONTHLY', '3_MONTH', 'YEARLY')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 19. **Subscription Plan Benefits Table** (Missing)
```sql
CREATE TABLE subscription_plan_benefits (
    benefit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES subscription_plans(plan_id) ON DELETE CASCADE,
    benefit_type VARCHAR(50) NOT NULL, -- 'FREE_MENTORSHIP_SESSIONS', 'COURSE_ACCESS', 'PRIORITY_SUPPORT'
    benefit_value INTEGER NOT NULL, -- Number of free sessions,