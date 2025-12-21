const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

// Détecter quel type de DB on utilise
function getDbType() {
  try {
    const { getDb } = require('../database');
    const db = getDb();
    // Si getDb() retourne un objet avec prepare(), c'est sql.js
    return db && typeof db.prepare === 'function' ? 'sqljs' : 'sqlite3';
  } catch (err) {
    return 'sqlite3'; // Par défaut
  }
}

// Wrappers pour les deux types de DB
function query(sql, params = []) {
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
    // sqlite3 - utiliser callback synchrone avec Promise
    const db = require('../database');
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

function execute(sql, params = []) {
  const dbType = getDbType();
  
  if (dbType === 'sqljs') {
    const { getDb, saveDatabase } = require('../database');
    const db = getDb();
    db.run(sql, params);
    saveDatabase();
  } else {
    // sqlite3
    const db = require('../database');
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
}

// GET - Récupérer tous les paramètres
router.get('/', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM settings');
    
    // Convertir en objet clé-valeur
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.json(settingsObj);
  } catch (err) {
    console.error('Erreur lecture settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Récupérer un paramètre spécifique
router.get('/:key', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM settings WHERE key = ?', [req.params.key]);
    const setting = settings.length > 0 ? settings[0] : null;
    
    if (!setting) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    
    res.json({ key: setting.key, value: setting.value });
  } catch (err) {
    console.error('Erreur lecture setting:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Sauvegarder les paramètres
router.post('/', async (req, res) => {
  try {
    const { sms_stats_path } = req.body;
    
    if (sms_stats_path !== undefined) {
      // Vérifier si le paramètre existe déjà
      const existing = await query('SELECT * FROM settings WHERE key = ?', ['sms_stats_path']);
      
      if (existing.length > 0) {
        // Mettre à jour
        await execute(
          'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
          [sms_stats_path, 'sms_stats_path']
        );
      } else {
        // Insérer
        await execute(
          'INSERT INTO settings (key, value) VALUES (?, ?)',
          ['sms_stats_path', sms_stats_path]
        );
      }
      
      // Redémarrer l'auto-saver avec le nouveau chemin
      const raceAutoSaver = require('../services/race-auto-saver');
      raceAutoSaver.restart();
    }
    
    res.json({ success: true, message: 'Paramètres sauvegardés' });
  } catch (err) {
    console.error('Erreur sauvegarde settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Mettre à jour un paramètre spécifique
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const { key } = req.params;
    
    const existing = await query('SELECT * FROM settings WHERE key = ?', [key]);
    
    if (existing.length > 0) {
      await execute(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [value, key]
      );
    } else {
      await execute(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    }
    
    res.json({ success: true, key, value });
  } catch (err) {
    console.error('Erreur mise à jour setting:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Supprimer un paramètre
router.delete('/:key', async (req, res) => {
  try {
    await execute('DELETE FROM settings WHERE key = ?', [req.params.key]);
    res.json({ success: true, message: 'Paramètre supprimé' });
  } catch (err) {
    console.error('Erreur suppression setting:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Upload certificats SSL
router.post('/ssl', upload.fields([
  { name: 'ssl_public_cert', maxCount: 1 },
  { name: 'ssl_private_key', maxCount: 1 },
  { name: 'ssl_intermediate_cert', maxCount: 1 }
]), async (req, res) => {
  try {
    const { ssl_enabled } = req.body;
    const files = req.files;

    if (!files || !files.ssl_public_cert || !files.ssl_private_key || !files.ssl_intermediate_cert) {
      return res.status(400).json({ error: 'Tous les fichiers sont requis' });
    }

    // Créer le dossier certs à côté de l'exe (pas dans le snapshot)
    const certsDir = path.join(process.cwd(), 'certs');
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }

    // Déplacer les fichiers dans le dossier certs
    const publicCertPath = path.join(certsDir, 'ssl-public.cer');
    const privateKeyPath = path.join(certsDir, 'ssl-private.key');
    const intermediateCertPath = path.join(certsDir, 'ssl-intermediate.cer');

    fs.renameSync(files.ssl_public_cert[0].path, publicCertPath);
    fs.renameSync(files.ssl_private_key[0].path, privateKeyPath);
    fs.renameSync(files.ssl_intermediate_cert[0].path, intermediateCertPath);

    // Sauvegarder l'état SSL en BDD
    const existing = await query('SELECT * FROM settings WHERE key = ?', ['ssl_enabled']);
    
    if (existing.length > 0) {
      await execute(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [ssl_enabled || 'true', 'ssl_enabled']
      );
    } else {
      await execute(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        ['ssl_enabled', ssl_enabled || 'true']
      );
    }

    // Marquer SSL comme configuré
    const statusExisting = await query('SELECT * FROM settings WHERE key = ?', ['ssl_status']);
    if (statusExisting.length > 0) {
      await execute(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        ['configured', 'ssl_status']
      );
    } else {
      await execute(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        ['ssl_status', 'configured']
      );
    }

    res.json({ 
      success: true, 
      message: 'Certificats SSL installés avec succès. Redémarrez l\'application pour activer HTTPS.' 
    });
  } catch (err) {
    console.error('Erreur upload SSL:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
