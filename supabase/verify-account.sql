-- Quick verification script to check your account status
-- Run this in Supabase SQL Editor

-- 1. Check if your user exists and has university assigned
-- Replace 'your.ocid' with your actual OCID
SELECT 
  id,
  ocid,
  display_name,
  university_id,
  has_completed_onboarding,
  created_at,
  last_seen_at
FROM users 
WHERE ocid = 'YOUR_OCID_HERE'  -- <-- Replace with your OCID (e.g., 'simon.eth' or 'prince.eth')
;

-- 2. Check what university you're assigned to
SELECT 
  u.ocid,
  u.display_name,
  univ.name as university_name,
  univ.issuer_did
FROM users u
LEFT JOIN universities univ ON u.university_id = univ.id
WHERE u.ocid = 'YOUR_OCID_HERE'  -- <-- Replace with your OCID
;

-- 3. Check if you have user_stats initialized
SELECT 
  us.points,
  us.level,
  us.streak_days,
  us.friends_count,
  us.posts_count
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE u.ocid = 'YOUR_OCID_HERE'  -- <-- Replace with your OCID
;

-- 4. See ALL users in the test university (should include you + 6 seeded users)
SELECT 
  u.ocid,
  u.display_name,
  us.points,
  us.level,
  u.created_at
FROM users u
LEFT JOIN user_stats us ON us.user_id = u.id
WHERE u.university_id = '00000000-0000-0000-0000-000000000001'
ORDER BY us.points DESC NULLS LAST;
