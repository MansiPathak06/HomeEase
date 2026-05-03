// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   host:     process.env.DB_HOST,
//   user:     process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port:     process.env.DB_PORT || 5432,
// });

// const testConnection = async () => {
//   try {
//     const client = await pool.connect();
//     console.log('✅ PostgreSQL connected successfully');
//     client.release();
//   } catch (error) {
//     console.error('❌ Database connection failed:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { pool, testConnection };

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };