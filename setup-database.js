import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up DevHood database...')
    
    // Read and execute initial schema
    console.log('📄 Running initial schema migration...')
    const schemaSQL = fs.readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL.split(';').filter(s => s.trim().length > 0)
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error && !error.message.includes('already exists')) {
        console.warn('Warning:', error.message)
      }
    }
    
    // Read and execute badges seed data
    console.log('🏆 Seeding badges...')
    const seedSQL = fs.readFileSync('./supabase/migrations/002_seed_badges.sql', 'utf8')
    
    const seedStatements = seedSQL.split(';').filter(s => s.trim().length > 0)
    for (const statement of seedStatements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error && !error.message.includes('already exists')) {
        console.warn('Warning:', error.message)
      }
    }
    
    console.log('✅ Database setup completed successfully!')
    console.log('🎉 You can now run: yarn dev')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    console.log('\n📋 Manual setup required:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the contents of: supabase/migrations/001_initial_schema.sql')
    console.log('4. Run the contents of: supabase/migrations/002_seed_badges.sql')
  }
}

setupDatabase()