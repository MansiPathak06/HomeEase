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

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Neon requires TLS. Its pooler certificate is validated by the platform;
    // this setting also works on Render images with incomplete CA bundles.
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  keepAlive: true,
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

module.exports = { pool, testConnection };
