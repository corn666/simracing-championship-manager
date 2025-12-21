const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initDatabase, getDb, saveDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(bodyParser.json());

// Système de points (position -> points)
const POINTS_SYSTEM = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8, 7: 6, 8: 4, 9: 2, 10: 1
};

// Helpers pour sql.js
function query(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

function execute(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  saveDatabase();
}

function getLastInsertId() {
  const db = getDb();
  const result = db.exec("SELECT last_insert_rowid() as id");
  return result[0].values[0][0];
}

// ============ SERVIR LE FRONTEND ============
app.use(express.static(path.join(__dirname, 'public')));

// ============ ROUTES PILOTES ============

app.get('/api/pilots', (req, res) => {
  try {
    const rows = query('SELECT * FROM pilots ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pilots', (req, res) => {
  const { name, is_human } = req.body;
  try {
    execute('INSERT INTO pilots (name, is_human) VALUES (?, ?)', [name, is_human ? 1 : 0]);
    const id = getLastInsertId();
    res.json({ id, name, is_human });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pilots/:id', (req, res) => {
  try {
    execute('DELETE FROM pilots WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pilote supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ROUTES CHAMPIONNATS ============

app.get('/api/championships', (req, res) => {
  try {
    const rows = query('SELECT * FROM championships ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/championships/:id', (req, res) => {
  const championshipId = req.params.id;
  try {
    const championship = queryOne('SELECT * FROM championships WHERE id = ?', [championshipId]);
    if (!championship) return res.status(404).json({ error: 'Championnat non trouvé' });
    
    const participants = query(`
      SELECT p.* FROM pilots p
      INNER JOIN championship_participants cp ON p.id = cp.pilot_id
      WHERE cp.championship_id = ?
      ORDER BY p.name
    `, [championshipId]);
    
    res.json({ ...championship, participants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/championships', (req, res) => {
  const { name, total_races, participant_ids } = req.body;
  try {
    execute('INSERT INTO championships (name, total_races) VALUES (?, ?)', [name, total_races]);
    const championshipId = getLastInsertId();
    
    if (participant_ids && participant_ids.length > 0) {
      participant_ids.forEach(pilotId => {
        execute('INSERT INTO championship_participants (championship_id, pilot_id) VALUES (?, ?)', [championshipId, pilotId]);
      });
    }
    
    res.json({ id: championshipId, name, total_races });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/championships/:id', (req, res) => {
  try {
    execute('DELETE FROM championships WHERE id = ?', [req.params.id]);
    res.json({ message: 'Championnat supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/championships/:id/standings', (req, res) => {
  const championshipId = req.params.id;
  try {
    const rows = query(`
      SELECT 
        p.id,
        p.name,
        p.is_human,
        COALESCE(SUM(CASE WHEN e.championship_id = ? THEN r.points ELSE 0 END), 0) as total_points,
        COUNT(DISTINCT CASE WHEN e.championship_id = ? THEN r.event_id ELSE NULL END) as races_completed
      FROM pilots p
      INNER JOIN championship_participants cp ON p.id = cp.pilot_id
      LEFT JOIN results r ON p.id = r.pilot_id
      LEFT JOIN events e ON r.event_id = e.id
      WHERE cp.championship_id = ?
      GROUP BY p.id, p.name, p.is_human
      ORDER BY total_points DESC, p.name
    `, [championshipId, championshipId, championshipId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ROUTES ÉVÉNEMENTS ============

app.get('/api/events', (req, res) => {
  try {
    const rows = query(`
      SELECT e.*, c.name as championship_name
      FROM events e
      LEFT JOIN championships c ON e.championship_id = c.id
      ORDER BY e.event_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  try {
    const event = queryOne(`
      SELECT e.*, c.name as championship_name
      FROM events e
      LEFT JOIN championships c ON e.championship_id = c.id
      WHERE e.id = ?
    `, [eventId]);
    
    if (!event) return res.status(404).json({ error: 'Événement non trouvé' });
    
    const results = query(`
      SELECT r.*, p.name as pilot_name, p.is_human
      FROM results r
      INNER JOIN pilots p ON r.pilot_id = p.id
      WHERE r.event_id = ?
      ORDER BY 
        CASE WHEN r.status IS NULL THEN 0 ELSE 1 END,
        r.position
    `, [eventId]);
    
    res.json({ ...event, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', (req, res) => {
  const { name, circuit, event_date, championship_id } = req.body;
  try {
    execute('INSERT INTO events (name, circuit, event_date, championship_id) VALUES (?, ?, ?, ?)', 
      [name, circuit, event_date, championship_id || null]);
    const id = getLastInsertId();
    res.json({ id, name, circuit, event_date, championship_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/events/:id/status', (req, res) => {
  const { status } = req.body;
  try {
    execute('UPDATE events SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Statut mis à jour' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', (req, res) => {
  try {
    execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Événement supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ROUTES RÉSULTATS ============

app.post('/api/events/:id/results', (req, res) => {
  const eventId = req.params.id;
  const { results } = req.body;
  
  try {
    execute('DELETE FROM results WHERE event_id = ?', [eventId]);
    
    results.forEach(result => {
      let points = 0;
      let position = null;
      let status = result.status || null;
      
      if (!status && result.position) {
        position = result.position;
        points = POINTS_SYSTEM[result.position] || 0;
      }
      
      execute('INSERT INTO results (event_id, pilot_id, position, points, status) VALUES (?, ?, ?, ?, ?)',
        [eventId, result.pilot_id, position, points, status]);
    });
    
    res.json({ message: 'Résultats enregistrés' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/championships/:id/events', (req, res) => {
  try {
    const rows = query('SELECT * FROM events WHERE championship_id = ? ORDER BY event_date DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route catch-all pour React Router (doit être en dernier)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur après initialisation de la DB
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('GT3 Championship Manager - Serveur demarre !');
    console.log('='.repeat(60));
    console.log('');
    console.log('Serveur accessible sur :');
    console.log(`   - Local:  http://localhost:${PORT}`);
    console.log(`   - Reseau: http://[votre-ip]:${PORT}`);
    console.log('');
    console.log('Base de donnees: gt3_championship.db');
    console.log('');
    console.log('Appuyez sur Ctrl+C pour arreter le serveur');
    console.log('='.repeat(60));
    console.log('');
  });
}).catch(err => {
  console.error('Erreur initialisation base de donnees:', err);
  process.exit(1);
});
