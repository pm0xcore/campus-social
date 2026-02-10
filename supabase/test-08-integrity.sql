-- ============================================
-- TEST 8: Data Integrity Checks
-- ============================================
-- Run this in Supabase SQL Editor to verify data integrity

-- Check for duplicate OCIDs (should be 0)
SELECT 
  ocid, 
  COUNT(*) as duplicate_count,
  '❌ Duplicate OCID found' as issue
FROM users
GROUP BY ocid
HAVING COUNT(*) > 1;

-- Expected: 0 rows (UNIQUE constraint prevents this)

-- Check for users without user_stats (should be 0)
SELECT 
  u.id,
  u.ocid,
  u.display_name,
  '❌ Missing user_stats record' as issue
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- Expected: 0 rows (trigger auto-creates stats)

-- Check for self-friendships (should be 0)
SELECT 
  f.id,
  u.ocid,
  f.status,
  '❌ User friended themselves' as issue
FROM friendships f
JOIN users u ON f.requester_id = u.id
WHERE f.requester_id = f.addressee_id;

-- Expected: 0 rows (application logic prevents this)

-- Check for duplicate friend requests (should be 0)
SELECT 
  requester_id, 
  addressee_id, 
  COUNT(*) as duplicate_count,
  '❌ Duplicate friendship record' as issue
FROM friendships
GROUP BY requester_id, addressee_id
HAVING COUNT(*) > 1;

-- Expected: 0 rows (UNIQUE constraint prevents this)

-- Verify all user_stats have valid university references
SELECT 
  us.user_id,
  u.ocid,
  us.university_id,
  '❌ Invalid university reference' as issue
FROM user_stats us
JOIN users u ON us.user_id = u.id
LEFT JOIN universities uni ON us.university_id = uni.id
WHERE us.university_id IS NOT NULL AND uni.id IS NULL;

-- Expected: 0 rows (foreign key constraint prevents this)

-- Check for accepted friendships missing accepted_at
SELECT 
  f.id,
  u1.ocid as requester,
  u2.ocid as addressee,
  f.status,
  f.accepted_at,
  '❌ Accepted friendship missing timestamp' as issue
FROM friendships f
JOIN users u1 ON f.requester_id = u1.id
JOIN users u2 ON f.addressee_id = u2.id
WHERE f.status = 'accepted' AND f.accepted_at IS NULL;

-- Expected: 0 rows (should always have timestamp)

-- Check for posts with invalid visibility
SELECT 
  p.id,
  u.ocid as author,
  p.visibility,
  '❌ Invalid visibility value' as issue
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.visibility NOT IN ('public', 'university', 'friends', 'group');

-- Expected: 0 rows (CHECK constraint prevents this)

-- Check for achievements without valid triggers
SELECT 
  id,
  name,
  trigger_type,
  trigger_threshold,
  '⚠️ Check trigger configuration' as warning
FROM achievements
WHERE trigger_threshold <= 0 OR trigger_threshold IS NULL;

-- Expected: 0 rows (all thresholds should be positive)

-- Summary: Overall data health
SELECT 
  'Users' as entity,
  COUNT(*) as count,
  '✓' as status
FROM users
UNION ALL
SELECT 
  'Friendships',
  COUNT(*),
  '✓'
FROM friendships
UNION ALL
SELECT 
  'Posts',
  COUNT(*),
  '✓'
FROM posts
UNION ALL
SELECT 
  'Reactions',
  COUNT(*),
  '✓'
FROM reactions
UNION ALL
SELECT 
  'User Stats',
  COUNT(*),
  '✓'
FROM user_stats
UNION ALL
SELECT 
  'Achievements',
  COUNT(*),
  '✓'
FROM achievements
UNION ALL
SELECT 
  'User Achievements',
  COUNT(*),
  '✓'
FROM user_achievements
UNION ALL
SELECT 
  'Daily Challenges',
  COUNT(*),
  '✓'
FROM daily_challenges
UNION ALL
SELECT 
  'Notifications',
  COUNT(*),
  '✓'
FROM notifications
UNION ALL
SELECT 
  'Groups',
  COUNT(*),
  '✓'
FROM groups
UNION ALL
SELECT 
  'Messages',
  COUNT(*),
  '✓'
FROM messages;
