-- ============================================
-- MAINTENANCE: Ensure Data Consistency
-- ============================================
-- Run this script periodically or after issues to ensure data health

-- 1. Create missing user_stats (should be auto-created by trigger, but just in case)
INSERT INTO user_stats (user_id, university_id, points, level, streak_days, last_active_date)
SELECT 
  u.id,
  u.university_id,
  0,
  1,
  0,
  CURRENT_DATE
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE us.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2. Sync university_id from users to user_stats (in case they diverged)
UPDATE user_stats us
SET university_id = u.university_id
FROM users u
WHERE us.user_id = u.id 
  AND (us.university_id IS NULL OR us.university_id != u.university_id);

-- 3. Update friends_count in user_stats based on actual friendships
UPDATE user_stats us
SET friends_count = (
  SELECT COUNT(*)
  FROM friendships f
  WHERE (f.requester_id = us.user_id OR f.addressee_id = us.user_id)
    AND f.status = 'accepted'
);

-- 4. Update posts_count in user_stats based on actual posts
UPDATE user_stats us
SET posts_count = (
  SELECT COUNT(*)
  FROM posts p
  WHERE p.author_id = us.user_id
);

-- 5. Update groups_joined_count based on actual memberships
UPDATE user_stats us
SET groups_joined_count = (
  SELECT COUNT(*)
  FROM group_members gm
  WHERE gm.user_id = us.user_id
);

-- 6. Clean up declined friendships older than 30 days (optional)
-- DELETE FROM friendships 
-- WHERE status = 'declined' 
--   AND created_at < NOW() - INTERVAL '30 days';

-- 7. Verification: Show summary after maintenance
SELECT 
  'Users' as entity,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 'User Stats', COUNT(*) FROM user_stats
UNION ALL
SELECT 'Friendships (accepted)', COUNT(*) FROM friendships WHERE status = 'accepted'
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts
UNION ALL
SELECT 'Reactions', COUNT(*) FROM reactions
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Daily Challenges (today)', COUNT(*) FROM daily_challenges WHERE date = CURRENT_DATE;

-- Show users with their corrected stats
SELECT 
  u.ocid,
  us.points,
  us.level,
  us.friends_count,
  us.posts_count,
  us.streak_days
FROM users u
JOIN user_stats us ON u.id = us.user_id
ORDER BY us.points DESC
LIMIT 10;

-- Data consistency check (all should be 0)
SELECT 
  'Users missing stats' as issue,
  COUNT(*) as count
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE us.user_id IS NULL
UNION ALL
SELECT 
  'Stats with mismatched university',
  COUNT(*)
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.university_id != u.university_id 
   OR (us.university_id IS NULL AND u.university_id IS NOT NULL);

-- Expected: All counts should be 0 after maintenance
