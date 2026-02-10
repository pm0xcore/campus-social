# Fix Discovery Issue

## Problem
Real users and seed users are in different universities, so they can't see each other in the discover page (which filters by university).

## Solution
Run this SQL in Supabase SQL Editor to put everyone in the same test university:

```sql
-- Update all real users to use the test university
UPDATE users 
SET university_id = '00000000-0000-0000-0000-000000000001'
WHERE university_id != '00000000-0000-0000-0000-000000000001' 
  OR university_id IS NULL;

-- Verify everyone is now in the same university
SELECT 
  ocid, 
  display_name, 
  university_id,
  (SELECT name FROM universities WHERE id = users.university_id) as university_name
FROM users
ORDER BY created_at;
```

All users should now show `Open Campus University` as their university, and everyone will appear in discover.
