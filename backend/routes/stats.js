const express = require('express');
const router = express.Router();
const VEHICLES = require('../constants/vehicles');

// Détecter quel type de DB on utilise
function getDbType() {
  try {
    const { getDb } = require('../database');
    const db = getDb();
    return db && typeof db.prepare === 'function' ? 'sqljs' : 'sqlite3';
  } catch (err) {
    return 'sqlite3';
  }
}

// Wrapper pour les requêtes
function query(sql, params = []) {
  const dbType = getDbType();

  if (dbType === 'sqljs') {
    const { getDb } = require('../database');
    const db = getDb();
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } else {
    const db = require('../database');
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// GET - Liste des joueurs humains uniques
router.get('/players', async (req, res) => {
  try {
    const players = await query(`
      SELECT DISTINCT driver_name,
             COUNT(DISTINCT race_history_id) as total_races,
             SUM(total_laps) as total_laps
      FROM race_participants
      WHERE is_player = 1
      GROUP BY driver_name
      ORDER BY total_races DESC, driver_name
    `);

    res.json(players);
  } catch (err) {
    console.error('Erreur récupération joueurs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Stats détaillées d'un joueur par circuit
router.get('/players/:name/tracks', async (req, res) => {
  try {
    const playerName = decodeURIComponent(req.params.name);

    // Récupérer les stats du joueur par circuit
    const playerStats = query(`
      SELECT
        rh.track_name,
        rh.track_id,
        MIN(rp.best_lap_time) as personal_best,
        SUM(rp.total_laps) as total_laps,
        COUNT(DISTINCT rp.race_history_id) as races_count
      FROM race_participants rp
      INNER JOIN race_history rh ON rp.race_history_id = rh.id
      WHERE rp.driver_name = ? AND rp.is_player = 1 AND rp.best_lap_time > 0
      GROUP BY rh.track_name
      ORDER BY rh.track_name
    `, [playerName]);

    // Pour chaque circuit, récupérer les infos supplémentaires
    const tracksWithDetails = playerStats.map((track) => {
      // Récupérer le véhicule utilisé pour le meilleur temps
      const vehicleResult = query(`
        SELECT rp.vehicle_id
        FROM race_participants rp
        INNER JOIN race_history rh ON rp.race_history_id = rh.id
        WHERE rp.driver_name = ?
          AND rh.track_name = ?
          AND rp.best_lap_time = ?
        LIMIT 1
      `, [playerName, track.track_name, track.personal_best]);

      const vehicleId = vehicleResult[0]?.vehicle_id;

      // Récupérer le meilleur temps du serveur sur ce circuit
      const serverBestResult = query(`
        SELECT rp.best_lap_time as server_best, rp.driver_name as server_best_driver
        FROM race_participants rp
        INNER JOIN race_history rh ON rp.race_history_id = rh.id
        WHERE rh.track_name = ? AND rp.is_player = 1 AND rp.best_lap_time > 0
        ORDER BY rp.best_lap_time ASC
        LIMIT 1
      `, [track.track_name]);

      const serverBest = serverBestResult[0]?.server_best || 0;
      const serverBestDriver = serverBestResult[0]?.server_best_driver || '';

      // Récupérer le nom du véhicule
      const vehicleName = VEHICLES[vehicleId]?.name || 'Inconnu';
      const vehicleClass = VEHICLES[vehicleId]?.class || '';

      return {
        track_name: track.track_name,
        track_id: track.track_id,
        personal_best: track.personal_best,
        server_best: serverBest,
        server_best_driver: serverBestDriver,
        is_server_record: track.personal_best === serverBest && track.personal_best > 0,
        total_laps: track.total_laps,
        races_count: track.races_count,
        vehicle_name: vehicleName,
        vehicle_class: vehicleClass,
        vehicle_id: vehicleId
      };
    });

    res.json(tracksWithDetails);
  } catch (err) {
    console.error('Erreur récupération stats joueur:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Records du serveur par circuit (tous les meilleurs temps)
router.get('/records', (req, res) => {
  try {
    // Récupérer le meilleur temps par circuit
    const records = query(`
      SELECT
        rh.track_name,
        rp.best_lap_time as best_time,
        rp.driver_name as record_holder,
        rp.vehicle_id
      FROM race_participants rp
      INNER JOIN race_history rh ON rp.race_history_id = rh.id
      WHERE rp.is_player = 1 AND rp.best_lap_time > 0
        AND rp.best_lap_time = (
          SELECT MIN(rp2.best_lap_time)
          FROM race_participants rp2
          INNER JOIN race_history rh2 ON rp2.race_history_id = rh2.id
          WHERE rh2.track_name = rh.track_name AND rp2.is_player = 1 AND rp2.best_lap_time > 0
        )
      GROUP BY rh.track_name
      ORDER BY rh.track_name
    `);

    // Ajouter les noms de véhicules
    const recordsWithVehicles = records.map(record => ({
      ...record,
      vehicle_name: VEHICLES[record.vehicle_id]?.name || 'Inconnu',
      vehicle_class: VEHICLES[record.vehicle_id]?.class || ''
    }));

    res.json(recordsWithVehicles);
  } catch (err) {
    console.error('Erreur récupération records:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
