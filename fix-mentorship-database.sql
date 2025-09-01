-- Mentorship Booking Database Fixes
-- Run these SQL commands on your database to fix the mentorship booking issues

-- ============================================================================
-- Fix 1: Create user accounts for instructors (if they don't exist)
-- ============================================================================

-- First, check if instructor users exist
SELECT i.instructor_id, i.first_name, i.last_name, i.email, i.user_id, u.user_id as existing_user_id
FROM instructors i
LEFT JOIN users u ON u.email = i.email
WHERE i.user_id IS NULL;

-- Create user accounts for instructors who don't have them
INSERT INTO users (user_id, email, first_name, last_name, role, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    i.email,
    i.first_name,
    i.last_name,
    'INSTRUCTOR',
    true,
    NOW(),
    NOW()
FROM instructors i
LEFT JOIN users u ON u.email = i.email
WHERE i.user_id IS NULL AND u.user_id IS NULL;

-- Update instructors table to link with user accounts
UPDATE instructors 
SET user_id = u.user_id,
    updated_at = NOW()
FROM users u 
WHERE instructors.email = u.email 
AND instructors.user_id IS NULL;

-- ============================================================================
-- Fix 2: Create mentorship slots for the next 30 days
-- ============================================================================

-- First, get the instructor ID (replace with actual instructor_id if different)
DO $$
DECLARE
    instructor_uuid UUID;
BEGIN
    -- Get the first active instructor
    SELECT instructor_id INTO instructor_uuid 
    FROM instructors 
    WHERE is_active = true 
    LIMIT 1;
    
    -- Create slots for the next 4 weeks (Monday to Friday, 9 AM to 5 PM)
    FOR week_offset IN 0..3 LOOP
        FOR day_offset IN 1..5 LOOP -- Monday to Friday
            FOR hour_slot IN 9..16 LOOP -- 9 AM to 4 PM (last slot starts at 4 PM)
                INSERT INTO mentorship_slots (
                    slot_id,
                    instructor_id,
                    date,
                    start_time,
                    end_time,
                    is_available,
                    price,
                    created_at,
                    updated_at
                ) VALUES (
                    gen_random_uuid(),
                    instructor_uuid,
                    CURRENT_DATE + (week_offset * 7 + day_offset),
                    (hour_slot || ':00')::TIME,
                    ((hour_slot + 1) || ':00')::TIME,
                    true,
                    70.00,
                    NOW(),
                    NOW()
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- Fix 3: Ensure subscription plans have mentorship benefits
-- ============================================================================

-- Check existing subscription plans
SELECT plan_id, name, price, billing_cycle FROM subscription_plans;

-- Add mentorship benefits to existing plans (adjust plan_ids as needed)
-- Premium plans get 1 free session per month
INSERT INTO subscription_plan_benefits (benefit_id, plan_id, benefit_type, benefit_value, reset_period, created_at)
SELECT 
    gen_random_uuid(),
    plan_id,
    'FREE_MENTORSHIP_SESSIONS',
    1,
    'MONTHLY',
    NOW()
FROM subscription_plans 
WHERE name ILIKE '%premium%' OR name ILIKE '%pro%'
ON CONFLICT (plan_id, benefit_type) DO NOTHING;

-- Basic plans get 0 free sessions (for clarity)
INSERT INTO subscription_plan_benefits (benefit_id, plan_id, benefit_type, benefit_value, reset_period, created_at)
SELECT 
    gen_random_uuid(),
    plan_id,
    'FREE_MENTORSHIP_SESSIONS',
    0,
    'MONTHLY',
    NOW()
FROM subscription_plans 
WHERE name ILIKE '%basic%' OR name ILIKE '%starter%'
ON CONFLICT (plan_id, benefit_type) DO NOTHING;

-- ============================================================================
-- Fix 4: Create sample test data for development
-- ============================================================================

-- Create a test user with active subscription (for testing)
INSERT INTO users (user_id, email, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'testuser@example.com',
    'Test',
    'User',
    'STUDENT',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create an active subscription for the test user
INSERT INTO user_subscriptions (subscription_id, user_id, plan_id, status, start_date, end_date, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    u.user_id,
    sp.plan_id,
    'ACTIVE',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    NOW(),
    NOW()
FROM users u, subscription_plans sp
WHERE u.email = 'testuser@example.com'
AND sp.name ILIKE '%premium%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check if instructors now have user_id
SELECT 
    i.instructor_id,
    i.first_name,
    i.last_name,
    i.email,
    i.user_id,
    CASE WHEN i.user_id IS NOT NULL THEN '✅ Fixed' ELSE '❌ Still NULL' END as status
FROM instructors i;

-- Check available mentorship slots
SELECT 
    COUNT(*) as total_slots,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_slots,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM mentorship_slots;

-- Check subscription benefits
SELECT 
    sp.name as plan_name,
    spb.benefit_type,
    spb.benefit_value,
    spb.reset_period
FROM subscription_plans sp
JOIN subscription_plan_benefits spb ON sp.plan_id = spb.plan_id
WHERE spb.benefit_type = 'FREE_MENTORSHIP_SESSIONS';

-- Check test user subscription
SELECT 
    u.email,
    sp.name as plan_name,
    us.status,
    us.start_date,
    us.end_date
FROM users u
JOIN user_subscriptions us ON u.user_id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.plan_id
WHERE u.email = 'testuser@example.com';

COMMIT;