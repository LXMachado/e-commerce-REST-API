const { Pool } = require('pg');
require('dotenv').config();

const dbPort = Number(process.env.DB_PORT || 5432);
const useSSL = process.env.DB_SSL === 'true';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: dbPort,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err;
  }
};

module.exports = {
  query,
};
