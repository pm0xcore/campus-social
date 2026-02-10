#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

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
const projectRef = 'iwocvbodiqqkbrpohzgo';

console.log('🚀 Starting Gamification Migration\n');
console.log('📍 Project:', projectRef);
console.log('🔑 Using service role key\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260211000000_gamification.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration file loaded');
console.log(`📏 ${sql.length} characters`);
console.log(`📊 ${sql.split(';').filter(s => s.trim()).length} SQL statements\n`);

// Use Supabase Management API to execute SQL
async function executeSqlViaManagementApi() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runMigration() {
  console.log('🔄 Executing migration via Supabase API...\n');
  
  try {
    const result = await executeSqlViaManagementApi();
    
    if (result.success) {
      console.log('✅ Migration executed successfully!\n');
    } else {
      console.log('⚠️  API returned:', result.statusCode);
      console.log('Response:', result.error?.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n📋 Please verify in Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/editor\n`);
  console.log('✓ Check for these tables:');
  console.log('   • user_stats');
  console.log('   • achievements');
  console.log('   • user_achievements');
  console.log('   • daily_challenges');
  console.log('   • user_challenge_progress');
  console.log('   • notifications\n');
  
  console.log('📝 If tables are missing, run manually:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('   Copy/paste: supabase/migrations/20260211000000_gamification.sql\n');
}

runMigration();
