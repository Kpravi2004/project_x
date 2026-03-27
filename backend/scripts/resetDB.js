const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function resetDB() {
  const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'sankar2005',
    port: process.env.DB_PORT || 5432,
    database: 'postgres'
  };

  console.log('Connecting to default postgres database...');
  const client1 = new Client(config);
  try {
    await client1.connect();
    
    // Terminate all connections to the target database
    console.log('Terminating existing connections to reali_estate...');
    await client1.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'reali_estate'
      AND pid <> pg_backend_pid()
    `);
    
    // Drop and recreate
    console.log('Dropping reali_estate database...');
    await client1.query('DROP DATABASE IF EXISTS reali_estate');
    console.log('Creating fresh reali_estate database...');
    await client1.query('CREATE DATABASE reali_estate');
    console.log('Database recreated successfully.');
  } catch (err) {
    console.error('Error resetting DB:', err.message);
  } finally {
    await client1.end();
  }

  // Now connect to the new database and run init.sql
  console.log('Connecting to fresh reali_estate database...');
  const client2 = new Client({ ...config, database: 'reali_estate' });
  try {
    await client2.connect();
    console.log('Running init.sql...');
    const sql = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf-8');
    await client2.query(sql);
    console.log('✅ init.sql executed successfully! Database is ready with sample patta data.');
    
    // Verify patta data
    const pattaRes = await client2.query('SELECT id, patta_number, district, survey_number, village FROM mock_patta');
    console.log(`\n📋 Mock Patta Records (${pattaRes.rows.length}):`);
    pattaRes.rows.forEach(r => {
      console.log(`   [${r.id}] ${r.patta_number} — Survey ${r.survey_number}, ${r.village}, ${r.district}`);
    });
    
    // Verify admin user
    const adminRes = await client2.query("SELECT email, role FROM users WHERE role = 'admin'");
    console.log(`\n👤 Admin User: ${adminRes.rows[0]?.email || 'NOT FOUND'}`);
    
  } catch (err) {
    console.error('Error executing init.sql:', err.message || err);
  } finally {
    await client2.end();
  }
}

resetDB();
