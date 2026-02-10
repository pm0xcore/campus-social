-- ============================================
-- TEST 3: Friendships Verification
-- ============================================
-- Run this in Supabase SQL Editor to verify friendship data

-- Check friendship statuses distribution
SELECT 
  status, 
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM friendships 
GROUP BY status
ORDER BY count DESC;

-- Expected: Mix of accepted/pending/declined

-- View accepted friendships with user details
SELECT 
  u1.ocid as requester,
  u2.ocid as addressee,
  f.status,
  f.created_at,
  f.accepted_at,
  CASE 
    WHEN f.status = 'accepted' AND f.accepted_at IS NULL THEN '❌ Missing accepted_at'
    WHEN f.status = 'pending' AND f.accepted_at IS NOT NULL THEN '❌ Invalid accepted_at'
    ELSE '✓ Valid'
  END as validation
FROM friendships f
JOIN users u1 ON f.requester_id = u1.id
JOIN users u2 ON f.addressee_id = u2.id
WHERE f.status = 'accepted'
ORDER BY f.accepted_at DESC NULLS LAST
LIMIT 10;

-- Expected: All accepted friendships should have accepted_at timestamp

-- Check for orphaned friendships (users don't exist)
SELECT 
  f.id, 
  f.requester_id, 
  f.addressee_id,
  f.status,
  '❌ Orphaned friendship - user(s) deleted' as issue
FROM friendships f
LEFT JOIN users u1 ON f.requester_id = u1.id
LEFT JOIN users u2 ON f.addressee_id = u2.id
WHERE u1.id IS NULL OR u2.id IS NULL;

-- Expected: 0 rows (no orphaned friendships)

-- Check for self-friendships (should be impossible)
SELECT 
  f.id,
  u.ocid,
  f.status,
  '❌ User friended themselves' as issue
FROM friendships f
JOIN users u ON f.requester_id = u.id
WHERE f.requester_id = f.addressee_id;

-- Expected: 0 rows (no self-friendships)

-- Check for duplicate friend requests
SELECT 
  u1.ocid as requester,
  u2.ocid as addressee,
  COUNT(*) as duplicate_count,
  '❌ Duplicate friendship record' as issue
FROM friendships f
JOIN users u1 ON f.requester_id = u1.id
JOIN users u2 ON f.addressee_id = u2.id
GROUP BY u1.ocid, u2.ocid, f.requester_id, f.addressee_id
HAVING COUNT(*) > 1;

-- Expected: 0 rows (no duplicates due to UNIQUE constraint)

-- Summary: Friend counts per user
SELECT 
  u.ocid,
  u.display_name,
  COUNT(CASE WHEN f.status = 'accepted' THEN 1 END) as friends,
  COUNT(CASE WHEN f.status = 'pending' AND f.addressee_id = u.id THEN 1 END) as requests_received,
  COUNT(CASE WHEN f.status = 'pending' AND f.requester_id = u.id THEN 1 END) as requests_sent
FROM users u
LEFT JOIN friendships f ON u.id = f.requester_id OR u.id = f.addressee_id
GROUP BY u.id, u.ocid, u.display_name
ORDER BY friends DESC
LIMIT 10;

-- Expected: Seed users should have friends from seed.sql
