-- ============================================
-- TEST 5: Gamification System Verification
-- ============================================
-- Run this in Supabase SQL Editor to verify gamification data

-- Check achievements seeded correctly
SELECT 
  type, 
  COUNT(*) as count,
  SUM(points) as total_points_available
FROM achievements 
GROUP BY type 
ORDER BY 
  CASE type 
    WHEN 'bronze' THEN 1 
    WHEN 'silver' THEN 2 
    WHEN 'gold' THEN 3 
    WHEN 'diamond' THEN 4 
  END;

-- Expected: Mix of bronze/silver/gold/diamond achievements

-- List all achievements
SELECT 
  name,
  type,
  points,
  trigger_type,
  trigger_threshold,
  icon
FROM achievements
ORDER BY 
  CASE type 
    WHEN 'bronze' THEN 1 
    WHEN 'silver' THEN 2 
    WHEN 'gold' THEN 3 
    WHEN 'diamond' THEN 4 
  END,
  trigger_threshold;

-- Expected: 14 achievements from seed

-- Verify user achievements are being awarded
SELECT 
  u.ocid,
  u.display_name,
  a.name as achievement,
  a.type,
  a.points,
  ua.earned_at,
  '✓ Awarded' as status
FROM user_achievements ua
JOIN users u ON ua.user_id = u.id
JOIN achievements a ON ua.achievement_id = a.id
ORDER BY ua.earned_at DESC
LIMIT 15;

-- Expected: Seed users should have some achievements

-- Check daily challenges for today
SELECT 
  id,
  challenge_type,
  description,
  points,
  date,
  CASE 
    WHEN date = CURRENT_DATE THEN '✓ Today'
    WHEN date < CURRENT_DATE THEN '⚠️ Past'
    ELSE '⚠️ Future'
  END as status
FROM daily_challenges 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;

-- Expected: Should have challenges for today from seed.sql

-- User challenge completion status
SELECT 
  u.ocid,
  dc.challenge_type,
  dc.description,
  ucp.completed,
  ucp.completed_at,
  CASE 
    WHEN ucp.completed THEN '✓ Completed'
    ELSE '○ In progress'
  END as status
FROM daily_challenges dc
LEFT JOIN user_challenge_progress ucp ON dc.id = ucp.challenge_id
LEFT JOIN users u ON ucp.user_id = u.id
WHERE dc.date = CURRENT_DATE
ORDER BY u.ocid, dc.challenge_type;

-- Expected: Some seed users have completed today's challenges

-- Leaderboard data integrity (test university)
SELECT 
  ROW_NUMBER() OVER (ORDER BY us.points DESC) as rank,
  u.ocid,
  u.display_name,
  us.points,
  us.level,
  us.streak_days,
  us.friends_count,
  us.posts_count
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.university_id = '00000000-0000-0000-0000-000000000001'
ORDER BY us.points DESC
LIMIT 10;

-- Expected: Top users from seed.sql with points/levels

-- User stats summary
SELECT 
  COUNT(*) as total_users,
  SUM(points) as total_points,
  AVG(points)::INT as avg_points,
  MAX(points) as max_points,
  AVG(level)::NUMERIC(10,1) as avg_level,
  MAX(level) as max_level,
  SUM(friends_count) as total_friendships,
  SUM(posts_count) as total_posts
FROM user_stats;

-- Expected: Stats should reflect seed data + any real user activity
