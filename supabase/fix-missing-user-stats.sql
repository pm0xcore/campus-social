-- ============================================
-- FIX: Create missing user_stats records
-- ============================================
-- Run this in Supabase SQL Editor to fix users without stats

-- First, let's see which users are missing stats
SELECT 
  u.id,
  u.ocid,
  u.display_name,
  u.university_id,
  'Missing user_stats' as issue
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- Create user_stats for users that don't have them
INSERT INTO user_stats (user_id, university_id, points, level, streak_days, last_active_date)
SELECT 
  u.id,
  u.university_id,
  0 as points,
  1 as level,
  0 as streak_days,
  CURRENT_DATE as last_active_date
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE us.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verify all users now have stats
SELECT 
  'Users without stats after fix: ' || COUNT(*)::TEXT as result
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- Expected: 0 users without stats

-- Show the newly created stats
SELECT 
  u.ocid,
  u.display_name,
  us.points,
  us.level,
  us.streak_days,
  'Stats created' as status
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE u.ocid IN ('testtest.edu', 'simonl.edu')
ORDER BY u.ocid;
