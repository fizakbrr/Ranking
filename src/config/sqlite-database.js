const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

const initializeSQLiteDatabase = async () => {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'database.sqlite');
  
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('SQLite connection error:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = async () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Seasons table
      `CREATE TABLE IF NOT EXISTS seasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Divisions table
      `CREATE TABLE IF NOT EXISTS divisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        total_badges INTEGER DEFAULT 0,
        achievements TEXT DEFAULT '[]',
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Season history table
      `CREATE TABLE IF NOT EXISTS season_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        season_id INTEGER,
        division_id INTEGER,
        division_name TEXT NOT NULL,
        final_points INTEGER DEFAULT 0,
        final_level INTEGER DEFAULT 1,
        final_rank INTEGER,
        achievements TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (season_id) REFERENCES seasons(id),
        FOREIGN KEY (division_id) REFERENCES divisions(id)
      )`,
      
      // Admin users table
      `CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Point updates table
      `CREATE TABLE IF NOT EXISTS point_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        division_id INTEGER,
        points_change INTEGER NOT NULL,
        reason TEXT,
        updated_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (division_id) REFERENCES divisions(id)
      )`
    ];

    let completed = 0;
    const totalTables = tables.length;

    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Error creating table ${index + 1}:`, err);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === totalTables) {
          console.log('All SQLite tables created successfully');
          insertDefaultData().then(resolve).catch(reject);
        }
      });
    });
  });
};

const insertDefaultData = async () => {
  return new Promise((resolve, reject) => {
    // Check if default season exists
    db.get('SELECT id FROM seasons WHERE is_active = 1', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        // Create default season
        const defaultSeason = {
          name: 'Season 1',
          start_date: new Date().toISOString(),
          end_date: null,
          is_active: true
        };
        
        db.run(
          'INSERT INTO seasons (name, start_date, end_date, is_active) VALUES (?, ?, ?, ?)',
          [defaultSeason.name, defaultSeason.start_date, defaultSeason.end_date, defaultSeason.is_active],
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            console.log('Default season created');
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  });
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

const close = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('SQLite database connection closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initializeDatabase: initializeSQLiteDatabase,
  query,
  run,
  get,
  close
};
