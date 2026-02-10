-- Seed script for testing Campus Social
-- Run this in Supabase SQL Editor after running the gamification migration
-- WARNING: This will insert test data. Remove before production!

-- Insert a test university
INSERT INTO universities (id, name, domain, created_at)
VALUES 
  ('test-univ-1', 'Open Campus University', 'opencampus.edu', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test users (6 classmates)
INSERT INTO users (id, ocid, display_name, avatar_url, bio, current_focus, university_id, has_completed_onboarding, created_at, last_seen_at)
VALUES 
  ('user-test-1', 'sarah.johnson', 'Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'Biology major | Lab enthusiast 🧬', 'Studying for biochem final', 'test-univ-1', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 hours'),
  ('user-test-2', 'mike.rivera', 'Mike Rivera', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'Engineering student | Coffee addict ☕', 'Working on robotics project', 'test-univ-1', true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '5 hours'),
  ('user-test-3', 'emma.li', 'Emma Li', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 'Business major | Startup founder 🚀', 'Preparing pitch deck', 'test-univ-1', true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 hour'),
  ('user-test-4', 'james.patel', 'James Patel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', 'Physics major | Space nerd 🌌', 'Research paper on quantum mechanics', 'test-univ-1', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 hours'),
  ('user-test-5', 'olivia.garcia', 'Olivia Garcia', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', 'Art major | Digital illustrator 🎨', 'Portfolio for gallery show', 'test-univ-1', true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '6 hours'),
  ('user-test-6', 'david.kim', 'David Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', 'CS major | Game dev enthusiast 🎮', 'Building an indie game', 'test-univ-1', true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '4 hours')
ON CONFLICT (ocid) DO NOTHING;

-- Insert user stats for each user (will be created automatically by trigger, but we'll update them)
-- Sarah - Top performer
UPDATE user_stats 
SET 
  points = 2850,
  level = 12,
  current_streak = 15,
  longest_streak = 20,
  total_posts = 45,
  total_friends = 8,
  achievements_unlocked = 10
WHERE user_id = 'user-test-1';

-- Mike - High performer
UPDATE user_stats 
SET 
  points = 1890,
  level = 8,
  current_streak = 7,
  longest_streak = 12,
  total_posts = 28,
  total_friends = 6,
  achievements_unlocked = 7
WHERE user_id = 'user-test-2';

-- Emma - High performer
UPDATE user_stats 
SET 
  points = 2340,
  level = 10,
  current_streak = 12,
  longest_streak = 18,
  total_posts = 38,
  total_friends = 9,
  achievements_unlocked = 9
WHERE user_id = 'user-test-3';

-- James - Mid performer
UPDATE user_stats 
SET 
  points = 1450,
  level = 6,
  current_streak = 5,
  longest_streak = 10,
  total_posts = 22,
  total_friends = 5,
  achievements_unlocked = 5
WHERE user_id = 'user-test-4';

-- Olivia - Lower performer
UPDATE user_stats 
SET 
  points = 980,
  level = 5,
  current_streak = 3,
  longest_streak = 8,
  total_posts = 15,
  total_friends = 4,
  achievements_unlocked = 4
WHERE user_id = 'user-test-5';

-- David - Top performer
UPDATE user_stats 
SET 
  points = 2100,
  level = 9,
  current_streak = 10,
  longest_streak = 15,
  total_posts = 32,
  total_friends = 7,
  achievements_unlocked = 8
WHERE user_id = 'user-test-6';

-- Create some friendships between users
INSERT INTO friendships (requester_id, addressee_id, status, created_at, updated_at)
VALUES
  ('user-test-1', 'user-test-2', 'accepted', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('user-test-1', 'user-test-3', 'accepted', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),
  ('user-test-2', 'user-test-3', 'accepted', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('user-test-2', 'user-test-4', 'accepted', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('user-test-3', 'user-test-6', 'accepted', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('user-test-4', 'user-test-5', 'accepted', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('user-test-5', 'user-test-6', 'accepted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert some posts
INSERT INTO posts (id, author_id, type, content, visibility, created_at)
VALUES
  ('post-test-1', 'user-test-2', 'win', 'Just aced my algorithms midterm! 🎉 All those late nights studying paid off.', 'public', NOW() - INTERVAL '2 hours'),
  ('post-test-2', 'user-test-1', 'question', 'Anyone know a good spot on campus for group study sessions? Library is always packed.', 'public', NOW() - INTERVAL '5 hours'),
  ('post-test-3', 'user-test-3', 'resource', 'Found this awesome free course on product management: coursera.org/product-basics. Highly recommend!', 'public', NOW() - INTERVAL '8 hours'),
  ('post-test-4', 'user-test-6', 'post', 'Starting a new game dev project. Who wants to collaborate? Looking for artists and sound designers!', 'public', NOW() - INTERVAL '1 day'),
  ('post-test-5', 'user-test-5', 'win', 'My artwork got accepted into the spring gallery show! Dreams do come true ✨', 'public', NOW() - INTERVAL '2 days'),
  ('post-test-6', 'user-test-4', 'question', 'Anyone taking quantum mechanics this semester? Want to form a study group?', 'public', NOW() - INTERVAL '3 days'),
  ('post-test-7', 'user-test-1', 'resource', 'Great YouTube channel for biology animations: https://youtube.com/biologyvisuals', 'public', NOW() - INTERVAL '4 days'),
  ('post-test-8', 'user-test-3', 'win', 'Just closed our first customer for the startup! 🚀', 'public', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Add reactions to posts (stored as JSONB)
UPDATE posts SET reactions = '{"fire": ["user-test-1", "user-test-3", "user-test-4", "user-test-5"], "clap": ["user-test-2", "user-test-6"], "heart": ["user-test-1"]}'::jsonb WHERE id = 'post-test-1';
UPDATE posts SET reactions = '{"fire": ["user-test-2"], "heart": ["user-test-3", "user-test-4"]}'::jsonb WHERE id = 'post-test-2';
UPDATE posts SET reactions = '{"fire": ["user-test-1", "user-test-2", "user-test-4", "user-test-5", "user-test-6"], "clap": ["user-test-1", "user-test-3"], "heart": ["user-test-2"]}'::jsonb WHERE id = 'post-test-3';
UPDATE posts SET reactions = '{"fire": ["user-test-3"], "heart": ["user-test-1", "user-test-5"]}'::jsonb WHERE id = 'post-test-4';
UPDATE posts SET reactions = '{"fire": ["user-test-1", "user-test-2", "user-test-3", "user-test-4", "user-test-6"], "clap": ["user-test-1", "user-test-2"], "heart": ["user-test-1", "user-test-2", "user-test-3", "user-test-4", "user-test-6"]}'::jsonb WHERE id = 'post-test-5';

-- Insert today's daily challenges (using the template IDs from gamification.ts)
INSERT INTO daily_challenges (challenge_id, challenge_type, description, points, target_date)
VALUES
  ('challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-1', 'make_friends', 'Send 3 friend requests to classmates', 100, CURRENT_DATE),
  ('challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-2', 'create_post', 'Share a post about your day', 50, CURRENT_DATE),
  ('challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-3', 'help_classmate', 'Answer a question in your feed', 75, CURRENT_DATE)
ON CONFLICT (challenge_id) DO NOTHING;

-- Mark some challenges as completed for active users
INSERT INTO user_challenge_progress (user_id, challenge_id, completed, progress, completed_at)
VALUES
  ('user-test-1', 'challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-1', true, 3, NOW() - INTERVAL '3 hours'),
  ('user-test-1', 'challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-2', true, 1, NOW() - INTERVAL '2 hours'),
  ('user-test-2', 'challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-2', true, 1, NOW() - INTERVAL '2 hours'),
  ('user-test-3', 'challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-1', true, 3, NOW() - INTERVAL '1 hour'),
  ('user-test-3', 'challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-2', true, 1, NOW() - INTERVAL '5 hours'),
  ('user-test-3', 'challenge-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-3', true, 1, NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- Add some achievements to top users
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 'user-test-1', id, NOW() - INTERVAL '20 days'
FROM achievements WHERE id IN ('first-post', 'first-friend', 'social-butterfly', 'helpful-classmate', 'week-streak')
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 'user-test-3', id, NOW() - INTERVAL '15 days'
FROM achievements WHERE id IN ('first-post', 'first-friend', 'social-butterfly', 'content-creator')
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 'user-test-6', id, NOW() - INTERVAL '8 days'
FROM achievements WHERE id IN ('first-post', 'first-friend', 'helpful-classmate')
ON CONFLICT DO NOTHING;

-- Insert some notifications for users
INSERT INTO notifications (user_id, type, title, message, created_at, is_read)
VALUES
  ('user-test-1', 'friend_request', 'New Friend Request', 'Emma Li wants to connect with you', NOW() - INTERVAL '30 minutes', false),
  ('user-test-2', 'achievement', 'Achievement Unlocked!', 'You earned the "Helpful Classmate" badge', NOW() - INTERVAL '2 hours', false),
  ('user-test-3', 'level_up', 'Level Up!', 'You''ve reached Level 10', NOW() - INTERVAL '1 day', true),
  ('user-test-4', 'streak_milestone', 'Streak Milestone!', 'You''ve maintained a 5-day streak', NOW() - INTERVAL '3 hours', false),
  ('user-test-5', 'post_reaction', 'New Reaction', 'Sarah Johnson reacted to your post', NOW() - INTERVAL '4 hours', true),
  ('user-test-1', 'challenge_complete', 'Challenge Completed!', 'You completed all daily challenges! +225 points', NOW() - INTERVAL '2 hours', false)
ON CONFLICT DO NOTHING;

-- Verification query
SELECT 
  'Users' as table_name, COUNT(*) as count FROM users WHERE id LIKE 'user-test-%'
UNION ALL
SELECT 'User Stats', COUNT(*) FROM user_stats WHERE user_id LIKE 'user-test-%'
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts WHERE id LIKE 'post-test-%'
UNION ALL
SELECT 'Friendships', COUNT(*) FROM friendships WHERE requester_id LIKE 'user-test-%'
UNION ALL
SELECT 'Daily Challenges', COUNT(*) FROM daily_challenges WHERE challenge_id LIKE 'challenge-%'
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications WHERE user_id LIKE 'user-test-%'
UNION ALL
SELECT 'User Achievements', COUNT(*) FROM user_achievements WHERE user_id LIKE 'user-test-%';
