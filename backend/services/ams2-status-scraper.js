/**
 * Scraper pour la page /status du serveur dédié AMS2
 * Extrait les positions en temps réel des participants
 * Parse HTML avec regex (pas de dépendance cheerio pour pkg)
 */

const http = require('http');

/**
 * Parse la page HTML du serveur AMS2 avec regex
 * @param {string} html - HTML de la page /status
 * @returns {Object} - {participants: [...], trackId: number}
 */
function parseStatusPage(html) {
  const participants = [];
  let trackId = null;

  // MÉTHODE 1: Chercher "TrackId" dans Session Attributes
  let trackIdMatch = html.match(/>TrackId<\/th>\s*<\/tr>\s*<tr>\s*<td[^>]*>(-?\d+)<\/td>/i);
  
  if (trackIdMatch) {
    trackId = parseInt(trackIdMatch[1]);
  } else {
    // MÉTHODE 2: Chercher directement après "TrackId" sans contrainte de structure
    trackIdMatch = html.match(/TrackId<\/th>[\s\S]*?<td[^>]*>(-?\d+)<\/td>/i);
    
    if (trackIdMatch) {
      trackId = parseInt(trackIdMatch[1]);
    } else {
      // MÉTHODE 3: Chercher n'importe quel chiffre après "TrackId"
      trackIdMatch = html.match(/TrackId[\s\S]{0,200}>(-?\d+)</i);
      
      if (trackIdMatch) {
        trackId = parseInt(trackIdMatch[1]);
      } else {
        console.error('Impossible de trouver le Track ID dans le HTML');
      }
    }
  }

  // Trouver la section "Session Participants"
  const participantsMatch = html.match(/<h3>Session Participants<\/h3>\s*<table class="simple">([\s\S]*?)<\/table>/);
  
  if (!participantsMatch) {
    console.error('Section Session Participants non trouvée');
    return { participants: [], trackId };
  }

  const tableContent = participantsMatch[1];

  // Extraire toutes les lignes <tr>
  const rowRegex = /<tr>(.*?)<\/tr>/gs;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
    const rowHtml = rowMatch[1];

    // Ignorer les lignes de header (qui contiennent <th>)
    if (rowHtml.includes('<th')) continue;

    // Extraire toutes les cellules <td>
    const cells = [];
    const cellRegex = /<td[^>]*>(.*?)<\/td>/g;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      // Nettoyer le contenu (enlever les balises HTML internes comme <a>)
      let content = cellMatch[1].replace(/<[^>]+>/g, '').trim();
      cells.push(content);
    }

    if (cells.length < 25) continue; // Pas assez de colonnes

    const participant = {
      participantId: cells[0] || '',
      refId: cells[1] || '',
      name: cells[2] || '',
      isPlayer: cells[3] === '1',
      gridPosition: parseInt(cells[4]) || 0,
      vehicleId: parseInt(cells[5]) || 0,
      liveryId: parseInt(cells[6]) || 0,
      racePosition: parseInt(cells[7]) || 0,
      currentLap: parseInt(cells[8]) || 0,
      currentSector: parseInt(cells[9]) || 0,
      sector1Time: parseInt(cells[10]) || 0,
      sector2Time: parseInt(cells[11]) || 0,
      sector3Time: parseInt(cells[12]) || 0,
      lastLapTime: parseInt(cells[13]) || 0,
      fastestLapTime: parseInt(cells[14]) || 0,
      state: cells[15] || '',
      headlightsOn: cells[16] !== '',
      wipersLevel: parseInt(cells[17]) || 0,
      speed: parseInt(cells[18]) || 0,
      gear: parseInt(cells[19]) || 0,
      rpm: parseInt(cells[20]) || 0,
      positionX: parseInt(cells[21]) || 0,
      positionY: parseInt(cells[22]) || 0,
      positionZ: parseInt(cells[23]) || 0,
      orientation: parseInt(cells[24]) || 0
    };

    participants.push(participant);
  }

  return { participants, trackId };
}

/**
 * Fetch la page status avec http natif
 * @param {string} serverUrl - URL du serveur (ex: http://192.168.1.69:9000)
 * @returns {Promise<string>} - HTML de la page
 */
function fetchStatusHtml(serverUrl) {
  return new Promise((resolve, reject) => {
    // Parser l'URL
    const url = new URL(serverUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: '/status',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

/**
 * Fetch et parse la page status
 * @param {string} serverUrl - URL du serveur (ex: http://192.168.1.69:9000)
 * @returns {Promise<Object>} - {participants: [...], trackId: number}
 */
async function fetchLivePositions(serverUrl) {
  try {
    const html = await fetchStatusHtml(serverUrl);
    return parseStatusPage(html);
  } catch (err) {
    console.error('Erreur fetch status:', err.message);
    return { participants: [], trackId: null };
  }
}

module.exports = {
  parseStatusPage,
  fetchLivePositions
};
