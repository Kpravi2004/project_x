const db = require('../config/database');

exports.getProperties = async (req, res) => {
  try {
    const { land_type_id, district, minPrice, maxPrice, minArea, maxArea, search } = req.query;
    let query = `
      SELECT p.*, l.name as land_type_name 
      FROM properties p
      JOIN land_types l ON p.land_type_id = l.id
      WHERE p.status_id = (SELECT id FROM property_status WHERE status = 'approved')
    `;
    const params = [];

    if (land_type_id) {
      params.push(land_type_id);
      query += ` AND p.land_type_id = $${params.length}`;
    }
    if (district) {
      params.push(`%${district}%`);
      query += ` AND p.district ILIKE $${params.length}`;
    }
    if (minPrice) {
      params.push(minPrice);
      query += ` AND p.price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND p.price <= $${params.length}`;
    }
    if (minArea) {
      params.push(minArea);
      query += ` AND p.area >= $${params.length}`;
    }
    if (maxArea) {
      params.push(maxArea);
      query += ` AND p.area <= $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.village ILIKE $${params.length})`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getProperties error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT p.*, l.name as land_type_name, u.name as owner_name, u.phone as owner_phone  
      FROM properties p
      JOIN land_types l ON p.land_type_id = l.id
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getPropertyById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProperty = async (req, res) => {
  const sanitize = (val) => (val === '' || val === undefined) ? null : val;

  try {
    const {
      title, description, land_type_id, price, area, address, 
      city, district, state, patta_number, survey_number, subdivision_number, village, taluk,
      // Contact Details
      contact_person_name, contact_phone, contact_email, contact_address,
      // Residential
      plot_shape, road_width, facing, water_connection, electricity_connection, approval_status,
      approval_number, gated_community, corner_plot, landmarks,
      // Agricultural
      soil_type, water_availability, irrigation_type, electricity_available, tree_type, tree_stage,
      soil_depth, road_access_type, distance_from_highway, fencing_details
    } = req.body;
    const owner_id = req.user.id;

    const statusRes = await db.query("SELECT id FROM property_status WHERE status = 'pending'");
    const status_id = statusRes.rows[0].id;

    const query = `
      INSERT INTO properties (
        title, description, land_type_id, owner_id, status_id, 
        price, area, address, city, district, state, 
        patta_number, survey_number, subdivision_number, village, taluk,
        contact_person_name, contact_phone, contact_email, contact_address,
        plot_shape, road_width, facing, water_connection, electricity_connection, approval_status,
        soil_type, water_availability, irrigation_type, electricity_available, tree_type, tree_stage,
        soil_depth, road_access_type, distance_from_highway, fencing_details,
        approval_number, gated_community, corner_plot, landmarks
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40
      ) RETURNING id
    `;
    const values = [
      title, description, land_type_id, owner_id, status_id, 
      sanitize(price), sanitize(area), address, city, district, state, 
      patta_number, survey_number, subdivision_number, village, taluk,
      contact_person_name, contact_phone, contact_email, contact_address,
      plot_shape, sanitize(road_width), facing, sanitize(water_connection), sanitize(electricity_connection), approval_status,
      soil_type, sanitize(water_availability), irrigation_type, sanitize(electricity_available), tree_type, tree_stage,
      sanitize(soil_depth), road_access_type, sanitize(distance_from_highway), fencing_details,
      approval_number, sanitize(gated_community), sanitize(corner_plot), landmarks
    ];
    
    const result = await db.query(query, values);
    res.status(201).json({ id: result.rows[0].id, message: 'Property created and pending verification' });
  } catch (err) {
    console.error('createProperty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const result = await db.query(`
      SELECT p.*, l.name as land_type_name, ps.status
      FROM properties p
      JOIN land_types l ON p.land_type_id = l.id
      JOIN property_status ps ON p.status_id = ps.id
      WHERE p.owner_id = $1
      ORDER BY p.created_at DESC
    `, [owner_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitAmenities = async (req, res) => {
  const { id } = req.params;
  const { amenities } = req.body; // Expecting { counts: {...}, distances: {...} }

  try {
    const pendingStatus = await db.query("SELECT id FROM property_status WHERE status = 'pending'");
    
    await db.query(`
      UPDATE properties SET 
        user_provided_amenities = $1,
        status_id = $2
      WHERE id = $3 AND owner_id = $4
    `, [JSON.stringify(amenities), pendingStatus.rows[0].id, id, req.user.id]);

    res.json({ message: 'Amenities submitted and property returned to pending status' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
