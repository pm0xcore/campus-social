-- ============================================
-- TEST 4: Posts & Reactions Verification
-- ============================================
-- Run this in Supabase SQL Editor to verify posts data

-- Check posts distribution by type
SELECT 
  type, 
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM posts 
GROUP BY type
ORDER BY count DESC;

-- Expected: Mix of post/win/question/resource types

-- Verify posts with their authors
SELECT 
  p.id,
  u.ocid as author,
  p.type,
  LEFT(p.content, 50) as content_preview,
  p.visibility,
  p.created_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ Author missing'
    ELSE '✓ Valid'
  END as validation
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Expected: All posts should have valid authors

-- Check reactions are properly linked
SELECT 
  u.ocid as author,
  LEFT(p.content, 40) as post_preview,
  COUNT(r.user_id) as reaction_count,
  STRING_AGG(DISTINCT r.emoji, ', ') as emojis
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN reactions r ON p.id = r.post_id
GROUP BY p.id, u.ocid, p.content
ORDER BY reaction_count DESC
LIMIT 10;

-- Expected: Seed posts should have reactions

-- Check for orphaned posts (author doesn't exist)
SELECT 
  p.id, 
  p.author_id, 
  LEFT(p.content, 50) as content,
  '❌ Author does not exist' as issue
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
WHERE u.id IS NULL;

-- Expected: 0 rows (no orphaned posts)

-- Check for orphaned reactions (post or user doesn't exist)
SELECT 
  r.post_id,
  r.user_id,
  r.emoji,
  CASE 
    WHEN p.id IS NULL THEN '❌ Post does not exist'
    WHEN u.id IS NULL THEN '❌ User does not exist'
  END as issue
FROM reactions r
LEFT JOIN posts p ON r.post_id = p.id
LEFT JOIN users u ON r.user_id = u.id
WHERE p.id IS NULL OR u.id IS NULL;

-- Expected: 0 rows (no orphaned reactions)

-- Posts by visibility
SELECT 
  visibility,
  COUNT(*) as count
FROM posts
GROUP BY visibility
ORDER BY count DESC;

-- Expected: Most posts should be 'public' for testing

-- Recent post activity
SELECT 
  DATE(p.created_at) as post_date,
  COUNT(*) as posts_created,
  COUNT(DISTINCT p.author_id) as unique_authors
FROM posts p
GROUP BY DATE(p.created_at)
ORDER BY post_date DESC
LIMIT 7;

-- Expected: See when posts were created (mostly from seed.sql)
