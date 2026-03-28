const db = require('../config/database');
const mockPattaService = require('../services/mockPattaService');
const geoapifyService = require('../services/geoapifyService');
const predictionController = require('./predictionController');

// Helper to mock the req/res for internal controller call
const internalPredict = async (propertyId, amenitiesData) => {
  const mockReq = { body: { property_id: propertyId, amenities_data: amenitiesData } };
  let result = null;
  const mockRes = {
    json: (data) => { result = data; },
    status: () => ({ json: (data) => { result = data; } })
  };
  await predictionController.predictPrice(mockReq, mockRes);
  return result;
};

// GET /api/admin/pending-properties
exports.getPendingProperties = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, l.name as land_type_name, u.name as owner_name 
      FROM properties p
      JOIN land_types l ON p.land_type_id = l.id
      JOIN users u ON p.owner_id = u.id
      JOIN property_status ps ON p.status_id = ps.id
      WHERE ps.status = 'pending'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// POST /api/admin/verify-property/:id
exports.verifyProperty = async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  
  try {
    if (!approved) {
      const rejectedStatus = await db.query("SELECT id FROM property_status WHERE status = 'rejected'");
      await db.query("UPDATE properties SET status_id = $1 WHERE id = $2", [rejectedStatus.rows[0].id, id]);
      return res.json({ message: 'Property rejected' });
    }

    const propRes = await db.query("SELECT * FROM properties WHERE id = $1", [id]);
    const property = propRes.rows[0];

    // 1. Verify against mock_patta using survey_number, village, taluk, district
    const pattaRes = await db.query(`
      SELECT * FROM mock_patta 
      WHERE survey_number = $1 AND village = $2 AND taluk = $3 AND district = $4
    `, [property.survey_number, property.village, property.taluk, property.district]);

    if (pattaRes.rows.length === 0) {
      // Check if user has provided manual amenities
      if (property.user_provided_amenities) {
        console.log('No Patta match, but user provided manual amenities. Proceeding with manual data.');
        const amenities = property.user_provided_amenities;
        const prediction = await internalPredict(id, amenities);
        const approvedStatus = await db.query("SELECT id FROM property_status WHERE status = 'approved'");
        
        await db.query(`
          UPDATE properties SET 
            amenities_data = $1,
            amenity_credits = $2,
            predicted_price = $3,
            status_id = $4,
            verified_at = NOW(),
            verified_by = $5
          WHERE id = $6
        `, [JSON.stringify(amenities), JSON.stringify(prediction.breakdown || {}), prediction.predicted_price, approvedStatus.rows[0].id, req.user.id, id]);

        // Record in price_history
        await db.query(`
          INSERT INTO price_history (property_id, price, predicted_price, amenity_credits, source)
          VALUES ($1, $2, $3, $4, 'user_amenities')
        `, [id, property.price, prediction.predicted_price, JSON.stringify(prediction.breakdown || {})]);

        return res.json({ 
          message: 'Property verified using user-provided amenities',
          prediction: prediction
        });
      }
      return res.status(400).json({ 
        message: 'Property details do not match official records (Patta not found). You can request manual details from the user.',
        allow_manual_request: true 
      });
    }
    const pattaInfo = pattaRes.rows[0];

    // 2. Use existing amenities if already fetched, otherwise fetch new
    let amenities;
    if (property.amenities_data && Object.keys(property.amenities_data.counts || {}).length > 0) {
      amenities = property.amenities_data;
    } else {
      try {
        amenities = await geoapifyService.fetchAmenities(pattaInfo.latitude, pattaInfo.longitude);
      } catch (apiErr) {
        console.error('Geoapify failed:', apiErr);
        if (property.user_provided_amenities) {
          amenities = property.user_provided_amenities;
        } else {
          return res.status(400).json({ 
            message: 'Failed to fetch automatic amenities and no manual data available.',
            allow_manual_request: true
          });
        }
      }
    }

    // 3. Predict Price
    const prediction = await internalPredict(id, amenities);

    const approvedStatus = await db.query("SELECT id FROM property_status WHERE status = 'approved'");

    // --- UPDATE includes patta fields from mock record ---
    const updateQuery = `
      UPDATE properties SET 
        location = ST_SetSRID(ST_MakePoint($1, $2), 4326),
        patta_number = $3,
        survey_number = $4,
        subdivision_number = $5,
        amenities_data = $6,
        amenity_credits = $7,
        predicted_price = $8,
        status_id = $9,
        verified_at = NOW(),
        verified_by = $10
      WHERE id = $11
    `;

    const values = [
      pattaInfo.longitude, pattaInfo.latitude,
      pattaInfo.patta_number, pattaInfo.survey_number, pattaInfo.subdivision_number,
      JSON.stringify(amenities),
      JSON.stringify(prediction.breakdown || {}),
      prediction.predicted_price,
      approvedStatus.rows[0].id, req.user.id, id
    ];

    await db.query(updateQuery, values);

    // Record in price_history
    await db.query(`
      INSERT INTO price_history (property_id, price, predicted_price, amenity_credits, source)
      VALUES ($1, $2, $3, $4, 'patta_verified')
    `, [id, property.price, prediction.predicted_price, JSON.stringify(prediction.breakdown || {})]);

    res.json({ 
      message: 'Property verified and approved successfully',
      prediction: prediction
    });
  } catch (err) {
    console.error('verifyProperty error:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// POST /api/admin/request-amenities/:id
exports.requestAmenities = async (req, res) => {
  const { id } = req.params;
  const { note, missingCategories } = req.body; // missingCategories is an array

  try {
    const statusRes = await db.query("SELECT id FROM property_status WHERE status = 'amenities_requested'");
    if (statusRes.rows.length === 0) throw new Error('amenities_requested status not found');

    await db.query(`
      UPDATE properties SET 
        status_id = $1,
        amenities_request_note = $2,
        missing_amenities = $3
      WHERE id = $4
    `, [statusRes.rows[0].id, note, JSON.stringify(missingCategories), id]);

    res.json({ message: 'Requested amenities from user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/admin/fetch-amenities/:id
exports.fetchAmenitiesForProperty = async (req, res) => {
  const { id } = req.params;
  try {
    const propRes = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (propRes.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    const property = propRes.rows[0];

    // Get coordinates: either from property.location or mock_patta
    let lat, lng;
    if (property.location) {
      const locRes = await db.query('SELECT ST_Y(location) as lat, ST_X(location) as lng FROM properties WHERE id = $1', [id]);
      lat = locRes.rows[0].lat;
      lng = locRes.rows[0].lng;
    } else {
      const pattaRes = await db.query(`
        SELECT * FROM mock_patta 
        WHERE survey_number = $1 AND village = $2 AND taluk = $3 AND district = $4
      `, [property.survey_number, property.village, property.taluk, property.district]);
      if (pattaRes.rows.length === 0) {
        return res.status(400).json({ message: 'No coordinates available. Please request manual amenities.' });
      }
      lat = pattaRes.rows[0].latitude;
      lng = pattaRes.rows[0].longitude;
    }

    // Fetch amenities
    const amenities = await geoapifyService.fetchAmenities(lat, lng);
    const prediction = await internalPredict(id, amenities);

    // Update property with amenities and prediction, keep status unchanged
    await db.query(`
      UPDATE properties SET 
        amenities_data = $1,
        amenity_credits = $2,
        predicted_price = $3
      WHERE id = $4
    `, [JSON.stringify(amenities), JSON.stringify(prediction.breakdown || {}), prediction.predicted_price, id]);

    res.json({ message: 'Amenities fetched and stored', amenities, prediction });
  } catch (err) {
    console.error('fetchAmenitiesForProperty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/properties
exports.getAllProperties = async (req, res) => {
  try {
    const { land_type_id, status, search } = req.query;
    let query = `
      SELECT p.*, l.name as land_type_name, u.name as owner_name, ps.status
      FROM properties p
      JOIN land_types l ON p.land_type_id = l.id
      JOIN users u ON p.owner_id = u.id
      JOIN property_status ps ON p.status_id = ps.id
      WHERE 1=1
    `;
    const params = [];

    if (land_type_id) {
      params.push(land_type_id);
      query += ` AND p.land_type_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND ps.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.patta_number ILIKE $${params.length} OR p.survey_number ILIKE $${params.length})`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// PUT /api/admin/properties/:id
exports.updateProperty = async (req, res) => {
  const { id } = req.params;
  const fields = ['title', 'price', 'area', 'description', 'address', 'district', 'city', 'state', 'patta_number', 'survey_number', 'village', 'taluk'];
  const updateFields = [];
  const values = [];
  let paramIdx = 1;

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updateFields.push(`${field} = $${paramIdx}`);
      values.push(req.body[field]);
      paramIdx++;
    }
  }

  if (updateFields.length === 0) return res.status(400).json({ message: 'No safe fields provided' });

  values.push(id);
  const query = `UPDATE properties SET ${updateFields.join(', ')} WHERE id = $${paramIdx}`;

  try {
    const result = await db.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// GET /api/admin/check-match/:id
exports.checkMatch = async (req, res) => {
  const { id } = req.params;
  try {
    const propRes = await db.query("SELECT * FROM properties WHERE id = $1", [id]);
    if (propRes.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    const property = propRes.rows[0];

    const pattaRes = await db.query(`
      SELECT * FROM mock_patta 
      WHERE survey_number = $1 AND village = $2 AND taluk = $3 AND district = $4
    `, [property.survey_number, property.village, property.taluk, property.district]);

    if (pattaRes.rows.length === 0) {
      return res.json({ match: false, property });
    }
    
    const patta = pattaRes.rows[0];
    res.json({ 
      match: true, 
      property, 
      patta,
      coordinates: { latitude: patta.latitude, longitude: patta.longitude }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/admin/properties/:id
exports.deleteProperty = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};