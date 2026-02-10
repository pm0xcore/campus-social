-- Cleanup script to remove all test data
-- Run this in Supabase SQL Editor when you're done testing

-- Delete in reverse order of dependencies
DELETE FROM notifications WHERE user_id LIKE 'user-test-%';
DELETE FROM user_achievements WHERE user_id LIKE 'user-test-%';
DELETE FROM user_challenge_progress WHERE user_id LIKE 'user-test-%';
DELETE FROM daily_challenges WHERE challenge_id LIKE 'challenge-%' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '%';
DELETE FROM posts WHERE id LIKE 'post-test-%';
DELETE FROM friendships WHERE requester_id LIKE 'user-test-%';
DELETE FROM user_stats WHERE user_id LIKE 'user-test-%';
DELETE FROM users WHERE id LIKE 'user-test-%';
DELETE FROM universities WHERE id = 'test-univ-1';

-- Verification - should all return 0
SELECT 
  'Users' as table_name, COUNT(*) as remaining FROM users WHERE id LIKE 'user-test-%'
UNION ALL
SELECT 'User Stats', COUNT(*) FROM user_stats WHERE user_id LIKE 'user-test-%'
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts WHERE id LIKE 'post-test-%'
UNION ALL
SELECT 'Friendships', COUNT(*) FROM friendships WHERE requester_id LIKE 'user-test-%'
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications WHERE user_id LIKE 'user-test-%'
UNION ALL
SELECT 'Universities', COUNT(*) FROM universities WHERE id = 'test-univ-1';
