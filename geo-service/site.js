const express = require('express');
const router = express.Router();
const db = require('./db');

// --- READ (Used by Users & Other Services) ---
router.get('/', async (req, res) => {
    // ... (Keep your existing search/get logic here) ...
    // This endpoint allows the Collection Service to "view" site locations [cite: 77]
    const { search } = req.query;
    let query = `SELECT id, name, site_type, ST_AsGeoJSON(location) as geojson FROM deposition_sites`;
    if (search) query += ` WHERE name ILIKE '%${search}%'`;
    
    const result = await db.query(query);
    res.json(result.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.site_type,
        // ... parse geojson ...
        latitude: JSON.parse(row.geojson).coordinates[1],
        longitude: JSON.parse(row.geojson).coordinates[0]
    })));
});

// --- CREATE (LT03 - Company Only) ---
router.post('/', async (req, res) => {
    // ... (Keep your existing create logic) ...
});

// --- UPDATE (LT03 - Company Only) ---
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, site_type, status } = req.body;
    try {
        const query = `
            UPDATE deposition_sites 
            SET name = $1, site_type = $2, status = $3
            WHERE id = $4 RETURNING *
        `;
        const result = await db.query(query, [name, site_type, status, id]);
        if (result.rows.length === 0) return res.status(404).json({error: "Site not found"});
        res.json({ message: "Site updated", site: result.rows[0] });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// --- DELETE (LT03 - Company Only) ---
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM deposition_sites WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({error: "Site not found"});
        res.json({ message: "Site deleted successfully" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

module.exports = router;