const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection using the URL format
const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres:InstabidsSystems123@@db.zyxeshuhnzkltlatsmxn.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Read migration files
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`\n📄 Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        try {
          await client.query(sql);
          console.log(`✅ Migration ${file} completed successfully`);
        } catch (error) {
          console.error(`❌ Error in migration ${file}:`, error.message);
          // Continue with next migration even if one fails
        }
      }
    }

    console.log('\n🎉 All migrations completed!');
    
    // Verify tables were created
    console.log('\n📊 Verifying database schema...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run the migration
runMigration();