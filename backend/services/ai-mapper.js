/**
 * Module de mapping des IA pour les championnats
 * Gère l'assignation des pilotes IA aux pilotes de référence
 */

/**
 * Mélange aléatoirement un tableau (Fisher-Yates shuffle)
 * @param {Array} array - Tableau à mélanger
 * @returns {Array} - Tableau mélangé
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Mappe les participants d'une course aux pilotes de référence
 * @param {Array} referenceAI - Liste des IA de référence [{id, name}]
 * @param {Array} currentParticipants - Participants de la course actuelle [{name, position, points, is_human}]
 * @returns {Array} - Résultats mappés avec mapped_to_id, mapped_to_name, etc.
 */
function mapParticipants(referenceAI, currentParticipants) {
  const mappedResults = [];
  const usedReferenceAI = new Set();
  
  // Séparer humains et IA
  const currentHumans = currentParticipants.filter(p => p.is_human);
  const currentAI = currentParticipants.filter(p => !p.is_human);
  
  // Les humains sont toujours mappés directement (pas de logique particulière ici)
  // Ils seront gérés par nom dans la route de liaison
  
  // Phase 1: Identifier les IA qui existent déjà en référence
  for (const ai of currentAI) {
    const existingRef = referenceAI.find(ref => ref.name === ai.name);
    
    if (existingRef) {
      // IA trouvée → elle garde son identité
      mappedResults.push({
        original_name: ai.name,
        driver_name: ai.name,
        mapped_to_id: existingRef.id,
        mapped_to_name: existingRef.name,
        position: ai.position,
        points: ai.points,
        is_human: false,
        is_exact_match: true
      });
      usedReferenceAI.add(existingRef.id);
    }
  }
  
  // Phase 2: Trouver les IA absentes de la course actuelle
  const absentAI = referenceAI.filter(ref => 
    !currentAI.some(cur => cur.name === ref.name) &&
    !usedReferenceAI.has(ref.id)
  );
  
  // Phase 3: Mélanger aléatoirement les IA absentes
  const shuffledAbsentAI = shuffleArray(absentAI);
  
  let absentIndex = 0;
  
  // Phase 4: Mapper les nouvelles IA aux IA absentes (aléatoirement)
  for (const ai of currentAI) {
    // Vérifier si déjà mappée en phase 1
    const alreadyMapped = mappedResults.find(m => m.original_name === ai.name);
    if (alreadyMapped) continue;
    
    // Mapper à une IA absente (si disponible)
    if (absentIndex < shuffledAbsentAI.length) {
      const absentRef = shuffledAbsentAI[absentIndex];
      
      mappedResults.push({
        original_name: ai.name,
        driver_name: ai.name,
        mapped_to_id: absentRef.id,
        mapped_to_name: absentRef.name,
        position: ai.position,
        points: ai.points,
        is_human: false,
        is_exact_match: false,
        is_replacement: true
      });
      
      usedReferenceAI.add(absentRef.id);
      absentIndex++;
    } else {
      // Cas rare: plus d'IA absentes disponibles
      // Cela arrive si un humain est absent et remplacé par une IA supplémentaire
      // Dans ce cas, on crée un nouveau pilote
      mappedResults.push({
        original_name: ai.name,
        driver_name: ai.name,
        mapped_to_id: null,
        mapped_to_name: ai.name,
        position: ai.position,
        points: ai.points,
        is_human: false,
        is_exact_match: false,
        is_new_pilot: true
      });
    }
  }
  
  return mappedResults;
}

/**
 * Extrait les IA de référence depuis une liste de participants
 * @param {Array} participants - Liste des participants [{name, is_human}]
 * @returns {Array} - Liste des IA uniquement
 */
function extractAI(participants) {
  return participants.filter(p => !p.is_human);
}

module.exports = {
  mapParticipants,
  extractAI,
  shuffleArray
};
