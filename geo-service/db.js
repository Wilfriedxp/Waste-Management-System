// db.js
const { Pool } = require('pg');

// Connect to your PostGIS database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'waste_management_db',
    password: 'RONALDXP.COM', // <--- PUT YOUR PASSWORD HERE
    port: 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};