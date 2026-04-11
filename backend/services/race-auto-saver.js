const fs = require('fs');
const path = require('path');
const { getTrackName } = require('../constants/tracks');

// Importer les fonctions query et execute depuis database
// Pour sqlite3 et sql.js
function getDbType() {
  try {
    const { getDb } = require('../database');
    const db = getDb();
    return db && typeof db.prepare === 'function' ? 'sqljs' : 'sqlite3';
  } catch (err) {
    return 'sqlite3';
  }
}

async function query(sql, params = []) {
  const dbType = getDbType();
  
  if (dbType === 'sqljs') {
    const { getDb } = require('../database');
    const db = getDb();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
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

async function execute(sql, params = []) {
  const dbType = getDbType();
  
  if (dbType === 'sqljs') {
    const { getDb, saveDatabase } = require('../database');
    const db = getDb();
    db.run(sql, params);
    saveDatabase();
    return { lastID: null };
  } else {
    const db = require('../database');
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      });
    });
  }
}

// Nettoyer et normaliser un nom pour le dédoublonnage
function cleanDriverName(name) {
  if (!name) return '';
  return String(name)
    .replace(/\s*\(AI\)\s*/gi, '')
    .replace(/^[0-9\s]+/, '')
    .trim();
}
function normalizeKey(name) {
  return cleanDriverName(name).toLowerCase();
}

// Dédoublonner les résultats : un pilote = une entrée (meilleure position, sinon plus de tours)
function dedupeResults(results) {
  const byKey = new Map();
  results.forEach((r, idx) => {
    const key = normalizeKey(r?.name) || `__anon_${idx}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, r);
      return;
    }
    const rPos = r?.attributes?.RacePosition;
    const ePos = existing?.attributes?.RacePosition;
    const rRank = Number.isFinite(rPos) && rPos > 0 && rPos < 999 ? rPos : 9999;
    const eRank = Number.isFinite(ePos) && ePos > 0 && ePos < 999 ? ePos : 9999;
    const rLap = r?.attributes?.Lap || 0;
    const eLap = existing?.attributes?.Lap || 0;
    if (rRank < eRank || (rRank === eRank && rLap > eLap)) {
      byKey.set(key, r);
    }
  });
  return Array.from(byKey.values());
}

class RaceAutoSaver {
  constructor() {
    this.checkInterval = 10000; // 10 secondes
    this.timer = null;
    this.isChecking = false;
    this.lastCheckedRaceKey = null;
    this.settingsPath = null;
  }

  // Démarrer la surveillance
  start() {
    console.log('🔍 Race Auto-Saver - Initialisation...');
    
    // Charger le chemin du fichier depuis les settings
    this.loadSettingsPath().then(() => {
      if (!this.settingsPath) {
        console.log('⚠️  Auto-Saver en attente - Configurez le chemin dans Settings');
        return;
      }
      
      console.log('✅ Auto-Saver démarré - Surveillance toutes les 10 secondes');
      
      // Première vérification immédiate
      this.checkForFinishedRace();
      
      // Puis toutes les 10 secondes
      this.timer = setInterval(() => {
        this.checkForFinishedRace();
      }, this.checkInterval);
    });
  }

  // Arrêter la surveillance
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('🛑 Race Auto-Saver arrêté');
    }
  }

  // Redémarrer après configuration du chemin
  restart() {
    this.stop();
    this.settingsPath = null; // Forcer rechargement
    this.start();
  }

  // Charger le chemin du fichier sms_stats_data.json
  async loadSettingsPath() {
    try {
      const settings = await query('SELECT value FROM settings WHERE key = ?', ['sms_stats_path']);
      if (settings.length > 0 && settings[0].value) {
        this.settingsPath = settings[0].value;
        console.log('📁 Chemin fichier SMS configuré:', this.settingsPath);
      }
    } catch (err) {
      console.error('Erreur chargement settings:', err);
    }
  }

  // Vérifier s'il y a une course terminée
  async checkForFinishedRace() {
    // Éviter les vérifications simultanées
    if (this.isChecking) return;
    
    this.isChecking = true;
    
    try {
      // Recharger le chemin si pas encore défini
      if (!this.settingsPath) {
        await this.loadSettingsPath();
        if (!this.settingsPath) {
          this.isChecking = false;
          return;
        }
      }

      // Vérifier que le fichier existe
      if (!fs.existsSync(this.settingsPath)) {
        this.isChecking = false;
        return;
      }

      // Lire le fichier JSON
      const content = fs.readFileSync(this.settingsPath, 'utf8');
      const lines = content.split('\n');
      const jsonContent = lines.filter(line => !line.trim().startsWith('//')).join('\n');
      const data = JSON.parse(jsonContent);
      
      if (!data.stats || !data.stats.history) {
        this.isChecking = false;
        return;
      }

      // Chercher la dernière course avec race1
      let lastRace = null;
      for (let i = data.stats.history.length - 1; i >= 0; i--) {
        if (data.stats.history[i].stages?.race1) {
          lastRace = data.stats.history[i];
          break;
        }
      }

      if (!lastRace) {
        this.isChecking = false;
        return;
      }

      // Créer une clé unique pour cette course
      const raceKey = `${lastRace.index}_${lastRace.start_time}`;

      // Si c'est la même course que la dernière fois, ne rien faire
      if (raceKey === this.lastCheckedRaceKey) {
        this.isChecking = false;
        return;
      }

      // Vérifier les critères de sauvegarde
      if (!this.shouldSaveRace(lastRace)) {
        this.isChecking = false;
        return;
      }

      // Vérifier si déjà en BDD
      const existing = await query(
        'SELECT id FROM race_history WHERE race_index = ? AND start_time = ?',
        [lastRace.index, lastRace.start_time]
      );

      if (existing.length > 0) {
        console.log(`ℹ️  Course ${raceKey} déjà en BDD - Ignorée`);
        this.lastCheckedRaceKey = raceKey;
        this.isChecking = false;
        return;
      }

      // Sauvegarder la course
      console.log(`💾 Nouvelle course complète détectée - Sauvegarde automatique...`);
      await this.saveRace(lastRace);
      this.lastCheckedRaceKey = raceKey;
      console.log(`✅ Course ${raceKey} sauvegardée avec succès !`);

    } catch (err) {
      console.error('❌ Erreur Auto-Saver:', err.message);
    } finally {
      this.isChecking = false;
    }
  }

  // Vérifier si une course doit être sauvegardée
  shouldSaveRace(race) {
    // Critère 1 : finished = true
    if (!race.finished) {
      return false;
    }

    // Critère 2 : race1 existe
    if (!race.stages?.race1) {
      return false;
    }

    // Critère 3 : Au moins 6 tours complétés (par au moins un participant)
    const results = Object.values(race.stages.race1.results || {});
    const maxLaps = Math.max(...results.map(r => r.attributes?.Lap || 0));
    
    if (maxLaps < 6) {
      console.log(`⏭️  Course ignorée - Seulement ${maxLaps} tours (minimum 6)`);
      return false;
    }

    // Critère 4 : Au moins 2 participants
    if (results.length < 2) {
      console.log(`⏭️  Course ignorée - Seulement ${results.length} participant(s)`);
      return false;
    }

    return true;
  }

  // Sauvegarder une course (code copié de race-history.js)
  async saveRace(raceData) {
    const setup = raceData.setup;
    const raceSession = raceData.stages.race1;
    const results = dedupeResults(Object.values(raceSession.results || {}));

    // Trouver le vainqueur
    const winner = results.find(r => r.attributes.RacePosition === 1);
    
    // Trouver le meilleur tour
    let fastestLapTime = Infinity;
    let fastestDriver = '';
    results.forEach(r => {
      if (r.attributes.FastestLapTime > 0 && r.attributes.FastestLapTime < fastestLapTime) {
        fastestLapTime = r.attributes.FastestLapTime;
        fastestDriver = r.name;
      }
    });

    // Compter les collisions
    const { totalCollisions, collisionsByDriver } = this.countCollisions(raceSession, raceData.participants);

    // Créer un résumé léger
    const raceSummary = {
      index: raceData.index,
      finished: raceData.finished,
      start_time: raceData.start_time,
      end_time: raceData.end_time,
      setup: {
        TrackId: setup.TrackId,
        TrackName: getTrackName(setup.TrackId),
        RaceLength: setup.RaceLength,
        WeatherSlot1: setup.WeatherSlot1,
        SessionSetup: setup.SessionSetup
      },
      winner: {
        name: winner?.name.replace(' (AI)', '') || 'N/A',
        totalTime: winner?.attributes.TotalTime || 0
      },
      fastestLap: {
        driver: fastestDriver.replace(' (AI)', ''),
        time: fastestLapTime
      },
      totalCollisions: totalCollisions
    };

    // Insérer la course
    const raceResult = await execute(`
      INSERT INTO race_history (
        race_index, track_name, track_id, start_time, end_time, duration,
        total_laps, total_drivers, winner_name, winner_time,
        fastest_lap_driver, fastest_lap_time, total_collisions, race_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      raceData.index,
      getTrackName(setup.TrackId),
      setup.TrackId,
      raceData.start_time,
      raceData.end_time,
      raceData.end_time - raceData.start_time,
      setup.RaceLength,
      results.length,
      winner?.name.replace(' (AI)', '') || 'N/A',
      winner?.attributes.TotalTime || 0,
      fastestDriver.replace(' (AI)', ''),
      fastestLapTime,
      totalCollisions,
      JSON.stringify(raceSummary)
    ]);

    // Récupérer l'ID
    let raceHistoryId = raceResult.lastID;
    if (!raceHistoryId) {
      const lastIdResult = await query('SELECT MAX(id) as id FROM race_history');
      raceHistoryId = lastIdResult[0].id;
    }

    // Insérer les participants
    for (const result of results) {
      const participantCollisions = collisionsByDriver[result.participantid] || 0;

      const cleanName = cleanDriverName(result.name);

      // Récupérer is_player depuis raceData.participants
      const participant = raceData.participants?.[result.participantid];
      const isPlayer = participant?.IsPlayer === true || participant?.is_player === true || false;

      await execute(`
        INSERT INTO race_participants (
          race_history_id, participant_id, driver_name, is_player, vehicle_id,
          final_position, best_lap_time, total_laps, total_collisions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        raceHistoryId,
        result.participantid,
        cleanName,
        isPlayer ? 1 : 0,
        result.attributes.VehicleId || null,
        result.attributes.RacePosition,
        result.attributes.FastestLapTime,
        result.attributes.Lap,
        participantCollisions,
        result.attributes.State
      ]);
    }

    // Insérer tous les tours
    const lapEvents = (raceSession.events || [])
      .filter(e => e.event_name === 'Lap')
      .sort((a, b) => {
        if (a.participantid !== b.participantid) {
          return a.participantid - b.participantid;
        }
        return a.attributes.Lap - b.attributes.Lap;
      });
    
    for (const lapEvent of lapEvents) {
      const participant = raceData.participants[lapEvent.participantid];
      if (!participant) continue;
      
      const cleanName = participant.Name
        .replace(' (AI)', '')
        .replace(/^[0-9\s]+/, '')
        .trim();
      
      await execute(`
        INSERT INTO race_laps (
          race_history_id, participant_id, driver_name,
          lap_number, lap_time, sector1_time, sector2_time, sector3_time, position
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        raceHistoryId,
        lapEvent.participantid,
        cleanName,
        lapEvent.attributes.Lap,
        lapEvent.attributes.LapTime,
        lapEvent.attributes.Sector1Time,
        lapEvent.attributes.Sector2Time,
        lapEvent.attributes.Sector3Time,
        lapEvent.attributes.RacePosition
      ]);
    }
  }

  // Compter les collisions
  countCollisions(raceSession, participants) {
    const impacts = (raceSession.events || []).filter(e => e.event_name === 'Impact');
    const totalCollisions = impacts.length;
    const collisionsByDriver = {};
    
    if (participants) {
      Object.keys(participants).forEach(pid => {
        collisionsByDriver[pid] = 0;
      });
      
      impacts.forEach(impact => {
        const pid = impact.participantid;
        if (pid !== undefined) {
          if (!collisionsByDriver[pid]) {
            collisionsByDriver[pid] = 0;
          }
          collisionsByDriver[pid]++;
        }
      });
    }
    
    return { totalCollisions, collisionsByDriver };
  }
}

// Export singleton
module.exports = new RaceAutoSaver();
