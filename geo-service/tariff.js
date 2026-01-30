const express = require('express');
const router = express.Router();
const db = require('./db');

// --- 1. READ ALL RULES (User Viewing) ---
// Used to show available tariff types (e.g., Standard, Heavy Duty)
router.get('/rules', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM pricing_rules ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching rules" });
    }
});

// --- 2. CREATE RULE (Company Only - LT03) ---
// Adds a new pricing model to the database
router.post('/rules', async (req, res) => {
    const { name, base_fee_xaf, cost_per_km, cost_per_kg } = req.body;
    
    // validation
    if (!name || !base_fee_xaf) {
        return res.status(400).json({ error: "Name and Base Fee are required" });
    }

    try {
        const result = await db.query(
            'INSERT INTO pricing_rules (name, base_fee_xaf, cost_per_km, cost_per_kg) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, base_fee_xaf, cost_per_km || 0, cost_per_kg || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating rule" });
    }
});

// --- 3. UPDATE RULE (Company Only - LT03) ---
// Edits an existing pricing rule (e.g., increasing the cost per km)
router.put('/rules/:id', async (req, res) => {
    const { id } = req.params;
    const { name, base_fee_xaf, cost_per_km, cost_per_kg } = req.body;

    try {
        const result = await db.query(
            `UPDATE pricing_rules 
             SET name = COALESCE($1, name), 
                 base_fee_xaf = COALESCE($2, base_fee_xaf), 
                 cost_per_km = COALESCE($3, cost_per_km), 
                 cost_per_kg = COALESCE($4, cost_per_kg)
             WHERE id = $5 RETURNING *`,
            [name, base_fee_xaf, cost_per_km, cost_per_kg, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Rule not found" });
        }

        res.json({ message: "Tariff updated successfully", rule: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating rule" });
    }
});

// --- 4. DELETE RULE (Company Only - LT03) ---
// Removes a pricing rule from the system
router.delete('/rules/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM pricing_rules WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Rule not found" });
        }

        res.json({ message: "Tariff rule deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting rule" });
    }
});

// --- 5. CALCULATE PRICE (Inter-Service Logic) ---
// Formula: Base + (Dist_km * Cost_km) + (Weight * Cost_kg)
router.post('/calculate', async (req, res) => {
    const { userLat, userLng, siteId, weight, ruleId } = req.body;

    try {
        // A. Get the Site Location and the Pricing Rule
        const siteQuery = `SELECT location FROM deposition_sites WHERE id = $1`;
        const ruleQuery = `SELECT * FROM pricing_rules WHERE id = $1`;

        const siteRes = await db.query(siteQuery, [siteId]);
        const ruleRes = await db.query(ruleQuery, [ruleId || 1]); // Default to rule 1

        if (siteRes.rows.length === 0) return res.status(404).json({error: "Site not found"});
        if (ruleRes.rows.length === 0) return res.status(404).json({error: "Pricing rule not found"});

        const rule = ruleRes.rows[0];

        // B. Use PostGIS to calculate exact distance (in meters)
        const distQuery = `
            SELECT ST_Distance(
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                $3::geography
            ) as meters
        `;
        const distRes = await db.query(distQuery, [userLng, userLat, siteRes.rows[0].location]);
        
        const distanceMeters = distRes.rows[0].meters;
        const distanceKm = distanceMeters / 1000;

        // C. Apply the Formula
        const transportCost = distanceKm * parseFloat(rule.cost_per_km);
        const weightCost = weight * parseFloat(rule.cost_per_kg);
        const totalCost = parseFloat(rule.base_fee_xaf) + transportCost + weightCost;

        res.json({
            site_id: siteId,
            distance_km: distanceKm.toFixed(2),
            weight_kg: weight,
            details: {
                base_fee: rule.base_fee_xaf,
                transport_cost: Math.round(transportCost),
                weight_cost: Math.round(weightCost)
            },
            total_price_xaf: Math.ceil(totalCost) // Round up to nearest whole franc
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Calculation failed" });
    }
});

module.exports = router;