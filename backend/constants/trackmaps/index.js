/**
 * Module de gestion des tracés de circuits AMS2
 * Fournit les coordonnées des circuits pour affichage
 */

const TRACKMAPS = require('./data');

/**
 * Récupère le tracé d'un circuit
 * @param {number|string} trackId - L'ID du circuit
 * @returns {Object|null} - {line_mid, line_outer, line_inner, line_SF, comment} ou null
 */
function getTrackMap(trackId) {
  if (!trackId && trackId !== 0) return null;
  
  const trackIdStr = String(trackId);
  
  if (!TRACKMAPS[trackIdStr]) {
    console.log(`⚠️ Tracé non disponible pour le circuit ${trackId}`);
    return null;
  }
  
  return TRACKMAPS[trackIdStr];
}

/**
 * Vérifie si un tracé est disponible
 * @param {number|string} trackId 
 * @returns {boolean}
 */
function hasTrackMap(trackId) {
  const trackIdStr = String(trackId);
  return TRACKMAPS.hasOwnProperty(trackIdStr);
}

/**
 * Liste tous les circuits avec tracé disponible
 * @returns {Array} - [{id, comment}]
 */
function listAvailableTrackmaps() {
  return Object.entries(TRACKMAPS).map(([id, data]) => ({
    id,
    comment: data.comment || `Circuit ${id}`
  }));
}

module.exports = {
  getTrackMap,
  hasTrackMap,
  listAvailableTrackmaps
};
