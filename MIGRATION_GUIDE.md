# 🚀 Migration & Testing Guide

## Step 1: Run the Migration (2 minutes)

### Quick Copy-Paste Method:

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/iwocvbodiqqkbrpohzgo/sql/new
   ```

2. **Copy the entire migration file:**
   - The file is open in your IDE: `supabase/migrations/20260211000000_gamification.sql`
   - Select all (Cmd+A) → Copy (Cmd+C)

3. **Paste into SQL Editor and Run:**
   - Paste (Cmd+V)
   - Click "RUN" button (bottom right)
   - Wait ~5 seconds

4. **Verify success:**
   - You should see "Success. No rows returned"
   - Check the Tables sidebar - you should see new tables:
     - `user_stats`
     - `achievements`
     - `user_achievements`
     - `daily_challenges`
     - `user_challenge_progress`
     - `notifications`

---

## Step 2: Regenerate TypeScript Types

After migration, run this command to update types:

```bash
cd /Users/lachlanwebb/ochub-template
npx supabase gen types typescript --project-id iwocvbodiqqkbrpohzgo > lib/database.types.ts
```

This will add the new gamification tables to the TypeScript types and fix ~40 type errors.

---

## Step 3: Test the App

### Homepage Test:
1. Visit: http://localhost:3002
2. Should see:
   - ✨ Animated gradient hero
   - "Find Your Campus Crew 🎓"
   - Daily challenges card
   - Quick access links

### Discover Page:
1. Visit: http://localhost:3002/discover
2. Should see:
   - Mission banner "Find Your First 3 Classmates"
   - Search bar
   - User cards with "Add Friend (+50 pts)"

### Leaderboard:
1. Visit: http://localhost:3002/leaderboard
2. Should see:
   - Time filters (Week/Month/All Time)
   - University vs Global tabs
   - Leaderboard list (empty until users get points)

### Feed Page:
1. Visit: http://localhost:3002/feed
2. Should see:
   - Create post form with point values
   - Post type buttons showing (+10 pts, +25 pts, etc)
   - Empty state with CTAs if no posts

### Onboarding:
1. Visit: http://localhost:3002/onboarding
2. Should see:
   - Step 1: Welcome screen
   - Progress dots at top
   - Next button

---

## Current Status

### ✅ What's Working:
- UI components render correctly
- Routing works
- Animations and styling
- Navigation
- Component structure

### ⚠️ What Needs Migration:
- Points tracking (calls `/api/gamification/track`)
- Achievements unlocking
- Leaderboard data
- Daily challenges
- User stats display
- Notifications

### 🔧 Known Issues (Will fix after migration):
- TypeScript errors (40+ type errors due to missing DB types)
- Stats API returns empty until migration runs
- Leaderboard shows no data
- Daily challenges card shows loading state

---

## After Migration, I'll Fix:

1. ✅ Regenerate DB types
2. ✅ Fix all TypeScript errors
3. ✅ Test all API endpoints
4. ✅ Add missing integrations
5. ✅ Verify gamification flow works end-to-end

---

## Quick Commands

```bash
# Check if server is running
curl http://localhost:3002

# Run type check
npm run typecheck

# Build test
npm run build

# Run linter
npm run lint
```

Let me know once you've run the migration and I'll immediately fix all the type errors and test everything!
