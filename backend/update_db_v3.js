const db = require('./src/config/database');

async function updateDbV3() {
  try {
    console.log('Adding new columns to properties table (v3)...');
    const columns = [
      'subdivision_number VARCHAR(50)',
      'contact_person_name VARCHAR(200)',
      'contact_phone VARCHAR(20)',
      'contact_email VARCHAR(100)',
      'contact_address TEXT'
    ];

    for (const col of columns) {
      const colName = col.split(' ')[0];
      console.log(`Checking/Adding ${colName}...`);
      await db.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS ${col}`);
    }

    console.log('Database updated successfully (v3)!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating database:', err);
    process.exit(1);
  }
}

updateDbV3();
