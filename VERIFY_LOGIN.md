# How to Verify Your Account is Logged In

## Quick Check in Supabase

1. **Open Supabase Dashboard:**
   - https://supabase.com/dashboard/project/iwocvbodiqqkbrpohzgo/editor

2. **Go to Table Editor → `users` table**
   - Look for your OCID in the list
   - Check the `university_id` column - should be: `00000000-0000-0000-0000-000000000001`

3. **Or run the verification SQL:**
   - Open SQL Editor: https://supabase.com/dashboard/project/iwocvbodiqqkbrpohzgo/sql/new
   - Copy `supabase/verify-account.sql`
   - Replace `'YOUR_OCID_HERE'` with your actual OCID
   - Run it

## What You Should See

### ✅ Correct Setup:
```sql
-- Your user record:
ocid: your.ocid
display_name: Your Name
university_id: 00000000-0000-0000-0000-000000000001  <-- This must be set!
has_completed_onboarding: false (initially)

-- Your stats record:
points: 0
level: 1
streak_days: 0
```

### ❌ Problem Signs:
- `university_id` is NULL → Auto-assignment didn't work
- User doesn't exist → Not logged in yet
- No stats record → Trigger didn't fire

## Test in the App

1. **Visit:** https://ochub-template.vercel.app
2. **Log in via OC Hub**
3. **Go to /discover page**
4. **You should see:**
   - 6 seeded test users (Sarah, Mike, Emma, James, Olivia, David)
   - Other logged-in users (Simon, Prince, etc.)
   - Search bar at the top
   - Mission banner: "Find Your First 3 Classmates"

## If Discovery is Empty

**Problem:** Your `university_id` is NULL

**Fix:**
```sql
-- Run this in Supabase SQL Editor (replace YOUR_OCID):
UPDATE users 
SET university_id = '00000000-0000-0000-0000-000000000001'
WHERE ocid = 'YOUR_OCID_HERE';
```

Then refresh the /discover page.

## Check User Stats

Visit homepage - you should see:
- Your level (starts at 1)
- Your points (starts at 0)
- Daily challenges card
- Your streak (starts at 0)

## Still Having Issues?

Check browser console (F12) for errors, or share your OCID and I'll check the database directly.
