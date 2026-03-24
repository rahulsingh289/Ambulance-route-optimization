const db = require('../db/connection');

// GET /locations — all locations
const getAllLocations = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM locations');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /locations/:id — single location
const getLocationById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Location not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /locations — add location
const addLocation = async (req, res) => {
    try {
        const { name, latitude, longitude, region, is_remote } = req.body;
        if (!name || !latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'name, latitude, longitude are required' });
        }
        const [result] = await db.query(
            'INSERT INTO locations (name, latitude, longitude, region, is_remote) VALUES (?, ?, ?, ?, ?)',
            [name, latitude, longitude, region || null, is_remote || false]
        );
        res.status(201).json({ success: true, message: 'Location added', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /locations/:id — update location
const updateLocation = async (req, res) => {
    try {
        const { name, latitude, longitude, region, is_remote } = req.body;
        const [check] = await db.query('SELECT id FROM locations WHERE id = ?', [req.params.id]);
        if (!check.length) return res.status(404).json({ success: false, message: 'Location not found' });
        await db.query(
            'UPDATE locations SET name=?, latitude=?, longitude=?, region=?, is_remote=? WHERE id=?',
            [name, latitude, longitude, region, is_remote, req.params.id]
        );
        res.json({ success: true, message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /locations/:id — remove location
const deleteLocation = async (req, res) => {
    try {
        await db.query('DELETE FROM locations WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Location deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAllLocations, getLocationById, addLocation, updateLocation, deleteLocation };
