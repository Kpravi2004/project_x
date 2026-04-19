const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const deleteAgricultural = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to database for agricultural cleanup.');

    // 1. Delete media for agricultural properties
    console.log('Deleting media references for agricultural properties...');
    await client.query(`
      DELETE FROM media 
      WHERE property_id IN (SELECT id FROM properties WHERE land_type_id = 1)
    `);

    // 2. Delete verification/patta requests for agricultural properties if any
    // (Assuming mock_patta isn't linked by foreign key but by survey number, 
    // but let's check links if any). 
    // Our seeding script created mock_patta for residential. 
    // Let's delete properties with land_type_id = 1.

    const deleteProps = await client.query('DELETE FROM properties WHERE land_type_id = 1');
    console.log(`Deleted ${deleteProps.rowCount} agricultural properties.`);

    const deleteType = await client.query('DELETE FROM land_types WHERE id = 1');
    console.log('Deleted Agricultural land type.');

    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await client.end();
  }
};

deleteAgricultural();
