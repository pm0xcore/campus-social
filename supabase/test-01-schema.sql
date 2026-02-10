-- ============================================
-- TEST 1: Database Schema Verification
-- ============================================
-- Run this in Supabase SQL Editor to verify schema integrity

-- Check all tables exist
SELECT 
  'Tables' as check_type,
  table_name,
  '✓ Exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables:
-- achievements, daily_challenges, friendships, group_members, groups,
-- message_requests, messages, notifications, posts, reactions,
-- universities, user_achievements, user_challenge_progress, user_stats, users

-- Check all indexes exist
SELECT 
  'Indexes' as check_type,
  tablename,
  indexname,
  '✓ Exists' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Verify foreign key constraints
SELECT
  'Foreign Keys' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✓ Constraint exists' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
