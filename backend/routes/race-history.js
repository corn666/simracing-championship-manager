const express = require('express');
const fs = require('fs');
const router = express.Router();
const { getVehicleInfo } = require('../constants/vehicles');

// Détecter quel type de DB et wrappers
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
    // sqlite3
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
    // sqlite3
    const db = require('../database');
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      });
    });
  }
}

function getDbType() {
  try {
    const { getDb } = require('../database');
    const db = getDb();
    return db && typeof db.prepare === 'function' ? 'sqljs' : 'sqlite3';
  } catch (err) {
    return 'sqlite3';
  }
}

// Fonction pour compter les collisions dans une course
function countCollisions(raceData) {
  let totalCollisions = 0;
  const collisionsByDriver = {};
  
  if (raceData.stages?.race1?.events) {
    raceData.stages.race1.events.forEach(event => {
      if (event.event_name === 'Impact') {
        totalCollisions++;
        
        const pid = event.participantid;
        if (!collisionsByDriver[pid]) {
          collisionsByDriver[pid] = 0;
        }
        collisionsByDriver[pid]++;
      }
    });
  }
  
  return { totalCollisions, collisionsByDriver };
}

// GET - Récupérer toutes les courses de l'historique
router.get('/', async (req, res) => {
  try {
    const races = await query(`
      SELECT * FROM race_history 
      ORDER BY created_at DESC
    `);
    
    res.json(races);
  } catch (err) {
    console.error('Erreur lecture historique:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Récupérer une course spécifique avec ses participants
router.get('/:id', async (req, res) => {
  try {
    const races = await query('SELECT * FROM race_history WHERE id = ?', [req.params.id]);
    const race = races.length > 0 ? races[0] : null;
    
    if (!race) {
      return res.status(404).json({ error: 'Course non trouvée' });
    }
    
    const participants = await query(
      'SELECT * FROM race_participants WHERE race_history_id = ? ORDER BY final_position',
      [req.params.id]
    );
    
    // Enrichir avec les infos véhicule
    const enrichedParticipants = participants.map(p => {
      const vehicleInfo = getVehicleInfo(p.vehicle_id);
      return {
        ...p,
        vehicle_name: vehicleInfo.name,
        vehicle_class: vehicleInfo.class
      };
    });
    
    res.json({
      ...race,
      race_data: race.race_data ? JSON.parse(race.race_data) : null,
      participants: enrichedParticipants
    });
  } catch (err) {
    console.error('Erreur lecture course:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Sauvegarder une course terminée
router.post('/save', async (req, res) => {
  try {
    const { raceData } = req.body;
    
    if (!raceData) {
      return res.status(400).json({ error: 'raceData requis' });
    }
    
    // Extraire les infos principales
    const setup = raceData.setup;
    const raceSession = raceData.stages?.race1;
    
    if (!raceSession) {
      return res.status(400).json({ error: 'Pas de session race1' });
    }
    
    // Vérifier si cette course existe déjà (éviter les doublons)
    const existing = await query(
      'SELECT id FROM race_history WHERE race_index = ? AND start_time = ?',
      [raceData.index, raceData.start_time]
    );
    
    if (existing.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Course déjà sauvegardée',
        raceHistoryId: existing[0].id,
        alreadyExists: true
      });
    }
    
    const results = Object.values(raceSession.results || {});
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
    const { totalCollisions, collisionsByDriver } = countCollisions(raceData);
    
    // Créer un résumé léger de la course (sans tous les événements)
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
    
    // Insérer la course (avec résumé léger au lieu du JSON complet)
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
      JSON.stringify(raceSummary)  // Résumé léger (~2 KB au lieu de 200 KB)
    ]);
    
    // Récupérer l'ID de la course insérée
    let raceHistoryId = raceResult.lastID;
    
    if (!raceHistoryId) {
      // Pour sql.js, récupérer via une requête
      const lastIdResult = await query('SELECT MAX(id) as id FROM race_history');
      raceHistoryId = lastIdResult[0].id;
    }
    
    console.log('Race saved with ID:', raceHistoryId);
    console.log('Inserting', results.length, 'participants...');
    
    // Insérer les participants
    for (const result of results) {
      const participantCollisions = collisionsByDriver[result.participantid] || 0;
      
      // Nettoyer le nom (enlever AI, espaces, caractères bizarres)
      const cleanName = result.name
        .replace(' (AI)', '')
        .replace(/^[0-9\s]+/, '')  // Enlever chiffres et espaces au début
        .trim();
      
      console.log('Inserting participant:', cleanName, 'for race', raceHistoryId);
      
      await execute(`
        INSERT INTO race_participants (
          race_history_id, participant_id, driver_name, is_player,
          final_position, best_lap_time, total_laps, total_collisions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        raceHistoryId,
        result.participantid,
        cleanName,
        result.is_player ? 1 : 0,
        result.attributes.RacePosition,
        result.attributes.FastestLapTime,
        result.attributes.Lap,
        participantCollisions,
        result.attributes.State
      ]);
    }
    
    console.log('All participants inserted!');
    
    // Insérer tous les tours de tous les pilotes
    const lapEvents = (raceSession.events || [])
      .filter(e => e.event_name === 'Lap')
      .sort((a, b) => {
        if (a.participantid !== b.participantid) {
          return a.participantid - b.participantid;
        }
        return a.attributes.Lap - b.attributes.Lap;
      });
    
    console.log(`Sauvegarde de ${lapEvents.length} tours...`);
    
    for (const lapEvent of lapEvents) {
      const participant = raceData.participants[lapEvent.participantid];
      if (!participant) continue;
      
      // Nettoyer le nom
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
    
    res.json({ 
      success: true, 
      message: 'Course sauvegardée',
      raceHistoryId
    });
    
  } catch (err) {
    console.error('Erreur sauvegarde course:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Supprimer une course de l'historique
router.delete('/:id', async (req, res) => {
  try {
    await execute('DELETE FROM race_history WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Course supprimée' });
  } catch (err) {
    console.error('Erreur suppression course:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Récupérer les tours d'un pilote dans une course historique
router.get('/:raceId/driver-laps/:driverName', async (req, res) => {
  try {
    const { raceId, driverName } = req.params;
    
    // Récupérer tous les tours de ce pilote dans cette course
    const laps = await query(`
      SELECT * FROM race_laps 
      WHERE race_history_id = ? AND driver_name = ?
      ORDER BY lap_number
    `, [raceId, driverName]);
    
    // Formater comme attendu par le frontend
    const formattedLaps = laps.map(lap => ({
      lap: lap.lap_number,
      lapTime: lap.lap_time,
      sector1: lap.sector1_time,
      sector2: lap.sector2_time,
      sector3: lap.sector3_time,
      position: lap.position
    }));
    
    res.json(formattedLaps);
    
  } catch (err) {
    console.error('Erreur récupération tours:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lookup table des circuits
function getTrackName(trackId) {
  const tracks = {
    775712153: 'Spa-Francorchamps',
    '-1478712571': 'Brands Hatch',
    // Ajouter d'autres circuits ici
  };
  return tracks[trackId] || `Circuit ${trackId}`;
}

// Lier une course à un événement avec mapping IA intelligent
router.post('/:raceId/link-event', async (req, res) => {
  try {
    const { raceId } = req.params;
    const { eventId } = req.body;
    const { mapParticipants, extractAI } = require('../services/ai-mapper');

    // Récupérer l'événement et son championnat
    const event = await query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    const championshipId = event[0].championship_id;

    // Récupérer les détails de la course
    const race = await query(
      'SELECT * FROM race_history WHERE id = ?',
      [raceId]
    );

    if (race.length === 0) {
      return res.status(404).json({ error: 'Course non trouvée' });
    }

    // Récupérer les participants de cette course
    const participants = await query(
      'SELECT * FROM race_participants WHERE race_history_id = ? ORDER BY final_position',
      [raceId]
    );

    // Système de points (position -> points)
    const POINTS_SYSTEM = {
      1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
      6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    };

    let referenceAI = [];
    let isFirstRace = false;

    // Vérifier si c'est la première course du championnat (définit le roster de référence)
    if (championshipId) {
      const roster = await query(
        'SELECT * FROM championship_roster WHERE championship_id = ? ORDER BY roster_position',
        [championshipId]
      );

      if (roster.length === 0) {
        // PREMIÈRE COURSE - Créer le roster de référence
        isFirstRace = true;
        console.log('🆕 Première course du championnat - Création du roster de référence');
        
        let rosterPosition = 1;
        for (const participant of participants) {
          const points = POINTS_SYSTEM[participant.final_position] || 0;
          
          // Créer ou récupérer le pilote
          let pilot = await query(
            'SELECT id FROM pilots WHERE name = ?',
            [participant.driver_name]
          );

          let pilotId;
          if (pilot.length === 0) {
            const result = await execute(
              'INSERT INTO pilots (name, is_human) VALUES (?, ?)',
              [participant.driver_name, participant.is_player ? 1 : 0]
            );
            pilotId = result.lastID;
            if (!pilotId) {
              const lastId = await query('SELECT MAX(id) as id FROM pilots');
              pilotId = lastId[0].id;
            }
          } else {
            pilotId = pilot[0].id;
          }

          // Ajouter au roster de référence
          await execute(
            `INSERT INTO championship_roster (
              championship_id, pilot_id, pilot_name, roster_position, is_reference_race
            ) VALUES (?, ?, ?, ?, ?)`,
            [championshipId, pilotId, participant.driver_name, rosterPosition, 1]
          );

          // Insérer les résultats directement
          await execute(
            `INSERT INTO results (
              event_id, pilot_id, position, points, status
            ) VALUES (?, ?, ?, ?, ?)`,
            [eventId, pilotId, participant.final_position, points, null]
          );

          rosterPosition++;
        }

      } else {
        // COURSES SUIVANTES - Utiliser le mapping IA
        console.log('🔄 Course suivante - Mapping des IA au roster de référence');
        
        // Extraire les IA de référence
        const rosterAI = roster.filter(r => {
          // Vérifier si c'est une IA (pas un humain)
          const pilot = participants.find(p => p.driver_name === r.pilot_name);
          return !pilot || !pilot.is_player;
        });

        referenceAI = rosterAI.map(r => ({
          id: r.pilot_id,
          name: r.pilot_name
        }));

        // Préparer les participants actuels pour le mapping
        const currentParticipants = participants.map(p => ({
          name: p.driver_name,
          position: p.final_position,
          points: POINTS_SYSTEM[p.final_position] || 0,
          is_human: p.is_player ? true : false
        }));

        // Effectuer le mapping
        const mappedResults = mapParticipants(referenceAI, currentParticipants);

        // Supprimer les anciens résultats
        await execute(
          'DELETE FROM results WHERE event_id = ?',
          [eventId]
        );

        // Insérer les résultats mappés
        for (const result of mappedResults) {
          let pilotId = result.mapped_to_id;

          // Si c'est un nouveau pilote (humain absent remplacé par IA)
          if (result.is_new_pilot) {
            // Créer le pilote
            let pilot = await query(
              'SELECT id FROM pilots WHERE name = ?',
              [result.driver_name]
            );

            if (pilot.length === 0) {
              const insertResult = await execute(
                'INSERT INTO pilots (name, is_human) VALUES (?, ?)',
                [result.driver_name, 0]
              );
              pilotId = insertResult.lastID;
              if (!pilotId) {
                const lastId = await query('SELECT MAX(id) as id FROM pilots');
                pilotId = lastId[0].id;
              }

              // Ajouter au roster (pilote supplémentaire)
              await execute(
                `INSERT INTO championship_roster (
                  championship_id, pilot_id, pilot_name, roster_position, is_reference_race
                ) VALUES (?, ?, ?, ?, ?)`,
                [championshipId, pilotId, result.driver_name, roster.length + 1, 0]
              );
            } else {
              pilotId = pilot[0].id;
            }
          }

          // Gérer aussi les humains
          if (result.is_human) {
            let pilot = await query(
              'SELECT id FROM pilots WHERE name = ?',
              [result.driver_name]
            );

            if (pilot.length === 0) {
              const insertResult = await execute(
                'INSERT INTO pilots (name, is_human) VALUES (?, ?)',
                [result.driver_name, 1]
              );
              pilotId = insertResult.lastID;
              if (!pilotId) {
                const lastId = await query('SELECT MAX(id) as id FROM pilots');
                pilotId = lastId[0].id;
              }
            } else {
              pilotId = pilot[0].id;
            }
          }

          // Insérer le résultat
          await execute(
            `INSERT INTO results (
              event_id, pilot_id, position, points, status
            ) VALUES (?, ?, ?, ?, ?)`,
            [eventId, pilotId, result.position, result.points, null]
          );
        }

        // Gérer les humains absents (DNS)
        const humanRoster = roster.filter(r => {
          const pilot = participants.find(p => p.driver_name === r.pilot_name && p.is_player);
          return pilot !== undefined;
        });

        for (const human of humanRoster) {
          const isPresent = participants.some(p => 
            p.driver_name === human.pilot_name && p.is_player
          );

          if (!isPresent) {
            // Humain absent → DNS (0 points)
            await execute(
              `INSERT INTO results (
                event_id, pilot_id, position, points, status
              ) VALUES (?, ?, ?, ?, ?)`,
              [eventId, human.pilot_id, null, 0, 'DNS']
            );
          }
        }
      }
    } else {
      // Pas de championnat → Logique normale sans mapping
      console.log('⚠️ Événement sans championnat - Pas de mapping IA');
      
      await execute(
        'DELETE FROM results WHERE event_id = ?',
        [eventId]
      );

      for (const participant of participants) {
        const points = POINTS_SYSTEM[participant.final_position] || 0;
        
        let pilot = await query(
          'SELECT id FROM pilots WHERE name = ?',
          [participant.driver_name]
        );

        let pilotId;
        if (pilot.length === 0) {
          const result = await execute(
            'INSERT INTO pilots (name, is_human) VALUES (?, ?)',
            [participant.driver_name, participant.is_player ? 1 : 0]
          );
          pilotId = result.lastID;
          if (!pilotId) {
            const lastId = await query('SELECT MAX(id) as id FROM pilots');
            pilotId = lastId[0].id;
          }
        } else {
          pilotId = pilot[0].id;
        }

        await execute(
          `INSERT INTO results (
            event_id, pilot_id, position, points, status
          ) VALUES (?, ?, ?, ?, ?)`,
          [eventId, pilotId, participant.final_position, points, null]
        );
      }
    }

    // Mettre à jour le statut de l'événement en "finished"
    await execute(
      'UPDATE events SET status = ? WHERE id = ?',
      ['finished', eventId]
    );

    // Lier la course à l'événement
    await execute(
      'UPDATE race_history SET event_id = ? WHERE id = ?',
      [eventId, raceId]
    );

    res.json({ 
      success: true, 
      message: isFirstRace 
        ? 'Course liée et roster de référence créé !' 
        : 'Course liée avec mapping IA réussi !',
      isFirstRace
    });
  } catch (err) {
    console.error('Erreur liaison événement:', err);
    res.status(500).json({ error: err.message });
  }
});

// Détacher une course d'un événement
router.post('/:raceId/unlink-event', async (req, res) => {
  try {
    const { raceId } = req.params;

    // Récupérer la course et son event_id
    const races = await query(
      'SELECT event_id FROM race_history WHERE id = ?',
      [raceId]
    );

    if (races.length === 0) {
      return res.status(404).json({ error: 'Course non trouvée' });
    }

    const eventId = races[0].event_id;

    if (!eventId) {
      return res.status(400).json({ error: 'Cette course n\'est pas liée à un événement' });
    }

    // Récupérer l'événement pour voir si c'est dans un championnat
    const events = await query(
      'SELECT championship_id FROM events WHERE id = ?',
      [eventId]
    );

    const championshipId = events.length > 0 ? events[0].championship_id : null;

    // Supprimer les résultats de cet événement
    await execute(
      'DELETE FROM results WHERE event_id = ?',
      [eventId]
    );

    // Si c'était la première course (référence), supprimer le roster
    if (championshipId) {
      const roster = await query(
        'SELECT * FROM championship_roster WHERE championship_id = ? AND is_reference_race = 1',
        [championshipId]
      );

      // Si c'est la course de référence, on supprime tout le roster
      // (car le mapping des autres courses dépend de celle-ci)
      if (roster.length > 0) {
        console.log('⚠️ Détachement de la course de référence - Suppression du roster');
        await execute(
          'DELETE FROM championship_roster WHERE championship_id = ?',
          [championshipId]
        );
      }
    }

    // Remettre l'événement en "upcoming" (ou garder le statut ?)
    await execute(
      'UPDATE events SET status = ? WHERE id = ?',
      ['upcoming', eventId]
    );

    // Détacher la course
    await execute(
      'UPDATE race_history SET event_id = NULL WHERE id = ?',
      [raceId]
    );

    res.json({ 
      success: true, 
      message: 'Course détachée de l\'événement',
      wasReferenceRace: championshipId ? true : false
    });
  } catch (err) {
    console.error('Erreur détachement événement:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
