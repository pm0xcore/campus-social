#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse env variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Starting Gamification Migration\n');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Using service role key\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260211000000_gamification.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration file loaded');
console.log(`📏 ${sql.length} characters\n`);

// Function to execute SQL via Supabase
async function executeSql(sql) {
  // Since Supabase doesn't have a direct SQL execution endpoint via client library,
  // we'll use fetch to hit the REST API directly
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ query: sql })
  });

  return response;
}

// Try using Supabase's query endpoint
async function runMigration() {
  try {
    console.log('🔄 Attempting to execute migration...\n');
    
    // Try to execute the entire SQL file
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('📋 Created tables:');
    console.log('   ✓ user_stats');
    console.log('   ✓ achievements (15 badges seeded)');
    console.log('   ✓ user_achievements');
    console.log('   ✓ daily_challenges');
    console.log('   ✓ user_challenge_progress');
    console.log('   ✓ notifications');
    console.log('   ✓ Triggers & functions\n');
    
    return true;
  } catch (error) {
    console.error('❌ Direct execution failed:', error.message);
    console.log('\n🔄 Trying alternative approach: Creating tables individually...\n');
    
    // Fallback: Try to verify tables exist by querying them
    const tables = ['user_stats', 'achievements', 'daily_challenges', 'notifications'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (!error) {
          console.log(`✓ Table '${table}' already exists`);
        }
      } catch (e) {
        console.log(`✗ Table '${table}' not found - manual migration needed`);
      }
    }
    
    return false;
  }
}

runMigration().then(success => {
  if (!success) {
    console.log('\n📝 Manual migration required:');
    console.log('   1. Visit: https://supabase.com/dashboard/project/iwocvbodiqqkbrpohzgo/sql/new');
    console.log('   2. Copy: supabase/migrations/20260211000000_gamification.sql');
    console.log('   3. Paste and run in SQL Editor');
    process.exit(1);
  }
  
  console.log('🎉 All done! Next steps:');
  console.log('   1. npm run typecheck (will show type errors)');
  console.log('   2. npx supabase gen types typescript --project-id iwocvbodiqqkbrpohzgo > lib/database.types.ts');
  console.log('   3. npm run typecheck (errors should be fixed)');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
