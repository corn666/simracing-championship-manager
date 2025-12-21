const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { getTrackName } = require('../constants/tracks');
const { getVehicleInfo } = require('../constants/vehicles');
const { fetchLivePositions } = require('../services/ams2-status-scraper');

// Détecter quel type de DB on utilise et wrapper pour query
async function queryOne(sql, params = []) {
  try {
    const { getDb } = require('../database');
    const db = getDb();
    
    // Si c'est sql.js
    if (db && typeof db.prepare === 'function') {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    }
  } catch (err) {
    // Si erreur, utiliser sqlite3
    const db = require('../database');
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

// Fonction pour obtenir le chemin du fichier depuis la BDD
async function getSmsStatsPath() {
  try {
    const setting = await queryOne('SELECT value FROM settings WHERE key = ?', ['sms_stats_path']);
    return setting ? setting.value : null;
  } catch (err) {
    console.error('Erreur lecture chemin SMS:', err);
    return null;
  }
}

// Parser le fichier JSON AMS2
function parseRaceData(jsonData) {
  try {
    // Trouver la dernière course avec des données (ou celle en cours)
    const history = jsonData.stats.history;
    
    // Chercher la dernière course qui a une session race1
    let lastRace = null;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].stages?.race1) {
        lastRace = history[i];
        break;
      }
    }
    
    if (!lastRace) {
      return null;
    }

    // Récupérer la session de course (race1)
    const raceSession = lastRace.stages.race1;
    if (!raceSession) {
      return null;
    }

    // Informations générales
    const setup = lastRace.setup;
    const participants = lastRace.participants;
    
    // Convertir participants object en array
    const participantsArray = Object.values(participants);
    
    // Récupérer les résultats
    const results = raceSession.results || {};
    const resultsArray = Object.values(results);
    
    // Créer un Map des résultats par participantId
    const resultsMap = {};
    resultsArray.forEach(r => {
      resultsMap[r.participantid] = r;
    });
    
    // Trouver le meilleur temps absolu
    let bestLapTime = Infinity;
    let fastestDriver = '';
    resultsArray.forEach(r => {
      if (r.attributes.FastestLapTime > 0 && r.attributes.FastestLapTime < bestLapTime) {
        bestLapTime = r.attributes.FastestLapTime;
        fastestDriver = r.name || 'Unknown';  // FIX: Protection contre undefined
      }
    });

    // Construire les données du tableau en combinant participants ET résultats
    const drivers = [];
    
    // D'abord, ajouter tous les participants avec résultats
    resultsArray
      .filter(r => r.attributes.State === 'Finished' || r.attributes.State === 'Racing')
      .forEach((result) => {
        const participant = participantsArray.find(p => p.refid === result.refid);
        drivers.push(createDriverEntry(result, participant, bestLapTime));
      });
    
    // Ensuite, ajouter les participants SANS résultats (DNS, DNF, etc.)
    participantsArray.forEach(p => {
      const hasResult = resultsArray.some(r => r.refid === p.refid);
      if (!hasResult) {
        // Créer un résultat fictif pour ce participant
        const fakeResult = {
          name: p.name || p.Name || 'Unknown',  // FIX: Protection contre undefined
          refid: p.refid,
          is_player: p.is_player,
          participantid: Object.keys(participants).find(key => participants[key].RefId === p.refid),
          attributes: {
            State: 'DNS',  // Did Not Start
            RacePosition: 999,
            FastestLapTime: 0,
            LapsCompleted: 0,
            TotalTime: 0,
            CurrentLap: 0,
            CurrentSector: 0,
            CurrentSector1Time: 0,
            CurrentSector2Time: 0,
            CurrentSector3Time: 0,
            VehicleId: p.vehicle_id || 0
          }
        };
        drivers.push(createDriverEntry(fakeResult, p, bestLapTime));
      }
    });
    
    // Trier par position
    drivers.sort((a, b) => {
      const posA = parseInt(a.pos);
      const posB = parseInt(b.pos);
      if (posA === 999) return 1;  // DNS à la fin
      if (posB === 999) return -1;
      return posA - posB;
    });
    
    // Fonction helper pour créer une entrée driver
    function createDriverEntry(result, participant, bestLapTime) {
      const attrs = result.attributes;
      const leaderTime = resultsArray[0]?.attributes.TotalTime || 0;
      const gap = attrs.TotalTime - leaderTime;
      
      // FIX: Convertir events en tableau si c'est un objet
      let eventsArray = [];
      if (raceSession.events) {
        if (Array.isArray(raceSession.events)) {
          eventsArray = raceSession.events;
        } else if (typeof raceSession.events === 'object') {
          eventsArray = Object.values(raceSession.events);
        }
      }
      
      // Récupérer le dernier événement "Lap" pour ce pilote
      const lapEvents = eventsArray
        .filter(e => e.event_name === 'Lap' && e.participantid === result.participantid)
        .sort((a, b) => b.time - a.time);
      
      const lastLapEvent = lapEvents[0];
      const lastLapTime = lastLapEvent?.attributes.LapTime || 0;
      const s1 = lastLapEvent?.attributes.Sector1Time || 0;
      const s2 = lastLapEvent?.attributes.Sector2Time || 0;
      const s3 = lastLapEvent?.attributes.Sector3Time || 0;
      
      const vehicleInfo = getVehicleInfo(attrs.VehicleId);

      return {
        pos: attrs.RacePosition,
        name: (result?.name || 'Unknown').replace(' (AI)', ''),  // FIX: Protection contre undefined
        vehicle: vehicleInfo?.name || 'Unknown',
        class: vehicleInfo?.class || 'Unknown',
        pitInfo: '0 (0L)', // TODO: Calculer les arrêts
        lap: `L${attrs.Lap || 0}`,
        gap: formatGap(gap, attrs.RacePosition === 1),
        interval: attrs.RacePosition === 1 ? '+0.00' : formatInterval(gap),
        bestLap: formatTime(attrs.FastestLapTime),
        lastLap: formatTime(lastLapTime),
        s1: formatSectorTime(s1),
        s2: formatSectorTime(s2),
        s3: formatSectorTime(s3),
        isPlayer: result.is_player === true,
        participantId: result.participantid,
        // Données brutes pour calculs de couleurs
        bestLapRaw: attrs.FastestLapTime,
        lastLapRaw: lastLapTime,
        s1Raw: s1,
        s2Raw: s2,
        s3Raw: s3
      };
    }

    // Calculer le tour actuel (moyenne des laps)
    const avgLap = Math.round(drivers.reduce((sum, d) => sum + parseInt(d.lap.substring(1)), 0) / drivers.length);
    
    return {
      raceInfo: {
        track: getTrackName(setup.TrackId),
        currentLap: avgLap,
        totalLaps: setup.RaceLength,
        startTime: formatStartTime(lastRace.start_time),
        classLeader: 'GT3',
        bestLap: formatTime(bestLapTime),
        fastestDriver: (fastestDriver || 'Unknown').replace(' (AI)', ''),  // FIX: Protection contre undefined
        isFinished: lastRace.finished === true,
        raceIndex: lastRace.index
      },
      drivers,
      fullRaceData: lastRace  // Pour la sauvegarde en historique
    };
    
  } catch (error) {
    console.error('Erreur parsing race data:', error);
    return null;
  }
}

// Formater le temps (ms -> m:ss.SSS)
function formatTime(ms) {
  if (!ms || ms === 0 || !isFinite(ms)) return '0:00.000';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

// Formater secteur (ms -> ss.SSS)
function formatSectorTime(ms) {
  if (!ms || ms === 0) return '---.---';
  const seconds = Math.floor(ms / 1000);
  const millis = ms % 1000;
  return `${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

// Formater l'écart
function formatGap(gapMs, isLeader) {
  if (isLeader) return '+0.000';
  const seconds = (gapMs / 1000).toFixed(3);
  return `+${seconds}`;
}

// Formater l'intervalle
function formatInterval(gapMs) {
  const seconds = (gapMs / 1000).toFixed(3);
  return `+${seconds}`;
}

// Formater l'heure de départ
function formatStartTime(startTime) {
  const date = new Date(startTime * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Route GET pour les données live
router.get('/live-data', async (req, res) => {
  try {
    // Récupérer le chemin depuis la BDD
    const SMS_STATS_FILE = await getSmsStatsPath();
    
    if (!SMS_STATS_FILE) {
      return res.status(404).json({ 
        error: 'Chemin du fichier non configuré',
        message: 'Veuillez configurer le chemin dans les Paramètres'
      });
    }
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(SMS_STATS_FILE)) {
      return res.status(404).json({ 
        error: 'Fichier sms_stats_data.json non trouvé',
        path: SMS_STATS_FILE,
        message: 'Vérifiez le chemin dans les Paramètres'
      });
    }

    // Lire le fichier
    const fileContent = fs.readFileSync(SMS_STATS_FILE, 'utf8');
    
    // Enlever les commentaires (première ligne)
    const lines = fileContent.split('\n');
    const jsonContent = lines.filter(line => !line.trim().startsWith('//')).join('\n');
    
    // Parser le JSON
    const jsonData = JSON.parse(jsonContent);
    
    // Parser les données de course
    const raceData = parseRaceData(jsonData);
    
    if (!raceData) {
      return res.status(404).json({ 
        error: 'Aucune course en cours ou terminée trouvée'
      });
    }

    res.json(raceData);
    
  } catch (error) {
    console.error('Erreur lecture fichier SMS:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la lecture des données',
      details: error.message
    });
  }
});

// Route GET pour les tours détaillés d'un pilote
router.get('/driver-laps/:participantId', async (req, res) => {
  try {
    const participantId = parseInt(req.params.participantId);
    const SMS_STATS_FILE = await getSmsStatsPath();
    
    if (!SMS_STATS_FILE || !fs.existsSync(SMS_STATS_FILE)) {
      return res.status(404).json({ error: 'Fichier non configuré' });
    }

    // Lire et parser le fichier
    const fileContent = fs.readFileSync(SMS_STATS_FILE, 'utf8');
    const lines = fileContent.split('\n');
    const jsonContent = lines.filter(line => !line.trim().startsWith('//')).join('\n');
    const jsonData = JSON.parse(jsonContent);
    
    // Trouver la dernière course avec race1
    const history = jsonData.stats.history;
    let lastRace = null;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].stages?.race1) {
        lastRace = history[i];
        break;
      }
    }
    
    if (!lastRace) {
      return res.json([]);
    }

    // FIX: Convertir events en tableau si c'est un objet
    let eventsArray = [];
    if (lastRace.stages.race1.events) {
      if (Array.isArray(lastRace.stages.race1.events)) {
        eventsArray = lastRace.stages.race1.events;
      } else if (typeof lastRace.stages.race1.events === 'object') {
        eventsArray = Object.values(lastRace.stages.race1.events);
      }
    }

    // Extraire les événements Lap pour ce pilote
    const lapEvents = eventsArray
      .filter(e => e.event_name === 'Lap' && e.participantid === participantId)
      .sort((a, b) => a.attributes.Lap - b.attributes.Lap)
      .map(e => ({
        lap: e.attributes.Lap,
        lapTime: e.attributes.LapTime,
        sector1: e.attributes.Sector1Time,
        sector2: e.attributes.Sector2Time,
        sector3: e.attributes.Sector3Time,
        position: e.attributes.RacePosition,
        distance: e.attributes.DistanceTravelled
      }));

    res.json(lapEvents);
    
  } catch (error) {
    console.error('Erreur driver-laps:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Live positions depuis la page /status du serveur AMS2
router.get('/live-positions', async (req, res) => {
  try {
    // Récupérer l'URL du serveur depuis les settings
    const { getDb } = require('../database');
    const db = getDb();
    
    let serverUrl = 'http://192.168.1.69:9000'; // Valeur par défaut
    
    try {
      const settings = db.exec('SELECT value FROM settings WHERE key = ?', ['ams2ServerUrl']);
      if (settings && settings[0] && settings[0].values && settings[0].values[0]) {
        serverUrl = settings[0].values[0][0];
      }
    } catch (err) {
      console.log('Utilisation URL serveur par défaut:', serverUrl);
    }
    
    // Fetch les positions depuis /status (HTML)
    const data = await fetchLivePositions(serverUrl);
    
    res.json({
      success: true,
      participants: data.participants || [],
      trackId: data.trackId || null,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Erreur live-positions:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;