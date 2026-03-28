const db = require('../config/database');

// Helper to get status ID by name
const getStatusId = async (statusName) => {
  const res = await db.query('SELECT id FROM property_status WHERE status = $1', [statusName]);
  if (res.rows.length === 0) throw new Error(`Status ${statusName} not found`);
  return res.rows[0].id;
};

// Helper to sanitize numeric fields (convert empty string to null)
const sanitizeNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// ========================
// 1. Create or update a draft property (phase saving)
// ========================
exports.createOrUpdateDraft = async (req, res) => {
  const { propertyId, ...fields } = req.body;
  const owner_id = req.user.id;

  try {
    // If no propertyId, create a new draft
    if (!propertyId) {
      // --- VALIDATE AREA BEFORE INSERT ---
      const area = sanitizeNumber(fields.area);
      if (area !== null) {
        if (fields.land_type_id === 1) { // agricultural
          if (area < 0.5) {
            return res.status(400).json({ message: 'Agricultural land area must be at least 0.5 acres' });
          }
        } else { // residential
          if (area < 100) {
            return res.status(400).json({ message: 'Residential land area must be at least 100 sq ft' });
          }
        }
      }

      const draftStatusId = await getStatusId('draft');
      const insertQuery = `
        INSERT INTO properties (
          owner_id, status_id, title, description, land_type_id, price, area,
          district, taluk, village, address, survey_number, subdivision_number,
          contact_person_name, contact_phone, contact_email, contact_address,
          plot_shape, road_width, facing, water_connection, electricity_connection, approval_status,
          soil_type, water_availability, irrigation_type, electricity_available, tree_type, tree_stage,
          soil_depth, road_access_type, distance_from_highway, fencing_details,
          approval_number, gated_community, corner_plot, landmarks
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)
        RETURNING id
      `;
      const values = [
        owner_id, draftStatusId,
        fields.title, fields.description, fields.land_type_id,
        sanitizeNumber(fields.price), sanitizeNumber(fields.area),
        fields.district, fields.taluk, fields.village, fields.address,
        fields.survey_number, fields.subdivision_number,
        fields.contact_person_name, fields.contact_phone, fields.contact_email, fields.contact_address,
        fields.plot_shape, sanitizeNumber(fields.road_width), fields.facing,
        fields.water_connection, fields.electricity_connection, fields.approval_status,
        fields.soil_type, fields.water_availability, fields.irrigation_type, fields.electricity_available,
        fields.tree_type, fields.tree_stage,
        sanitizeNumber(fields.soil_depth), fields.road_access_type, sanitizeNumber(fields.distance_from_highway),
        fields.fencing_details,
        fields.approval_number, fields.gated_community, fields.corner_plot, fields.landmarks
      ];
      const result = await db.query(insertQuery, values);
      return res.status(201).json({ id: result.rows[0].id, message: 'Draft created' });
    }

    // Update existing draft
    const propCheck = await db.query('SELECT status_id FROM properties WHERE id = $1 AND owner_id = $2', [propertyId, owner_id]);
    if (propCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }

    const draftStatusId = await getStatusId('draft');
    if (propCheck.rows[0].status_id !== draftStatusId) {
      return res.status(400).json({ message: 'Property cannot be updated after submission' });
    }

    // Build dynamic update query – only update fields that are provided
    const allowedFields = [
      'title', 'description', 'land_type_id', 'price', 'area',
      'district', 'taluk', 'village', 'address', 'survey_number', 'subdivision_number',
      'contact_person_name', 'contact_phone', 'contact_email', 'contact_address',
      'plot_shape', 'road_width', 'facing', 'water_connection', 'electricity_connection', 'approval_status',
      'soil_type', 'water_availability', 'irrigation_type', 'electricity_available', 'tree_type', 'tree_stage',
      'soil_depth', 'road_access_type', 'distance_from_highway', 'fencing_details',
      'approval_number', 'gated_community', 'corner_plot', 'landmarks'
    ];
    const setClauses = [];
    const values = [];
    let paramIdx = 1;
    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        let value = fields[field];
        // Sanitize numeric fields
        if (['price', 'area', 'road_width', 'soil_depth', 'distance_from_highway'].includes(field)) {
          value = sanitizeNumber(value);
        }
        setClauses.push(`${field} = $${paramIdx}`);
        values.push(value);
        paramIdx++;
      }
    }
    if (setClauses.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    values.push(propertyId);
    const query = `UPDATE properties SET ${setClauses.join(', ')} WHERE id = $${paramIdx}`;
    await db.query(query, values);
    res.json({ id: propertyId, message: 'Draft updated' });
  } catch (err) {
    console.error('createOrUpdateDraft error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// 2. Finalize draft: change status to pending and save media
// ========================
exports.finalizeProperty = async (req, res) => {
  const { propertyId } = req.body;
  const owner_id = req.user.id;

  try {
    const draftStatusId = await getStatusId('draft');
    const propRes = await db.query(
      'SELECT * FROM properties WHERE id = $1 AND owner_id = $2 AND status_id = $3',
      [propertyId, owner_id, draftStatusId]
    );
    if (propRes.rows.length === 0) {
      return res.status(404).json({ message: 'Draft property not found' });
    }

    // Change status to pending
    const pendingStatusId = await getStatusId('pending');
    await db.query('UPDATE properties SET status_id = $1 WHERE id = $2', [pendingStatusId, propertyId]);

    // Save media files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : (file.mimetype.startsWith('video/') ? 'video' : 'document');
        await db.query(
          'INSERT INTO media (property_id, url, type, is_primary) VALUES ($1, $2, $3, $4)',
          [propertyId, `/uploads/${file.filename}`, fileType, false]
        );
      }
    }

    res.json({ id: propertyId, message: 'Property submitted for verification' });
  } catch (err) {
    console.error('finalizeProperty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// 3. List approved properties (public view)
// ========================
exports.getProperties = async (req, res) => {
  try {
    const { land_type_id, district, minPrice, maxPrice, minArea, maxArea, search } = req.query;
    let query = `
      SELECT p.id, p.title, p.description, p.price, p.area, p.district, p.village,
             p.land_type_id, l.name as land_type_name,
             p.created_at, p.updated_at
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

// ========================
// 4. Get single property by ID (with access control)
// ========================
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
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    const property = result.rows[0];

    // Fetch media
    const mediaRes = await db.query(
      'SELECT id, url, type, is_primary FROM media WHERE property_id = $1 ORDER BY is_primary DESC, created_at',
      [id]
    );
    property.media = mediaRes.rows;

    // Determine access level
    const isOwner = req.user && (req.user.id === property.owner_id);
    const isAdmin = req.user && req.user.role === 'admin';
    property.is_owner = isOwner;
    property.is_admin = isAdmin;

    // Remove sensitive fields for non‑owner / non‑admin
    if (!isOwner && !isAdmin) {
      const sensitiveFields = [
        'contact_person_name', 'contact_phone', 'contact_email', 'contact_address',
        'patta_number', 'survey_number', 'subdivision_number',
        'patta_document_url', 'fmb_sketch_url',
        'owner_phone', 'owner_name',
        'verified_at', 'verified_by', 'owner_id'
      ];
      for (const field of sensitiveFields) {
        delete property[field];
      }
    }

    res.json(property);
  } catch (err) {
    console.error('getPropertyById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// 5. Get user's own properties
// ========================
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

// ========================
// 6. User submits manual amenities (fallback) – MERGES with existing
// ========================
exports.submitAmenities = async (req, res) => {
  const { id } = req.params;
  const { amenities } = req.body; // { counts: {...}, distances: {...} }
  const owner_id = req.user.id;

  try {
    // Fetch existing user_provided_amenities
    const propRes = await db.query('SELECT user_provided_amenities FROM properties WHERE id = $1 AND owner_id = $2', [id, owner_id]);
    if (propRes.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    let existing = propRes.rows[0].user_provided_amenities || { counts: {}, distances: {} };
    
    // Merge new data with existing
    const merged = {
      counts: { ...existing.counts, ...amenities.counts },
      distances: { ...existing.distances, ...amenities.distances }
    };
    
    const pendingStatus = await db.query("SELECT id FROM property_status WHERE status = 'pending'");
    await db.query(`
      UPDATE properties SET 
        user_provided_amenities = $1,
        status_id = $2,
        missing_amenities = NULL
      WHERE id = $3 AND owner_id = $4
    `, [JSON.stringify(merged), pendingStatus.rows[0].id, id, owner_id]);

    res.json({ message: 'Amenities submitted and property returned to pending status' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};