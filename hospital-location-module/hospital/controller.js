const db = require('../db/connection');
const { binarySearchByName, haversineDistance, mergeSortByDistance } = require('./utils');

// GET /hospitals — fetch all hospitals
const getAllHospitals = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM hospitals WHERE is_active = TRUE');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /hospitals/:id — fetch single hospital
const getHospitalById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM hospitals WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Hospital not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /hospitals/search?name=xyz — binary search by name
const searchHospitalByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ success: false, message: 'Name query required' });

        const [rows] = await db.query('SELECT * FROM hospitals WHERE is_active = TRUE ORDER BY name ASC');
        const result = binarySearchByName(rows, name);

        if (!result) return res.status(404).json({ success: false, message: 'Hospital not found' });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /hospitals/nearest?lat=x&lng=y — find nearest hospital by coordinates
const getNearestHospital = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (isNaN(parsedLat) || isNaN(parsedLng) ||
            parsedLat < -90 || parsedLat > 90 ||
            parsedLng < -180 || parsedLng > 180) {
            return res.status(400).json({ success: false, message: 'Invalid lat/lng values' });
        }

        const [rows] = await db.query('SELECT * FROM hospitals WHERE is_active = TRUE AND available_beds > 0');
        if (!rows.length) return res.status(404).json({ success: false, message: 'No hospitals available' });

        const withDistance = rows.map(h => ({
            ...h,
            distance_km: haversineDistance(parsedLat, parsedLng, h.latitude, h.longitude)
        }));

        // Sort by distance using merge sort
        const sorted = mergeSortByDistance(withDistance);
        res.json({ success: true, data: sorted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /hospitals — add new hospital
const addHospital = async (req, res) => {
    try {
        const { name, address, latitude, longitude, contact, specialization, available_beds } = req.body;
        if (!name || !address || !latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'name, address, latitude, longitude are required' });
        }
        const parsedLat = parseFloat(latitude);
        const parsedLng = parseFloat(longitude);
        if (isNaN(parsedLat) || isNaN(parsedLng) ||
            parsedLat < -90 || parsedLat > 90 ||
            parsedLng < -180 || parsedLng > 180) {
            return res.status(400).json({ success: false, message: 'Invalid latitude or longitude values' });
        }
        const [result] = await db.query(
            'INSERT INTO hospitals (name, address, latitude, longitude, contact, specialization, available_beds) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, address, parsedLat, parsedLng, contact, specialization, available_beds || 0]
        );
        res.status(201).json({ success: true, message: 'Hospital added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /hospitals/:id — update hospital
const updateHospital = async (req, res) => {
    try {
        const { name, address, latitude, longitude, contact, specialization, available_beds, is_active } = req.body;
        const [check] = await db.query('SELECT id FROM hospitals WHERE id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ success: false, message: 'Hospital not found' });
        await db.query(
            'UPDATE hospitals SET name=?, address=?, latitude=?, longitude=?, contact=?, specialization=?, available_beds=?, is_active=? WHERE id=?',
            [name, address, latitude, longitude, contact, specialization, available_beds, is_active, req.params.id]
        );
        res.json({ success: true, message: 'Hospital updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /hospitals/:id — soft delete
const deleteHospital = async (req, res) => {
    try {
        await db.query('UPDATE hospitals SET is_active = FALSE WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Hospital deactivated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAllHospitals, getHospitalById, searchHospitalByName, getNearestHospital, addHospital, updateHospital, deleteHospital };
