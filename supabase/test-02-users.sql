-- ============================================
-- TEST 2: Users & Authentication Verification
-- ============================================
-- Run this in Supabase SQL Editor to verify user data

-- Check seed data loaded correctly
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT university_id) as universities_represented,
  COUNT(CASE WHEN has_completed_onboarding THEN 1 END) as completed_onboarding,
  COUNT(CASE WHEN university_id IS NULL THEN 1 END) as users_without_university
FROM users;

-- Expected: At least 6 seed users + any real users

-- Verify user stats are auto-created for all users
SELECT 
  u.ocid, 
  u.display_name, 
  u.has_completed_onboarding,
  us.points, 
  us.level, 
  us.streak_days,
  CASE WHEN us.user_id IS NULL THEN '❌ Missing stats' ELSE '✓ Stats exist' END as stats_status
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Expected: All users should have user_stats row (auto-created by trigger)

-- Check test university assignment
SELECT 
  u.id, 
  u.ocid, 
  u.display_name,
  uni.name as university_name,
  uni.issuer_did,
  u.university_id,
  CASE 
    WHEN u.university_id IS NULL THEN '⚠️ No university'
    WHEN uni.issuer_did = 'did:oc:university:test' THEN '✓ Test university'
    ELSE '✓ Other university'
  END as university_status
FROM users u
LEFT JOIN universities uni ON u.university_id = uni.id
ORDER BY u.created_at DESC;

-- Expected: Most users should be in test university for testing

-- Check universities table
SELECT 
  id,
  name,
  issuer_did,
  domain,
  CASE 
    WHEN issuer_did = 'did:oc:university:test' THEN '✓ Test university'
    ELSE '✓ Real university'
  END as type
FROM universities
ORDER BY name;

-- Expected: Test university + seeded universities
