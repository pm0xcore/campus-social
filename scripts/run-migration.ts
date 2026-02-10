import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  console.log('🚀 Starting gamification migration...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read migration file
  const migrationPath = join(process.cwd(), 'supabase/migrations/20260211000000_gamification.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded');
  console.log(`📏 ${sql.length} characters\n`);

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 5);

  console.log(`📊 Executing ${statements.length} SQL statements...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 50).replace(/\s+/g, ' ');
    
    try {
      const { data, error } = await supabase.rpc('exec', { query: statement });
      
      if (error) {
        console.error(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
        console.error(`   Error: ${error.message}\n`);
        errorCount++;
        
        // Continue on certain expected errors (like "already exists")
        if (!error.message.includes('already exists')) {
          throw error;
        }
      } else {
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        successCount++;
      }
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
      } else {
        console.error(`❌ Fatal error on statement ${i + 1}:`, err.message);
        throw err;
      }
    }
  }

  console.log(`\n✨ Migration completed!`);
  console.log(`   ✅ Success: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ⚠️  Errors: ${errorCount} (may be ignorable)`);
  }
}

runMigration().catch(err => {
  console.error('\n❌ Migration failed:', err);
  console.error('\n💡 Manual migration required:');
  console.log('   1. Visit: https://supabase.com/dashboard/project/iwocvbodiqqkbrpohzgo/sql/new');
  console.log('   2. Copy contents of: supabase/migrations/20260211000000_gamification.sql');
  console.log('   3. Paste and run in SQL Editor');
  process.exit(1);
});
