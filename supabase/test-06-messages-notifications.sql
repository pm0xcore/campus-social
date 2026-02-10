-- ============================================
-- TEST 6: Messages & Notifications Verification
-- ============================================
-- Run this in Supabase SQL Editor to verify messaging data

-- Check message requests status
SELECT 
  status, 
  COUNT(*) as count
FROM message_requests 
GROUP BY status
ORDER BY count DESC;

-- Expected: May be empty if no message requests yet

-- View message requests with user details
SELECT 
  u1.ocid as sender,
  u2.ocid as recipient,
  mr.status,
  mr.created_at,
  CASE 
    WHEN mr.status = 'pending' THEN '○ Awaiting response'
    WHEN mr.status = 'accepted' THEN '✓ Accepted'
    ELSE '✗ Declined'
  END as status_display
FROM message_requests mr
JOIN users u1 ON mr.sender_id = u1.id
JOIN users u2 ON mr.recipient_id = u2.id
ORDER BY mr.created_at DESC
LIMIT 10;

-- Expected: May be empty initially

-- Check messages exist
SELECT 
  COUNT(*) as total_messages,
  COUNT(DISTINCT sender_id) as unique_senders,
  COUNT(DISTINCT recipient_id) as unique_recipients,
  COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read_messages,
  COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_messages
FROM messages;

-- Expected: May be empty if no messages sent yet

-- View recent messages
SELECT 
  u1.ocid as sender,
  u2.ocid as recipient,
  LEFT(m.content, 50) as message_preview,
  m.created_at,
  CASE 
    WHEN m.read_at IS NOT NULL THEN '✓ Read'
    ELSE '○ Unread'
  END as read_status
FROM messages m
JOIN users u1 ON m.sender_id = u1.id
JOIN users u2 ON m.recipient_id = u2.id
ORDER BY m.created_at DESC
LIMIT 10;

-- Expected: May be empty initially

-- Verify notifications are being created
SELECT 
  type, 
  COUNT(*) as count,
  COUNT(CASE WHEN read THEN 1 END) as read_count,
  COUNT(CASE WHEN NOT read THEN 1 END) as unread_count
FROM notifications 
GROUP BY type
ORDER BY count DESC;

-- Expected: Seed notifications from seed.sql

-- Check for unread notifications
SELECT 
  u.ocid,
  n.type,
  n.title,
  n.message,
  n.created_at,
  '○ Unread' as status
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.read = false
ORDER BY n.created_at DESC
LIMIT 10;

-- Expected: Seed users should have unread notifications

-- Recent notifications activity
SELECT 
  u.ocid,
  n.type,
  n.title,
  n.created_at,
  CASE WHEN n.read THEN '✓ Read' ELSE '○ Unread' END as status
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 15;

-- Expected: Mix of notification types from seed

-- Notification types available
SELECT DISTINCT type, COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- Expected types: friend_request, friend_accepted, post_reaction, 
-- achievement, level_up, streak_risk, challenge_available
