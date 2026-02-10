# Testing Quick Start

## Step 1: SQL Verification (5 minutes)

**Run this in Supabase SQL Editor:**

1. Open `supabase/test-master.sql`
2. Copy entire contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Review results - all "issues_found" should be 0

**OR run individual test files if you want detailed output:**
- `test-01-schema.sql` - Schema verification
- `test-02-users.sql` - Users & auth
- `test-03-friendships.sql` - Friendships
- `test-04-posts.sql` - Posts & reactions
- `test-05-gamification.sql` - Gamification
- `test-06-messages-notifications.sql` - Messages & notifications
- `test-07-groups.sql` - Groups
- `test-08-integrity.sql` - Data integrity

---

## Step 2: Fix University Assignment (1 minute)

If you haven't already, run this in Supabase:

```sql
UPDATE users 
SET university_id = '00000000-0000-0000-0000-000000000001'
WHERE university_id != '00000000-0000-0000-0000-000000000001' 
  OR university_id IS NULL;
```

This puts everyone in the same test university so they all appear in discover.

---

## Step 3: UI/API Testing (10 minutes)

Open https://ochub-template.vercel.app and test:

### Quick Flow Test
1. **Login/Logout**
   - Logout → login → should see your profile synced

2. **Discover** 
   - Go to `/discover` → should see 6 seed users + any real users
   - Search for "Sarah" → should filter

3. **Friend Request**
   - Send friend request to a seed user
   - Accept it (if they sent you one, or have Simon send you one)
   - Check badge on Friends icon appears

4. **Create Post**
   - Go to `/feed` → create a post
   - Add a reaction to someone else's post
   - Should see your post appear

5. **Leaderboard**
   - Go to `/leaderboard` → should see ranked users
   - Top users: Sarah, Emma, David from seed data

6. **Notifications**
   - Click bell icon → should see notifications
   - Click one → should mark as read

### Browser Console Quick Tests

Open DevTools Console and run:

```javascript
const token = window.account?.getIdToken?.();

// Test all at once
Promise.all([
  fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
  fetch('/api/users/discover', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
  fetch('/api/gamification/stats', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
  fetch('/api/gamification/leaderboard', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
  fetch('/api/gamification/challenges/daily', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
  fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` }}).then(r => r.json()),
]).then(results => {
  console.log('✓ Me:', results[0]);
  console.log('✓ Discover:', results[1].users?.length, 'users');
  console.log('✓ Stats:', results[2].stats);
  console.log('✓ Leaderboard:', results[3].leaderboard?.length, 'users');
  console.log('✓ Challenges:', results[4].challenges?.length, 'challenges');
  console.log('✓ Notifications:', results[5].notifications?.length, 'notifications');
});
```

Expected output:
- Me: Your user object
- Discover: 6+ users
- Stats: Your points/level
- Leaderboard: 6+ ranked users
- Challenges: 4 challenges
- Notifications: Some notifications

---

## Step 4: Document Results

Fill out `TEST_RESULTS.md` with:
- ✓ for passing tests
- ❌ for failing tests
- Notes on any issues found

---

## Common Issues & Fixes

### "No users in discover"
→ Run university assignment fix (Step 2)

### "Friend request badge not showing"
→ Wait 30 seconds for auto-refresh, or reload page

### "Can't create post"
→ Make sure you're logged in and have completed profile

### "Leaderboard empty"
→ Check you're in test university (run Step 2)

---

## Files Reference

- **SQL Test Scripts:** `supabase/test-*.sql`
- **Master Test:** `supabase/test-master.sql`
- **API Testing Guide:** `API_TESTING_GUIDE.md`
- **Results Template:** `TEST_RESULTS.md`
- **This Guide:** `TESTING_QUICK_START.md`
