# SQL Testing Guide

Run these SQL scripts in **Supabase SQL Editor** to verify database integrity.

## Order of Execution

Run these scripts in order:

### 1. Schema Verification
**File:** `test-01-schema.sql`  
**Purpose:** Verify all tables, indexes, and foreign keys exist  
**What to check:** All expected tables should be listed (15 tables total)

### 2. Users & Authentication
**File:** `test-02-users.sql`  
**Purpose:** Verify user data and university assignments  
**What to check:**
- All users have user_stats (auto-created by trigger)
- Users are assigned to test university
- No users without universities (after running fix-university-assignment.sql)

### 3. Friendships
**File:** `test-03-friendships.sql`  
**Purpose:** Verify friendship data integrity  
**What to check:**
- Mix of accepted/pending statuses
- No self-friendships
- No orphaned friendships
- Accepted friendships have accepted_at timestamp

### 4. Posts & Reactions
**File:** `test-04-posts.sql`  
**Purpose:** Verify posts and reactions  
**What to check:**
- Posts exist from seed data
- All posts have valid authors
- Reactions are properly linked
- No orphaned posts or reactions

### 5. Gamification System
**File:** `test-05-gamification.sql`  
**Purpose:** Verify gamification features  
**What to check:**
- 14+ achievements seeded
- Daily challenges exist for today
- User achievements awarded to seed users
- Leaderboard shows ranked users

### 6. Messages & Notifications
**File:** `test-06-messages-notifications.sql`  
**Purpose:** Verify messaging and notification systems  
**What to check:**
- Notifications created from seed data
- Some unread notifications exist
- Message/notification types are valid

### 7. Groups
**File:** `test-07-groups.sql`  
**Purpose:** Verify groups functionality  
**What to check:**
- Groups can be created
- Members can join
- Group posts work
- No orphaned groups or members

### 8. Data Integrity
**File:** `test-08-integrity.sql`  
**Purpose:** Final integrity checks  
**What to check:**
- No duplicate OCIDs
- No orphaned records
- All foreign keys valid
- Overall data health summary

## How to Run

1. Go to Supabase Dashboard → SQL Editor
2. Open each test file in order
3. Run the entire script
4. Review the results for any ❌ errors or ⚠️ warnings
5. All checks with ✓ are passing

## Expected Results

After running all tests, you should see:
- ✓ All tables and indexes present
- ✓ 6+ users (seed users + real users)
- ✓ Friendships between seed users
- ✓ Posts with reactions
- ✓ 14 achievements available
- ✓ Daily challenges for today
- ✓ Notifications for seed users
- ✓ No data integrity issues (0 rows for error queries)

## If You Find Issues

Document any ❌ errors or ⚠️ warnings and we'll address them before testing the APIs.
