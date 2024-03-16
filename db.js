const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // Specify the database port in your .env file, typically 5432 for PostgreSQL
});

// Function to query the database
const query = async (text, params) => {
    try {
        console.log(`Executing query: ${text}`);
        const res = await pool.query(text, params);
        console.log('Query executed successfully');
        return res;
    } catch (err) {
        console.error('Error executing query:', err.stack);
        throw err;
    }
};

// Export the query function for use in other parts of the application
module.exports = {
    query,
};
