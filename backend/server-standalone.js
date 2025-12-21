const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(bodyParser.json());

// Système de points (position -> points)
const POINTS_SYSTEM = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8, 7: 6, 8: 4, 9: 2, 10: 1
};

// ============ SERVIR LE FRONTEND ============
// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'public')));

// ============ ROUTES PILOTES ============

// Récupérer tous les pilotes
app.get('/api/pilots', (req, res) => {
  db.all('SELECT * FROM pilots ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Ajouter un pilote
app.post('/api/pilots', (req, res) => {
  const { name, is_human } = req.body;
  
  db.run(
    'INSERT INTO pilots (name, is_human) VALUES (?, ?)',
    [name, is_human ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, is_human });
    }
  );
});

// Supprimer un pilote
app.delete('/api/pilots/:id', (req, res) => {
  db.run('DELETE FROM pilots WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pilote supprimé' });
  });
});

// ============ ROUTES CHAMPIONNATS ============

// Récupérer tous les championnats
app.get('/api/championships', (req, res) => {
  db.all('SELECT * FROM championships ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Récupérer un championnat avec ses participants
app.get('/api/championships/:id', (req, res) => {
  const championshipId = req.params.id;
  
  db.get('SELECT * FROM championships WHERE id = ?', [championshipId], (err, championship) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!championship) return res.status(404).json({ error: 'Championnat non trouvé' });
    
    db.all(
      `SELECT p.* FROM pilots p
       INNER JOIN championship_participants cp ON p.id = cp.pilot_id
       WHERE cp.championship_id = ?
       ORDER BY p.name`,
      [championshipId],
      (err, participants) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ...championship, participants });
      }
    );
  });
});

// Créer un championnat
app.post('/api/championships', (req, res) => {
  const { name, total_races, participant_ids } = req.body;
  
  db.run(
    'INSERT INTO championships (name, total_races) VALUES (?, ?)',
    [name, total_races],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const championshipId = this.lastID;
      
      // Ajouter les participants
      if (participant_ids && participant_ids.length > 0) {
        const stmt = db.prepare('INSERT INTO championship_participants (championship_id, pilot_id) VALUES (?, ?)');
        
        participant_ids.forEach(pilotId => {
          stmt.run(championshipId, pilotId);
        });
        
        stmt.finalize();
      }
      
      res.json({ id: championshipId, name, total_races });
    }
  );
});

// Supprimer un championnat
app.delete('/api/championships/:id', (req, res) => {
  db.run('DELETE FROM championships WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Championnat supprimé' });
  });
});

// Récupérer le classement d'un championnat
app.get('/api/championships/:id/standings', (req, res) => {
  const championshipId = req.params.id;
  
  db.all(
    `SELECT 
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
     ORDER BY total_points DESC, p.name`,
    [championshipId, championshipId, championshipId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ============ ROUTES ÉVÉNEMENTS ============

// Récupérer tous les événements
app.get('/api/events', (req, res) => {
  db.all(
    `SELECT e.*, c.name as championship_name
     FROM events e
     LEFT JOIN championships c ON e.championship_id = c.id
     ORDER BY e.event_date DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Récupérer un événement avec ses résultats
app.get('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  db.get(
    `SELECT e.*, c.name as championship_name
     FROM events e
     LEFT JOIN championships c ON e.championship_id = c.id
     WHERE e.id = ?`,
    [eventId],
    (err, event) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!event) return res.status(404).json({ error: 'Événement non trouvé' });
      
      db.all(
        `SELECT r.*, p.name as pilot_name, p.is_human
         FROM results r
         INNER JOIN pilots p ON r.pilot_id = p.id
         WHERE r.event_id = ?
         ORDER BY 
           CASE WHEN r.status IS NULL THEN 0 ELSE 1 END,
           r.position`,
        [eventId],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ ...event, results });
        }
      );
    }
  );
});

// Créer un événement
app.post('/api/events', (req, res) => {
  const { name, circuit, event_date, championship_id } = req.body;
  
  db.run(
    'INSERT INTO events (name, circuit, event_date, championship_id) VALUES (?, ?, ?, ?)',
    [name, circuit, event_date, championship_id || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, circuit, event_date, championship_id });
    }
  );
});

// Mettre à jour le statut d'un événement
app.patch('/api/events/:id/status', (req, res) => {
  const { status } = req.body;
  
  db.run(
    'UPDATE events SET status = ? WHERE id = ?',
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Statut mis à jour' });
    }
  );
});

// Supprimer un événement
app.delete('/api/events/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Événement supprimé' });
  });
});

// ============ ROUTES RÉSULTATS ============

// Sauvegarder les résultats d'une course
app.post('/api/events/:id/results', (req, res) => {
  const eventId = req.params.id;
  const { results } = req.body; // Array de { pilot_id, position, status }
  
  // Supprimer les anciens résultats
  db.run('DELETE FROM results WHERE event_id = ?', [eventId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Insérer les nouveaux résultats
    const stmt = db.prepare('INSERT INTO results (event_id, pilot_id, position, points, status) VALUES (?, ?, ?, ?, ?)');
    
    results.forEach(result => {
      let points = 0;
      let position = null;
      let status = result.status || null;
      
      // Si c'est un résultat normal (pas de statut spécial)
      if (!status && result.position) {
        position = result.position;
        points = POINTS_SYSTEM[result.position] || 0;
      }
      
      stmt.run(eventId, result.pilot_id, position, points, status);
    });
    
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Résultats enregistrés' });
    });
  });
});

// Récupérer les événements d'un championnat
app.get('/api/championships/:id/events', (req, res) => {
  db.all(
    `SELECT * FROM events 
     WHERE championship_id = ? 
     ORDER BY event_date DESC`,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Route catch-all pour React Router (doit être en dernier)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('🏁 GT3 Championship Manager - Serveur démarré !');
  console.log('='.repeat(60));
  console.log('');
  console.log(`📡 Serveur accessible sur :`);
  console.log(`   - Local:  http://localhost:${PORT}`);
  console.log(`   - Réseau: http://[votre-ip]:${PORT}`);
  console.log('');
  console.log(`💾 Base de données: ${path.join(__dirname, 'gt3_championship.db')}`);
  console.log('');
  console.log('🔥 Appuyez sur Ctrl+C pour arrêter le serveur');
  console.log('='.repeat(60));
  console.log('');
});
