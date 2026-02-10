# Testing Guide

## Quick Start

You now have 3 seed scripts ready to populate your Supabase database with test data.

### Step 1: Run the Seed Script

1. Open https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy the entire contents of `supabase/seed.sql`
3. Paste and click "Run"
4. Verify the counts at the bottom (should show 6 users, 8 posts, etc.)

### Step 2: Test the Live App

Visit: https://ochub-template.vercel.app

**What you can test without auth:**
- Homepage loads with hero gradient ✅
- Navigation works ✅
- Pages render correctly ✅

**What needs auth to test:**
- View populated feed with 8 posts
- See 6 discoverable users
- View leaderboard rankings (Sarah Johnson #1 with 2,850 pts)
- Check notifications
- Daily challenges

### Step 3: Clean Up (When Done)

1. Open Supabase SQL Editor
2. Copy contents of `supabase/cleanup-seed.sql`
3. Run it to remove all test data

## Test Users Created

| User | Points | Level | Bio |
|------|--------|-------|-----|
| Sarah Johnson | 2,850 | 12 | Biology major, top performer |
| Emma Li | 2,340 | 10 | Business major, startup founder |
| David Kim | 2,100 | 9 | CS major, game developer |
| Mike Rivera | 1,890 | 8 | Engineering student |
| James Patel | 1,450 | 6 | Physics major |
| Olivia Garcia | 980 | 5 | Art student |

## What Gets Created

- ✅ 6 test users with realistic profiles
- ✅ User stats for each (points, levels, streaks)
- ✅ 8 posts with different types (wins, questions, resources)
- ✅ Post reactions (fire, clap, heart emojis)
- ✅ 7 friendships between users
- ✅ Today's 3 daily challenges
- ✅ Some completed challenges
- ✅ 6 notifications (friend requests, achievements, level ups)
- ✅ Achievement unlocks for top users

## Verification Checklist

After seeding, verify these pages work:

- [ ] `/` - Homepage shows hero section
- [ ] `/discover` - Shows 6 test users (when authenticated)
- [ ] `/feed` - Shows 8 posts with reactions (when authenticated)
- [ ] `/leaderboard` - Shows rankings with Sarah at #1
- [ ] Homepage daily challenges card shows 3 tasks

## Files Reference

- `supabase/seed.sql` - Main seed script (run this first)
- `supabase/cleanup-seed.sql` - Removes all test data
- `supabase/README.md` - Detailed documentation
- `lib/mock-data.ts` - Client-side mock data (not used if DB is seeded)

All test data is prefixed with `test-` for easy identification.
