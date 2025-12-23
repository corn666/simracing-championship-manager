const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Déterminer le dossier de la base de données et du wasm
const isPkg = typeof process.pkg !== 'undefined';
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;
const dbPath = path.join(baseDir, 'gt3_championship.db');

// Chemin du fichier wasm
const wasmPath = isPkg 
  ? path.join(baseDir, 'sql-wasm.wasm')
  : path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

let db;

// Fonction pour initialiser la base de données
async function initDatabase() {
  // Configurer sql.js pour charger le wasm depuis le bon endroit
  const SQL = await initSqlJs({
    locateFile: file => {
      if (file === 'sql-wasm.wasm') {
        return wasmPath;
      }
      return file;
    }
  });
  
  // Charger la DB si elle existe, sinon créer une nouvelle
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('Base de données chargée avec succès');
  } else {
    db = new SQL.Database();
    console.log('Nouvelle base de données créée');
  }
  
  // Créer les tables
  db.run(`
    CREATE TABLE IF NOT EXISTS pilots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_human INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS championships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      total_races INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS championship_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      championship_id INTEGER NOT NULL,
      pilot_id INTEGER NOT NULL,
      FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE CASCADE,
      FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
      UNIQUE(championship_id, pilot_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      circuit TEXT NOT NULL,
      event_date DATE NOT NULL,
      championship_id INTEGER,
      status TEXT DEFAULT 'upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      pilot_id INTEGER NOT NULL,
      position INTEGER,
      points INTEGER NOT NULL DEFAULT 0,
      status TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
      UNIQUE(event_id, pilot_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS race_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_index INTEGER,
      track_name TEXT NOT NULL,
      track_id INTEGER,
      start_time INTEGER,
      end_time INTEGER,
      duration INTEGER,
      total_laps INTEGER,
      total_drivers INTEGER,
      winner_name TEXT,
      winner_time INTEGER,
      fastest_lap_driver TEXT,
      fastest_lap_time INTEGER,
      total_collisions INTEGER DEFAULT 0,
      race_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS race_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_history_id INTEGER NOT NULL,
      participant_id INTEGER,
      driver_name TEXT NOT NULL,
      is_player INTEGER DEFAULT 0,
      vehicle_id INTEGER,
      final_position INTEGER,
      best_lap_time INTEGER,
      total_laps INTEGER,
      total_collisions INTEGER DEFAULT 0,
      status TEXT,
      FOREIGN KEY (race_history_id) REFERENCES race_history(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS race_laps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_history_id INTEGER NOT NULL,
      participant_id INTEGER,
      driver_name TEXT NOT NULL,
      lap_number INTEGER,
      lap_time INTEGER,
      sector1_time INTEGER,
      sector2_time INTEGER,
      sector3_time INTEGER,
      position INTEGER,
      FOREIGN KEY (race_history_id) REFERENCES race_history(id) ON DELETE CASCADE
    )
  `);
  
  // Table pour le roster d'IA de référence par championnat
  db.run(`
    CREATE TABLE IF NOT EXISTS championship_roster (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      championship_id INTEGER NOT NULL,
      pilot_id INTEGER NOT NULL,
      pilot_name TEXT NOT NULL,
      roster_position INTEGER NOT NULL,
      is_reference_race INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE CASCADE,
      FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
      UNIQUE(championship_id, pilot_id)
    )
  `);
  
  // Ajouter colonne event_id à race_history si elle n'existe pas
  try {
    db.run('ALTER TABLE race_history ADD COLUMN event_id INTEGER');
  } catch (err) {
    // Colonne existe déjà ou erreur, on continue
  }
  
  console.log('Tables créées avec succès');
  
  return db;
}

// Fonction pour sauvegarder la DB
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Sauvegarder toutes les 5 secondes
setInterval(() => {
  saveDatabase();
}, 5000);

// Sauvegarder à la fermeture
process.on('exit', saveDatabase);
process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});
process.on('SIGTERM', () => {
  saveDatabase();
  process.exit();
});

// Wrapper methods pour compatibilité avec l'API callback de sqlite3
function all(sql, params, callback) {
  try {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    if (callback) callback(null, rows);
    return rows;
  } catch (err) {
    if (callback) callback(err, null);
    throw err;
  }
}

function get(sql, params, callback) {
  try {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    let row = null;
    if (stmt.step()) {
      row = stmt.getAsObject();
    }
    stmt.free();
    if (callback) callback(null, row);
    return row;
  } catch (err) {
    if (callback) callback(err, null);
    throw err;
  }
}

function run(sql, params, callback) {
  try {
    if (params && params.length > 0) {
      db.run(sql, params);
    } else {
      db.run(sql);
    }
    const lastID = db.exec("SELECT last_insert_rowid()")[0]?.values[0][0] || 0;
    const result = { lastID };
    if (callback) callback.call(result, null);
    return result;
  } catch (err) {
    if (callback) callback(err);
    throw err;
  }
}

function prepare(sql) {
  const stmt = db.prepare(sql);
  return {
    run: function(...params) {
      try {
        stmt.bind(params);
        stmt.step();
        stmt.reset();
      } catch (err) {
        // Ignore
      }
    },
    finalize: function(callback) {
      stmt.free();
      if (callback) callback(null);
    }
  };
}

module.exports = { initDatabase, getDb: () => db, saveDatabase, all, get, run, prepare };
