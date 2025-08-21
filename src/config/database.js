const { Pool } = require('pg');
const sqliteDb = require('./sqlite-database');
const mockDb = require('./mock-database');

let pool;
let dbType;

const initializeDatabase = async () => {
  dbType = process.env.DB_TYPE || 'postgresql';
  
  if (dbType === 'mock') {
    console.log('Using mock database for development/demo');
    return await mockDb.initializeDatabase();
  } else if (dbType === 'sqlite') {
    console.log('Using SQLite database for local development');
    return await sqliteDb.initializeDatabase();
  } else {
    console.log('Using PostgreSQL database');
    return await initializePostgreSQL();
  }
};

const initializePostgreSQL = async () => {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'leaderboard_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();

    // Create tables if they don't exist
    await createPostgreSQLTables();
    await insertPostgreSQLDefaultData();
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const createPostgreSQLTables = async () => {
  // Create weeks table (replacing seasons)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS weeks (
      id SERIAL PRIMARY KEY,
      week_number INTEGER NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create divisions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS divisions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      total_badges INTEGER DEFAULT 0,
      achievements JSONB DEFAULT '[]'::jsonb,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create weekly_history table (replacing season_history)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS weekly_history (
      id SERIAL PRIMARY KEY,
      week_id INTEGER REFERENCES weeks(id),
      division_id INTEGER REFERENCES divisions(id),
      division_name VARCHAR(255) NOT NULL,
      final_points INTEGER DEFAULT 0,
      final_level INTEGER DEFAULT 1,
      final_rank INTEGER,
      achievements JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create admin_users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create point_updates table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS point_updates (
      id SERIAL PRIMARY KEY,
      division_id INTEGER REFERENCES divisions(id),
      points_change INTEGER NOT NULL,
      reason TEXT,
      updated_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const insertPostgreSQLDefaultData = async () => {
  try {
    // Check if current week exists
    const weekResult = await pool.query(
      'SELECT id FROM weeks WHERE status = $1',
      ['active']
    );

    if (weekResult.rows.length === 0) {
      // Create current week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      
      const weekNumber = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      
      await pool.query(
        'INSERT INTO weeks (week_number, start_date, end_date, status) VALUES ($1, $2, $3, $4)',
        [weekNumber, startOfWeek, endOfWeek, 'active']
      );
      console.log('Current week created');
    }
  } catch (error) {
    console.error('Error inserting default data:', error);
    throw error;
  }
};

const query = async (sql, params = []) => {
  if (dbType === 'mock') {
    return await mockDb.query(sql, params);
  } else if (dbType === 'sqlite') {
    return await sqliteDb.query(sql, params);
  } else {
    const result = await pool.query(sql, params);
    return result.rows;
  }
};

const queryOne = async (sql, params = []) => {
  if (dbType === 'mock') {
    return await mockDb.queryOne(sql, params);
  } else if (dbType === 'sqlite') {
    return await sqliteDb.get(sql, params);
  } else {
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
  }
};

const execute = async (sql, params = []) => {
  if (dbType === 'mock') {
    return await mockDb.execute(sql, params);
  } else if (dbType === 'sqlite') {
    return await sqliteDb.run(sql, params);
  } else {
    const result = await pool.query(sql, params);
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    };
  }
};

const close = async () => {
  if (dbType === 'mock') {
    return await mockDb.close();
  } else if (dbType === 'sqlite') {
    return await sqliteDb.close();
  } else if (pool) {
    await pool.end();
    console.log('PostgreSQL connection pool closed');
  }
};

module.exports = {
  initializeDatabase,
  query,
  queryOne,
  execute,
  close,
  pool: () => pool
};
