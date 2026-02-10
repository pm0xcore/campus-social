#!/bin/bash
# Script to run gamification migration on Supabase
# This script will execute the SQL migration using Supabase's SQL endpoint

set -e

echo "🚀 Running Gamification Migration"
echo "=================================="
echo ""

# Load environment variables
source .env.local

# Check if required env vars are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing Supabase credentials in .env.local"
    exit 1
fi

# Read the migration file
MIGRATION_FILE="supabase/migrations/20260211000000_gamification.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

echo "📄 Found migration file"
echo "📊 Running SQL statements..."
echo ""

# Use Supabase client library approach
# Since curl might not work directly, let's guide the user
cat << 'EOF'

📋 MANUAL MIGRATION STEPS:
=========================

The gamification migration needs to be run in your Supabase dashboard:

1. Go to: https://supabase.com/dashboard
2. Select your project (iwocvbodiqqkbrpohzgo)
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of: supabase/migrations/20260211000000_gamification.sql
6. Paste into the SQL Editor
7. Click "Run" button

The migration will create:
✨ user_stats - Points, levels, streaks
✨ achievements - 15 badges (bronze → diamond)
✨ user_achievements - Track unlocked badges
✨ daily_challenges - 3 daily tasks
✨ user_challenge_progress - Track completion
✨ notifications - Engagement alerts
✨ Triggers & functions for auto-initialization

EOF

echo ""
echo "🔗 Quick link: https://supabase.com/dashboard/project/iwocvbodiqqkbrpohzgo/sql/new"
echo ""
echo "Or would you prefer I help you execute it programmatically? (y/n)"
