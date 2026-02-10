-- ============================================
-- TEST 7: Groups Verification
-- ============================================
-- Run this in Supabase SQL Editor to verify groups data

-- Check groups and memberships
SELECT 
  g.name,
  g.type,
  u.ocid as creator,
  uni.name as university,
  COUNT(gm.user_id) as member_count,
  g.created_at
FROM groups g
JOIN users u ON g.created_by = u.id
LEFT JOIN universities uni ON g.university_id = uni.id
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.id, g.name, g.type, u.ocid, uni.name, g.created_at
ORDER BY member_count DESC, g.created_at DESC;

-- Expected: May be empty if no groups created yet

-- Check group member roles
SELECT 
  g.name as group_name,
  u.ocid as member,
  gm.role,
  gm.joined_at,
  CASE 
    WHEN gm.role = 'owner' THEN '👑 Owner'
    WHEN gm.role = 'admin' THEN '⚡ Admin'
    ELSE '👤 Member'
  END as role_display
FROM group_members gm
JOIN groups g ON gm.group_id = g.id
JOIN users u ON gm.user_id = u.id
ORDER BY g.name, 
  CASE gm.role 
    WHEN 'owner' THEN 1 
    WHEN 'admin' THEN 2 
    ELSE 3 
  END,
  gm.joined_at;

-- Expected: May be empty initially

-- Verify group posts
SELECT 
  g.name as group_name,
  u.ocid as author,
  p.type as post_type,
  LEFT(p.content, 40) as content_preview,
  p.created_at
FROM posts p
JOIN groups g ON p.group_id = g.id
JOIN users u ON p.author_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Expected: May be empty if no group posts yet

-- Groups by type
SELECT 
  type,
  COUNT(*) as count
FROM groups
GROUP BY type
ORDER BY count DESC;

-- Expected types: university, course, club, study

-- Check for orphaned groups (creator doesn't exist)
SELECT 
  g.id,
  g.name,
  g.created_by,
  '❌ Creator does not exist' as issue
FROM groups g
LEFT JOIN users u ON g.created_by = u.id
WHERE u.id IS NULL;

-- Expected: 0 rows (no orphaned groups)

-- Check for orphaned group members
SELECT 
  gm.group_id,
  gm.user_id,
  gm.role,
  CASE 
    WHEN g.id IS NULL THEN '❌ Group does not exist'
    WHEN u.id IS NULL THEN '❌ User does not exist'
  END as issue
FROM group_members gm
LEFT JOIN groups g ON gm.group_id = g.id
LEFT JOIN users u ON gm.user_id = u.id
WHERE g.id IS NULL OR u.id IS NULL;

-- Expected: 0 rows (no orphaned members)
