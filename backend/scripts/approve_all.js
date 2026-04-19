const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const approveAll = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Locating approved status ID...');
    const statusRes = await client.query("SELECT id FROM property_status WHERE status = 'approved'");
    if (statusRes.rows.length === 0) throw new Error('Approved status not found');
    const approvedId = statusRes.rows[0].id;

    console.log(`Approving all properties in Tiruchendur (status_id = ${approvedId})...`);
    const updateRes = await client.query("UPDATE properties SET status_id = $1 WHERE city = 'Tiruchendur'", [approvedId]);
    console.log(`Successfully approved ${updateRes.rowCount} properties.`);
  } catch (err) {
    console.error('Error approving properties:', err);
  } finally {
    await client.end();
  }
};

approveAll();
