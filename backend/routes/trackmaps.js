const express = require('express');
const router = express.Router();
const { getTrackMap, hasTrackMap, listAvailableTrackmaps } = require('../constants/trackmaps');

// GET - Récupérer le tracé d'un circuit
router.get('/:trackId', (req, res) => {
  try {
    const { trackId } = req.params;
    
    const trackMap = getTrackMap(trackId);
    
    if (!trackMap) {
      return res.status(404).json({ 
        error: 'Tracé non disponible pour ce circuit',
        trackId 
      });
    }
    
    res.json(trackMap);
  } catch (err) {
    console.error('Erreur récupération tracé:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lister tous les tracés disponibles
router.get('/', (req, res) => {
  try {
    const trackmaps = listAvailableTrackmaps();
    res.json({ trackmaps });
  } catch (err) {
    console.error('Erreur liste tracés:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
