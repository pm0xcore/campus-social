# Supabase Seed Data

This directory contains SQL scripts for seeding test data into your Supabase database.

## Files

- **`20260211000000_gamification.sql`** - Main migration with gamification schema
- **`seed.sql`** - Test data for UI development and testing
- **`cleanup-seed.sql`** - Removes all test data

## How to Use

### 1. Run the Migration (if not already done)

```sql
-- Copy and paste contents of 20260211000000_gamification.sql
-- into Supabase SQL Editor
```

### 2. Seed Test Data

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `seed.sql`
3. Paste and run it
4. Verify the results at the bottom of the output

This will create:
- 6 test users with different activity levels
- User stats for leaderboard rankings
- 8 test posts with reactions
- Friendship connections
- Today's daily challenges
- Some completed challenges
- Various notifications
- Achievement unlocks

### 3. Test Your App

Now you can:
- View populated feed with real posts
- See users in the discover page
- Check leaderboard rankings
- View notifications
- Test daily challenges
- See achievement progress

### 4. Clean Up (When Done Testing)

```sql
-- Copy and paste contents of cleanup-seed.sql
-- into Supabase SQL Editor
```

This removes all test data (everything with `user-test-*`, `post-test-*`, etc.)

## Test Users

| OCID | Name | Points | Level | Personality |
|------|------|--------|-------|-------------|
| sarah.johnson | Sarah Johnson | 2,850 | 12 | Top performer, biology major |
| emma.li | Emma Li | 2,340 | 10 | High performer, startup founder |
| david.kim | David Kim | 2,100 | 9 | High performer, game developer |
| mike.rivera | Mike Rivera | 1,890 | 8 | Active, engineering student |
| james.patel | James Patel | 1,450 | 6 | Mid-level, physics student |
| olivia.garcia | Olivia Garcia | 980 | 5 | Growing, art student |

## Notes

- Test data uses `test-univ-1` as the university ID
- All test IDs are prefixed with `test-` or `user-test-` for easy cleanup
- The seed creates realistic data distributions for testing UI states
- Reactions and friendships create realistic social graphs
