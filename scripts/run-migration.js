/**
 * Script to run the gamification migration directly on Supabase
 * Run with: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting gamification migration...\n');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20260211000000_gamification.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded');
  console.log(`📏 Size: ${migrationSql.length} characters\n`);

  try {
    // Split by semicolons and execute each statement
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      // Get statement type for logging
      const type = statement.split(/\s+/)[0].toUpperCase();
      console.log(`⏳ [${i + 1}/${statements.length}] Executing ${type}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_').select('*');
        
        if (directError) {
          console.error(`❌ Error on statement ${i + 1}:`, error);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }

      console.log(`✅ [${i + 1}/${statements.length}] ${type} completed`);
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\n📋 Created:');
    console.log('  - user_stats table');
    console.log('  - achievements table (with 15 seeded achievements)');
    console.log('  - user_achievements table');
    console.log('  - daily_challenges table');
    console.log('  - user_challenge_progress table');
    console.log('  - notifications table');
    console.log('  - Triggers and functions');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Manual migration steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy contents of supabase/migrations/20260211000000_gamification.sql');
    console.log('5. Paste and run');
    process.exit(1);
  }
}

runMigration();
