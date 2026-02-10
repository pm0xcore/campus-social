-- Seed script for testing Campus Social
-- Run this in Supabase SQL Editor after running the gamification migration
-- WARNING: This will insert test data. Remove before production!

-- Define the test university UUID (consistent across all inserts)
-- Using a predictable UUID for 'test-univ-1': 00000000-0000-0000-0000-000000000001

-- Insert a test university
INSERT INTO universities (id, name, issuer_did, domain)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Open Campus University', 'did:oc:university:test', 'opencampus.edu')
ON CONFLICT (issuer_did) DO NOTHING;

-- Insert test users (6 classmates)
INSERT INTO users (id, ocid, display_name, avatar_url, bio, current_focus, university_id, has_completed_onboarding, created_at, last_seen_at)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'sarah.johnson', 'Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'Biology major | Lab enthusiast 🧬', 'Studying for biochem final', '00000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 hours'),
  ('10000000-0000-0000-0000-000000000002', 'mike.rivera', 'Mike Rivera', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'Engineering student | Coffee addict ☕', 'Working on robotics project', '00000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '5 hours'),
  ('10000000-0000-0000-0000-000000000003', 'emma.li', 'Emma Li', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 'Business major | Startup founder 🚀', 'Preparing pitch deck', '00000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 hour'),
  ('10000000-0000-0000-0000-000000000004', 'james.patel', 'James Patel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', 'Physics major | Space nerd 🌌', 'Research paper on quantum mechanics', '00000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 hours'),
  ('10000000-0000-0000-0000-000000000005', 'olivia.garcia', 'Olivia Garcia', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', 'Art major | Digital illustrator 🎨', 'Portfolio for gallery show', '00000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '6 hours'),
  ('10000000-0000-0000-0000-000000000006', 'david.kim', 'David Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', 'CS major | Game dev enthusiast 🎮', 'Building an indie game', '00000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '4 hours')
ON CONFLICT (ocid) DO NOTHING;

-- Insert user stats for each user (will be created automatically by trigger, but we'll update them)
-- Sarah - Top performer
UPDATE user_stats 
SET 
  points = 2850,
  level = 12,
  streak_days = 15,
  friends_count = 8,
  posts_count = 45,
  university_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id = '10000000-0000-0000-0000-000000000001';

-- Mike - High performer
UPDATE user_stats 
SET 
  points = 1890,
  level = 8,
  streak_days = 7,
  friends_count = 6,
  posts_count = 28,
  university_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id = '10000000-0000-0000-0000-000000000002';

-- Emma - High performer
UPDATE user_stats 
SET 
  points = 2340,
  level = 10,
  streak_days = 12,
  friends_count = 9,
  posts_count = 38,
  university_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id = '10000000-0000-0000-0000-000000000003';

-- James - Mid performer
UPDATE user_stats 
SET 
  points = 1450,
  level = 6,
  streak_days = 5,
  friends_count = 5,
  posts_count = 22,
  university_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id = '10000000-0000-0000-0000-000000000004';

-- Olivia - Lower performer
UPDATE user_stats 
SET 
  points = 980,
  level = 5,
  streak_days = 3,
  friends_count = 4,
  posts_count = 15,
  university_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id = '10000000-0000-0000-0000-000000000005';

-- David - Top performer
UPDATE user_stats 
SET 
  points = 2100,
  level = 9,
  streak_days = 10,
  friends_count = 7,
  posts_count = 32,
  university_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id = '10000000-0000-0000-0000-000000000006';

-- Create some friendships between users
INSERT INTO friendships (requester_id, addressee_id, status, created_at, accepted_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'accepted', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'accepted', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),
  ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'accepted', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'accepted', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 'accepted', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'accepted', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', 'accepted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert some posts
INSERT INTO posts (id, author_id, type, content, visibility, created_at)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'win', 'Just aced my algorithms midterm! 🎉 All those late nights studying paid off.', 'public', NOW() - INTERVAL '2 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'question', 'Anyone know a good spot on campus for group study sessions? Library is always packed.', 'public', NOW() - INTERVAL '5 hours'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'resource', 'Found this awesome free course on product management: coursera.org/product-basics. Highly recommend!', 'public', NOW() - INTERVAL '8 hours'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', 'post', 'Starting a new game dev project. Who wants to collaborate? Looking for artists and sound designers!', 'public', NOW() - INTERVAL '1 day'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'win', 'My artwork got accepted into the spring gallery show! Dreams do come true ✨', 'public', NOW() - INTERVAL '2 days'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'question', 'Anyone taking quantum mechanics this semester? Want to form a study group?', 'public', NOW() - INTERVAL '3 days'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'resource', 'Great YouTube channel for biology animations: https://youtube.com/biologyvisuals', 'public', NOW() - INTERVAL '4 days'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'win', 'Just closed our first customer for the startup! 🚀', 'public', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Add reactions to posts (using reactions table)
INSERT INTO reactions (post_id, user_id, emoji)
VALUES
  -- Post 1: Mike's midterm win
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'fire'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'fire'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'fire'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'clap'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'clap'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'heart'),
  
  -- Post 2: Sarah's study question
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'fire'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'heart'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'heart'),
  
  -- Post 3: Emma's resource
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'fire'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'fire'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'fire'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'fire'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'clap'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'clap'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'heart'),
  
  -- Post 4: David's collaboration
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'fire'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'heart'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'heart'),
  
  -- Post 5: Olivia's gallery win
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'fire'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'fire'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'fire'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'fire'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', 'fire'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'clap'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'clap'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'heart'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'heart'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'heart'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'heart'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', 'heart')
ON CONFLICT DO NOTHING;

-- Insert today's daily challenges
INSERT INTO daily_challenges (date, challenge_type, description, points)
VALUES
  (CURRENT_DATE, 'make_friends', 'Send 3 friend requests to classmates', 100),
  (CURRENT_DATE, 'create_post', 'Share a post about your day', 50),
  (CURRENT_DATE, 'help_classmate', 'Answer a question in your feed', 75)
ON CONFLICT (date, challenge_type) DO NOTHING;

-- Mark some challenges as completed for active users
-- Get the challenge IDs from the ones we just created
WITH challenge_ids AS (
  SELECT id, challenge_type FROM daily_challenges WHERE date = CURRENT_DATE
)
INSERT INTO user_challenge_progress (user_id, challenge_id, completed, completed_at)
VALUES
  -- Sarah completed make_friends and create_post
  ('10000000-0000-0000-0000-000000000001', (SELECT id FROM challenge_ids WHERE challenge_type = 'make_friends'), true, NOW() - INTERVAL '3 hours'),
  ('10000000-0000-0000-0000-000000000001', (SELECT id FROM challenge_ids WHERE challenge_type = 'create_post'), true, NOW() - INTERVAL '2 hours'),
  -- Mike completed create_post
  ('10000000-0000-0000-0000-000000000002', (SELECT id FROM challenge_ids WHERE challenge_type = 'create_post'), true, NOW() - INTERVAL '2 hours'),
  -- Emma completed all 3
  ('10000000-0000-0000-0000-000000000003', (SELECT id FROM challenge_ids WHERE challenge_type = 'make_friends'), true, NOW() - INTERVAL '1 hour'),
  ('10000000-0000-0000-0000-000000000003', (SELECT id FROM challenge_ids WHERE challenge_type = 'create_post'), true, NOW() - INTERVAL '5 hours'),
  ('10000000-0000-0000-0000-000000000003', (SELECT id FROM challenge_ids WHERE challenge_type = 'help_classmate'), true, NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- Add some achievements to top users
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT '10000000-0000-0000-0000-000000000001', id, NOW() - INTERVAL '20 days'
FROM achievements WHERE name IN ('First Post', 'First Friend', 'Social Butterfly', 'Helpful Hero', 'Week Warrior')
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT '10000000-0000-0000-0000-000000000003', id, NOW() - INTERVAL '15 days'
FROM achievements WHERE name IN ('First Post', 'First Friend', 'Social Butterfly', 'Content Creator')
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT '10000000-0000-0000-0000-000000000006', id, NOW() - INTERVAL '8 days'
FROM achievements WHERE name IN ('First Post', 'First Friend', 'Helpful Hero')
ON CONFLICT DO NOTHING;

-- Insert some notifications for users
INSERT INTO notifications (user_id, type, title, message, created_at, read)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'friend_request', 'New Friend Request', 'Emma Li wants to connect with you', NOW() - INTERVAL '30 minutes', false),
  ('10000000-0000-0000-0000-000000000002', 'achievement', 'Achievement Unlocked!', 'You earned the "Helpful Classmate" badge', NOW() - INTERVAL '2 hours', false),
  ('10000000-0000-0000-0000-000000000003', 'level_up', 'Level Up!', 'You''ve reached Level 10', NOW() - INTERVAL '1 day', true),
  ('10000000-0000-0000-0000-000000000004', 'streak_risk', 'Keep Your Streak!', 'You''ve maintained a 5-day streak', NOW() - INTERVAL '3 hours', false),
  ('10000000-0000-0000-0000-000000000005', 'post_reaction', 'New Reaction', 'Sarah Johnson reacted to your post', NOW() - INTERVAL '4 hours', true),
  ('10000000-0000-0000-0000-000000000001', 'challenge_available', 'New Challenges!', 'Check out today''s daily challenges!', NOW() - INTERVAL '2 hours', false)
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
