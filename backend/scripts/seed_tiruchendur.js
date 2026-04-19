const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const seedTiruchendur = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/tiruchendur_properties.json');
    if (!fs.existsSync(dataPath)) {
      console.error('Data file not found at:', dataPath);
      return;
    }

    const properties = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    await client.connect();
    console.log('Connected to database for Tiruchendur seeding...');

    // Get IDs for Residentail land type and pending status
    const landTypeRes = await client.query("SELECT id FROM land_types WHERE name = 'Residential'");
    const statusPending = await client.query("SELECT id FROM property_status WHERE status = 'pending'");

    const landTypeId = landTypeRes.rows[0]?.id || 2;
    const statusId = statusPending.rows[0]?.id || 1;
    const adminId = 1; // Assuming Admin ID is 1

    for (const prop of properties) {
      console.log(`Seeding: ${prop.basic_information.title}`);

      // Insert into properties
      const propQuery = `
        INSERT INTO properties (
          title, description, price, area, address, city, district, state,
          location, land_type_id, status_id, owner_id,
          patta_number, survey_number, subdivision_number, village, taluk,
          contact_person_name, contact_phone, contact_email, contact_address,
          plot_shape, road_width, facing, water_connection, electricity_connection,
          approval_status, approval_number, gated_community, corner_plot, landmarks,
          distance_to_cbd_km, nearest_bus_distance_m, nearest_railway_distance_m,
          nearest_school_distance_m, nearest_hospital_distance_m, nearest_park_distance_m,
          nearest_supermarket_distance_m, nearest_water_body_distance_m,
          schools_1km_count, hospitals_2km_count, restaurants_1km_count, banks_1km_count,
          user_provided_amenities
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          ST_SetSRID(ST_MakePoint($9, $10), 4326), $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22,
          $23, $24, $25, $26, $27,
          $28, $29, $30, $31, $32,
          $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45
        ) RETURNING id;
      `;

      const values = [
        prop.basic_information.title,
        prop.basic_information.description,
        prop.basic_information.price,
        prop.basic_information.area,
        prop.location.address,
        prop.location.city,
        prop.location.district,
        prop.location.state,
        prop.location.longitude, // Point(lng, lat)
        prop.location.latitude,
        landTypeId,
        statusId,
        adminId,
        prop.patta_info?.patta_number || null,
        prop.patta_info?.survey_number || null,
        prop.patta_info?.subdivision_number || null,
        prop.patta_info?.village || prop.location.city,
        prop.patta_info?.taluk || 'Tiruchendur',
        prop.contact.name,
        prop.contact.phone,
        prop.contact.email,
        prop.contact.address,
        prop.residential_features.plot_shape,
        parseFloat(prop.residential_features.road_width) || 20,
        prop.residential_features.facing,
        prop.residential_features.water_connection === 'Yes',
        prop.residential_features.electricity_connection === 'Yes',
        prop.residential_features.approval_status,
        prop.residential_features.approval_number,
        prop.residential_features.gated_community === 'Yes',
        prop.residential_features.corner_plot === 'Yes',
        prop.residential_features.landmarks,
        prop.amenities_distances.distance_to_city_center_km,
        Math.round(prop.amenities_distances.nearest_bus_stop_km * 1000),
        Math.round(prop.amenities_distances.nearest_railway_station_km * 1000),
        Math.round(prop.amenities_distances.nearest_school_km * 1000),
        Math.round(prop.amenities_distances.nearest_hospital_km * 1000),
        Math.round(prop.amenities_distances.nearest_park_km * 1000),
        Math.round(prop.amenities_distances.nearest_supermarket_km * 1000),
        Math.round(prop.amenities_distances.nearest_water_body_km * 1000),
        prop.amenities_distances.schools_within_1km,
        prop.amenities_distances.hospitals_within_2km,
        prop.amenities_distances.restaurants_within_1km,
        prop.amenities_distances.banks_within_1km,
        JSON.stringify({ note: prop.amenities_distances.user_provided_amenities })
      ];

      const res = await client.query(propQuery, values);
      const propertyId = res.rows[0].id;

      // Seed matching Patta for verification
      const pattaQuery = `
        INSERT INTO mock_patta (
          patta_number, district, taluk, village, survey_number, subdivision_number,
          owner_name, area, land_type, latitude, longitude
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING;
      `;
      const pattaValues = [
        prop.patta_info?.patta_number,
        prop.location.district,
        prop.patta_info?.taluk || 'Tiruchendur',
        prop.patta_info?.village || prop.location.city,
        prop.patta_info?.survey_number,
        prop.patta_info?.subdivision_number,
        prop.contact.name,
        prop.basic_information.area,
        'Residential',
        prop.location.latitude,
        prop.location.longitude
      ];
      await client.query(pattaQuery, pattaValues);

      // Seed Media
      if (prop.media && prop.media.images && prop.media.images.length > 0) {
        for (const img of prop.media.images) {
          await client.query(
            "INSERT INTO media (property_id, url, type, is_primary) VALUES ($1, $2, $3, $4)",
            [propertyId, `/uploads/${img}`, 'image', img === prop.media.primary_cover_photo]
          );
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
};

seedTiruchendur();
