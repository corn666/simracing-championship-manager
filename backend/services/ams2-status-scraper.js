/**
 * Scraper pour la page /status du serveur dédié AMS2
 * Version FINALE avec positions X/Y/Z pour le canvas
 */

const http = require('http');
const { getTrackName } = require('../constants/tracks');

function parseStatusPage(html) {
  const participants = [];
  let trackId = null;
  let sessionState = null;
  let sessionStage = null;
  let trackTemp = null;
  let airTemp = null;
  let trackName = null;

  // Parser les tables pour les données de session
  const tableMatches = html.match(/<table class="simple">[\s\S]*?<\/table>/gi);
  
  if (tableMatches) {
    tableMatches.forEach(tableHtml => {
      const rows = tableHtml.match(/<tr>[\s\S]*?<\/tr>/gi);
      
      if (!rows) return;
      
      // Parcourir TOUTES les lignes pour trouver des headers
      for (let i = 0; i < rows.length - 1; i++) {
        const currentRow = rows[i];
        
        if (!currentRow.includes('<th')) continue;
        
        const headers = [];
        const headerMatches = currentRow.match(/<th[^>]*>[\s\S]*?<\/th>/gi);
        
        if (!headerMatches) continue;
        
        headerMatches.forEach(th => {
          const textMatch = th.match(/>([^<]+)<\/th>/);
          if (textMatch) {
            headers.push(textMatch[1].trim());
          }
        });
        
        const nextRow = rows[i + 1];
        if (!nextRow || !nextRow.includes('<td')) continue;
        
        const cells = [];
        const cellMatches = nextRow.match(/<td[^>]*>[\s\S]*?<\/td>/gi);
        
        if (!cellMatches) continue;
        
        cellMatches.forEach(td => {
          const textMatch = td.match(/>([^<]*)<\/td>/);
          cells.push(textMatch ? textMatch[1].trim() : '');
        });
        
        // Mapper headers -> values
        headers.forEach((header, index) => {
          const value = cells[index];
          if (!value || value === '') return;
          
          switch (header) {
            case 'TrackId':
              trackId = parseInt(value);
              break;
            case 'SessionState':
              sessionState = value;
              break;
            case 'SessionStage':
              sessionStage = value;
              break;
            case 'TemperatureTrack':
              trackTemp = (parseInt(value) / 1000).toFixed(1);
              break;
            case 'TemperatureAmbient':
              airTemp = (parseInt(value) / 1000).toFixed(1);
              break;
          }
        });
      }
    });
  }

  // Récupérer le nom du circuit
  if (trackId) {
    trackName = getTrackName(trackId);
    if (trackName.includes('Circuit inconnu')) {
      trackName = null;
    }
  }

  // Parser les participants avec positions X/Y/Z
  const participantsMatch = html.match(/<h3>Session Participants<\/h3>\s*<table class="simple">([\s\S]*?)<\/table>/);
  
  if (participantsMatch) {
    const tableContent = participantsMatch[1];
    const rowRegex = /<tr>(.*?)<\/tr>/gs;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const rowHtml = rowMatch[1];
      if (rowHtml.includes('<th')) continue;

      const cells = [];
      const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        let content = cellMatch[1];
        content = content.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
        content = content.replace(/<[^>]+>/g, '');
        content = content.trim();
        cells.push(content);
      }

      if (cells.length < 24) continue;

      // Colonnes du tableau (voir status.html)
      // 0: ParticipantId, 1: RefId, 2: Name, 3: IsPlayer, 4: GridPosition
      // 7: RacePosition, 8: CurrentLap, 9: CurrentSector
      // 10: Sector1Time, 11: Sector2Time, 12: Sector3Time
      // 13: LastLapTime, 14: FastestLapTime, 15: State
      // 21: PositionX, 22: PositionY, 23: PositionZ (en millimètres)

      participants.push({
        participantId: parseInt(cells[0]) || 0,
        refId: parseInt(cells[1]) || 0,
        name: cells[2] || 'Unknown',
        isPlayer: cells[3] === '1',
        gridPosition: parseInt(cells[4]) || 0,
        racePosition: parseInt(cells[7]) || 0,
        currentLap: parseInt(cells[8]) || 0,
        currentSector: parseInt(cells[9]) || 0,
        sector1Time: parseInt(cells[10]) || 0,
        sector2Time: parseInt(cells[11]) || 0,
        sector3Time: parseInt(cells[12]) || 0,
        lastLapTime: parseInt(cells[13]) || 0,
        fastestLapTime: parseInt(cells[14]) || 0,
        state: cells[15] || 'Unknown',
        // Positions en millimètres (coordonnées monde)
        positionX: parseInt(cells[21]) || 0,
        positionY: parseInt(cells[22]) || 0,
        positionZ: parseInt(cells[23]) || 0
      });
    }
  }

  return { 
    participants, 
    trackId, 
    sessionState, 
    sessionStage, 
    trackTemp, 
    airTemp,
    trackName 
  };
}

async function fetchLivePositions(serverUrl) {
  return new Promise((resolve, reject) => {
    const url = `${serverUrl}/status`;
    
    http.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let html = '';
      res.on('data', (chunk) => {
        html += chunk.toString();
      });

      res.on('end', () => {
        try {
          const data = parseStatusPage(html);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = {
  fetchLivePositions,
  parseStatusPage
};