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
  ssl: useSSL ? { rejectUnauthorized: true } : undefined,
});

const query = async (text, params) => {
  try {
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Query text must be a non-empty string.');
    }

    return await pool.query({ text, values: Array.isArray(params) ? params : [] });
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err;
  }
};

module.exports = {
  query,
};
