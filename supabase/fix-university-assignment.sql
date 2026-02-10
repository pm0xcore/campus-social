-- Fix: Assign all test users to the same university as the real logged-in user
-- This ensures everyone shows up in discover together

-- Step 1: Find the test university (the one we seeded)
-- Step 2: Update the real user to use the test university instead

-- Update testtest.edu to use the test university
UPDATE users 
SET university_id = '00000000-0000-0000-0000-000000000001'
WHERE ocid = 'testtest.edu';

-- Update simonl.edu to use the test university 
UPDATE users 
SET university_id = '00000000-0000-0000-0000-000000000001'
WHERE ocid = 'simonl.edu';

-- Verify all users are now in the same university
SELECT 
  ocid, 
  display_name, 
  university_id,
  (SELECT name FROM universities WHERE id = users.university_id) as university_name
FROM users
ORDER BY created_at;
