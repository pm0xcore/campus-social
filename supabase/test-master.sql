-- ============================================
-- MASTER TEST SCRIPT - Run All Verifications
-- ============================================
-- Copy/paste this entire file into Supabase SQL Editor
-- to run all tests at once

\echo '=========================================='
\echo 'Campus Social - Database Verification Tests'
\echo 'Date: 2026-02-10'
\echo '=========================================='
\echo ''

-- ============================================
-- TEST 1: Schema Verification
-- ============================================
\echo '1. SCHEMA VERIFICATION'
\echo '----------------------'

SELECT 'Total Tables: ' || COUNT(*)::TEXT as result
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT table_name as "Tables Present"
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

\echo ''

-- ============================================
-- TEST 2: Users & Authentication
-- ============================================
\echo '2. USERS & AUTHENTICATION'
\echo '-------------------------'

SELECT 
  'Total Users: ' || COUNT(*)::TEXT ||
  ' | With University: ' || COUNT(university_id)::TEXT ||
  ' | Completed Onboarding: ' || COUNT(CASE WHEN has_completed_onboarding THEN 1 END)::TEXT as "User Summary"
FROM users;

SELECT 
  ocid, 
  display_name,
  LEFT(uni.name, 30) as university,
  CASE WHEN us.user_id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_stats
FROM users u
LEFT JOIN universities uni ON u.university_id = uni.id
LEFT JOIN user_stats us ON u.id = us.user_id
ORDER BY u.created_at DESC
LIMIT 8;

\echo ''

-- ============================================
-- TEST 3: Friendships
-- ============================================
\echo '3. FRIENDSHIPS'
\echo '--------------'

SELECT 
  'Total: ' || COUNT(*)::TEXT ||
  ' | Accepted: ' || COUNT(CASE WHEN status = 'accepted' THEN 1 END)::TEXT ||
  ' | Pending: ' || COUNT(CASE WHEN status = 'pending' THEN 1 END)::TEXT as "Friendship Summary"
FROM friendships;

SELECT 
  u1.ocid as requester,
  u2.ocid as addressee,
  f.status,
  TO_CHAR(f.created_at, 'MM-DD HH24:MI') as created
FROM friendships f
JOIN users u1 ON f.requester_id = u1.id
JOIN users u2 ON f.addressee_id = u2.id
ORDER BY f.created_at DESC
LIMIT 5;

\echo ''

-- ============================================
-- TEST 4: Posts & Reactions
-- ============================================
\echo '4. POSTS & REACTIONS'
\echo '--------------------'

SELECT 
  'Total Posts: ' || COUNT(*)::TEXT ||
  ' | With Reactions: ' || COUNT(DISTINCT r.post_id)::TEXT as "Posts Summary"
FROM posts p
LEFT JOIN reactions r ON p.id = r.post_id;

SELECT 
  u.ocid as author,
  p.type,
  LEFT(p.content, 40) as content,
  COUNT(r.user_id) as reactions
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN reactions r ON p.id = r.post_id
GROUP BY p.id, u.ocid, p.type, p.content
ORDER BY p.created_at DESC
LIMIT 5;

\echo ''

-- ============================================
-- TEST 5: Gamification
-- ============================================
\echo '5. GAMIFICATION SYSTEM'
\echo '----------------------'

SELECT 
  'Achievements: ' || COUNT(*)::TEXT ||
  ' | User Achievements: ' || (SELECT COUNT(*)::TEXT FROM user_achievements) ||
  ' | Daily Challenges Today: ' || (SELECT COUNT(*)::TEXT FROM daily_challenges WHERE date = CURRENT_DATE) as "Gamification Summary"
FROM achievements;

SELECT 
  ROW_NUMBER() OVER (ORDER BY us.points DESC) as rank,
  u.ocid,
  us.points,
  us.level,
  us.streak_days as streak
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.university_id = '00000000-0000-0000-0000-000000000001'
ORDER BY us.points DESC
LIMIT 6;

\echo ''

-- ============================================
-- TEST 6: Notifications
-- ============================================
\echo '6. NOTIFICATIONS'
\echo '----------------'

SELECT 
  'Total: ' || COUNT(*)::TEXT ||
  ' | Unread: ' || COUNT(CASE WHEN NOT read THEN 1 END)::TEXT as "Notification Summary"
FROM notifications;

SELECT 
  type,
  COUNT(*) as count,
  COUNT(CASE WHEN NOT read THEN 1 END) as unread
FROM notifications
GROUP BY type
ORDER BY count DESC;

\echo ''

-- ============================================
-- TEST 7: Groups
-- ============================================
\echo '7. GROUPS'
\echo '---------'

SELECT 
  'Total Groups: ' || COUNT(*)::TEXT ||
  ' | Total Members: ' || (SELECT COUNT(*)::TEXT FROM group_members) as "Groups Summary"
FROM groups;

\echo ''

-- ============================================
-- TEST 8: Data Integrity
-- ============================================
\echo '8. DATA INTEGRITY CHECKS'
\echo '------------------------'

-- Check for any critical issues
SELECT 'Duplicate OCIDs' as check_name, COUNT(*) as issues_found
FROM (
  SELECT ocid FROM users GROUP BY ocid HAVING COUNT(*) > 1
) dups
UNION ALL
SELECT 'Self-friendships', COUNT(*)
FROM friendships WHERE requester_id = addressee_id
UNION ALL
SELECT 'Orphaned posts', COUNT(*)
FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE u.id IS NULL
UNION ALL
SELECT 'Orphaned reactions', COUNT(*)
FROM reactions r 
LEFT JOIN posts p ON r.post_id = p.id 
LEFT JOIN users u ON r.user_id = u.id 
WHERE p.id IS NULL OR u.id IS NULL
UNION ALL
SELECT 'Users missing stats', COUNT(*)
FROM users u LEFT JOIN user_stats us ON u.id = us.user_id WHERE us.user_id IS NULL;

-- Expected: All should show 0 issues_found

\echo ''
\echo '=========================================='
\echo 'Tests Complete!'
\echo 'Review results above for any issues (❌ or count > 0)'
\echo '=========================================='
