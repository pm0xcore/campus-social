# API Testing Guide

Test all API endpoints through the deployed app and direct API calls.

## Prerequisites

1. ✅ Run all SQL verification scripts first (see `SQL_TESTING_GUIDE.md`)
2. ✅ Run `fix-university-assignment.sql` to ensure all users are in same university
3. ✅ Have at least 2 test accounts logged in (you + Simon, or create another)

## Testing Checklist

### Authentication & Users (5 endpoints)

#### 1. POST `/api/users/sync` - Auto-tested on login
- [ ] Logout from https://ochub-template.vercel.app
- [ ] Login again
- [ ] Check browser Network tab → should see POST to `/api/users/sync` with 200 response
- [ ] Verify in Supabase: Your `last_seen_at` timestamp updated
```sql
SELECT ocid, display_name, last_seen_at 
FROM users 
WHERE ocid = 'YOUR_OCID_HERE'
ORDER BY last_seen_at DESC;
```

#### 2. GET `/api/users/me` - Get your profile
- [ ] Open browser DevTools → Console
- [ ] Run this in console (copy/paste):
```javascript
fetch('/api/users/me', {
  headers: { 'Authorization': `Bearer ${window.account?.getIdToken?.()}` }
}).then(r => r.json()).then(console.log)
```
- [ ] Should return your user object with university

#### 3. PATCH `/api/users/me` - Update profile
- [ ] Click on your profile (click your OCID in header or navigate to `/profile/YOUR_OCID`)
- [ ] If there's an edit button, use it to update bio/current_focus
- [ ] OR run in console:
```javascript
fetch('/api/users/me', {
  method: 'PATCH',
  headers: { 
    'Authorization': `Bearer ${window.account?.getIdToken?.()}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ bio: 'Testing bio update', current_focus: 'Testing' })
}).then(r => r.json()).then(console.log)
```
- [ ] Refresh page and verify changes appear

#### 4. GET `/api/users/[ocid]` - View other profiles
- [ ] Go to `/discover`
- [ ] Click on any seed user (e.g., Sarah Johnson)
- [ ] Should see their profile page with stats
- [ ] Network tab should show GET to `/api/users/sarah.johnson` with 200

#### 5. GET `/api/users/discover` - Discover classmates
- [ ] Go to `/discover`
- [ ] Should see 6 seed users + any other logged-in users
- [ ] Search for "Sarah" → should filter to Sarah Johnson
- [ ] Network tab: GET `/api/users/discover` returns user list

---

### Friends (4 endpoints)

#### 6. GET `/api/friends?type=all` - Get friends list
- [ ] Go to `/friends`
- [ ] Network tab: GET `/api/friends?type=all` with 200 response
- [ ] Should show your current friends

#### 7. GET `/api/friends?type=pending` - Get pending requests
- [ ] Go to `/friends` → click "Requests" tab
- [ ] Network tab: GET `/api/friends?type=pending` with 200
- [ ] Should show requests you've received (if any)

#### 8. GET `/api/friends?type=sent` - Get sent requests
- [ ] Go to `/friends` → click "Sent" tab
- [ ] Network tab: GET `/api/friends?type=sent` with 200
- [ ] Should show requests you've sent (if any)

#### 9. POST `/api/friends` - Send friend request
- [ ] Go to `/discover`
- [ ] Click "Add Friend" on a seed user you're not friends with
- [ ] Network tab: POST `/api/friends` with 201 response
- [ ] Button should change to "Request Sent"
- [ ] Verify in SQL:
```sql
SELECT u1.ocid as requester, u2.ocid as addressee, f.status, f.created_at
FROM friendships f
JOIN users u ON f.requester_id = u.id
JOIN users u2 ON f.addressee_id = u2.id
WHERE u.ocid = 'YOUR_OCID_HERE'
ORDER BY f.created_at DESC
LIMIT 5;
```

#### 10. PATCH `/api/friends/[id]` - Accept friend request
**Option A: Via Friends Page**
- [ ] Have someone send you a friend request
- [ ] Go to `/friends` → "Requests" tab
- [ ] Click "Accept" on a request
- [ ] Network tab: PATCH `/api/friends/{id}` with 200
- [ ] User should move to "Friends" tab

**Option B: Via Profile**
- [ ] Navigate to profile of someone who sent you a request
- [ ] Click "Accept Request" button
- [ ] Should change to "Message" button
- [ ] Network tab: PATCH `/api/friends/{id}` with 200

#### 11. DELETE `/api/friends/[id]` - Remove friend
- [ ] Go to `/friends` → "Friends" tab
- [ ] Click "Remove" on a friend
- [ ] Confirm removal
- [ ] Network tab: DELETE `/api/friends/{id}` with 200
- [ ] Friend should disappear from list

---

### Posts & Reactions (3 endpoints)

#### 12. GET `/api/posts` - Get feed
- [ ] Go to `/feed`
- [ ] Should see posts from seed data
- [ ] Network tab: GET `/api/posts` with 200
- [ ] Posts should show author, content, reactions

#### 13. POST `/api/posts` - Create post
- [ ] Go to `/feed`
- [ ] Type a message in "What's on your mind?"
- [ ] Select post type (Win/Question/Resource)
- [ ] Click "Share"
- [ ] Network tab: POST `/api/posts` with 201
- [ ] Your post should appear at top of feed
- [ ] Verify in SQL:
```sql
SELECT u.ocid, p.type, p.content, p.created_at
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE u.ocid = 'YOUR_OCID_HERE'
ORDER BY p.created_at DESC
LIMIT 3;
```

#### 14. POST `/api/posts/[id]/react` - Add reaction
- [ ] Find any post in feed
- [ ] Click a reaction emoji (fire/heart/clap/etc)
- [ ] Network tab: POST `/api/posts/{id}/react` with 200
- [ ] Emoji should light up and count should increment
- [ ] Click same emoji again to remove reaction
- [ ] Count should decrement

---

### Messages (3 endpoints)

#### 15. GET `/api/messages` - Get conversations
- [ ] Go to `/messages`
- [ ] Network tab: GET `/api/messages` with 200
- [ ] Should show list of conversations (may be empty initially)

#### 16. GET `/api/messages/[userId]` - Get conversation
- [ ] Need to be friends with someone first
- [ ] Go to their profile → click "Message"
- [ ] Network tab: GET `/api/messages/{userId}` with 200
- [ ] Should show message history (empty for new conversation)

#### 17. POST `/api/messages/[userId]` - Send message
- [ ] In message thread with a friend
- [ ] Type a message and send
- [ ] Network tab: POST `/api/messages/{userId}` with 201
- [ ] Message should appear in thread
- [ ] Verify in SQL:
```sql
SELECT u1.ocid as sender, u2.ocid as recipient, m.content, m.created_at, m.read_at
FROM messages m
JOIN users u1 ON m.sender_id = u1.id
JOIN users u2 ON m.recipient_id = u2.id
WHERE u1.ocid = 'YOUR_OCID_HERE' OR u2.ocid = 'YOUR_OCID_HERE'
ORDER BY m.created_at DESC
LIMIT 5;
```

#### 18. POST `/api/messages/request/[userId]` - Request to message non-friend
- [ ] Find someone you're NOT friends with
- [ ] Try to message them
- [ ] Should see "Send Message Request" flow
- [ ] Network tab: POST `/api/messages/request/{userId}` with 201

---

### Groups (5 endpoints)

#### 19. GET `/api/groups` - Get your groups
- [ ] Go to `/groups`
- [ ] Network tab: GET `/api/groups` with 200
- [ ] Should show groups you're in (may be empty initially)

#### 20. POST `/api/groups` - Create group
- [ ] Go to `/groups`
- [ ] Click "Create Group" or similar button
- [ ] Fill in name, description, type
- [ ] Submit
- [ ] Network tab: POST `/api/groups` with 201
- [ ] New group should appear in list

#### 21. GET `/api/groups/[id]` - Get group details
- [ ] Click on a group from your groups list
- [ ] Network tab: GET `/api/groups/{id}` with 200
- [ ] Should show group info, members, posts

#### 22. POST `/api/groups/[id]/join` - Join group
- [ ] Find a group you're not in (create test with different account)
- [ ] Click "Join Group"
- [ ] Network tab: POST `/api/groups/{id}/join` with 200
- [ ] You should become a member

#### 23. GET `/api/groups/[id]/posts` - Get group feed
- [ ] On a group page
- [ ] Network tab: GET `/api/groups/{id}/posts` with 200
- [ ] Should show posts in that group

---

### Gamification (4 endpoints)

#### 24. GET `/api/gamification/stats` - Get your stats
- [ ] Go to home page or profile
- [ ] Network tab: GET `/api/gamification/stats` with 200
- [ ] Should show points, level, streak, etc.
- [ ] Visible in UserInfo component

#### 25. GET `/api/gamification/leaderboard` - Get rankings
- [ ] Go to `/leaderboard`
- [ ] Network tab: GET `/api/gamification/leaderboard` with 200
- [ ] Should show ranked users from your university
- [ ] Top users should match seed data (Sarah, Emma, David, etc.)

#### 26. GET `/api/gamification/challenges/daily` - Today's challenges
- [ ] Check home page for DailyChallengeCard
- [ ] Network tab: GET `/api/gamification/challenges/daily` with 200
- [ ] Should show 4 challenges for today from seed data

#### 27. POST `/api/gamification/track` - Track action
- [ ] This is called automatically when you do actions
- [ ] Create a post → should track and award points
- [ ] Accept friend request → should track and award points
- [ ] Network tab: POST `/api/gamification/track` with 200 after actions
- [ ] Check your stats updated:
```sql
SELECT u.ocid, us.points, us.level, us.posts_count, us.friends_count
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE u.ocid = 'YOUR_OCID_HERE';
```

---

### Notifications (2 endpoints)

#### 28. GET `/api/notifications` - Get notifications
- [ ] Check notification bell in header
- [ ] Click bell icon
- [ ] Network tab: GET `/api/notifications` with 200
- [ ] Should show notifications (seed users have notifications from seed.sql)
- [ ] Unread notifications should show badge count

#### 29. POST `/api/notifications/[id]/read` - Mark as read
- [ ] Click on an unread notification
- [ ] Network tab: POST `/api/notifications/{id}/read` with 200
- [ ] Blue dot should disappear
- [ ] Badge count should decrease

---

### University (1 endpoint)

#### 30. POST `/api/auth/verify-university` - Verify university
- [ ] This is called automatically during login
- [ ] Check in browser Network tab after login
- [ ] May see POST `/api/auth/verify-university` with 200
- [ ] Only works if you have a valid university credential

---

## Quick Test Commands (Browser Console)

Copy these into browser console for quick API testing:

```javascript
// Get your auth token
const token = window.account?.getIdToken?.();

// Test: Get your profile
fetch('/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);

// Test: Discover users
fetch('/api/users/discover', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);

// Test: Get gamification stats
fetch('/api/gamification/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);

// Test: Get leaderboard
fetch('/api/gamification/leaderboard', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);

// Test: Get daily challenges
fetch('/api/gamification/challenges/daily', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);

// Test: Get notifications
fetch('/api/notifications', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

## Report Issues

As you test, document:
- ✅ What works
- ❌ What fails (with error message)
- ⚠️ What works but seems wrong
- 💡 Suggested improvements
