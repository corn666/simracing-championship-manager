/**
 * Script de test pour vérifier la connexion au serveur AMS2
 * 
 * USAGE:
 * 1. Ouvre ce fichier
 * 2. Change l'URL du serveur (ligne 11)
 * 3. Lance: node test-ams2-connection.js
 */

const http = require('http');

const SERVER_URL = 'http://192.168.1.69:9000'; // ⬅️ CHANGE TON IP ICI

console.log('='.repeat(60));
console.log('🧪 TEST DE CONNEXION AU SERVEUR AMS2');
console.log('='.repeat(60));
console.log('');
console.log('URL testée:', SERVER_URL + '/status');
console.log('');

// Fonction pour fetch le HTML
function fetchStatus(serverUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(serverUrl + '/status');
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: '/status',
      method: 'GET',
      timeout: 5000
    };

    console.log('📡 Connexion en cours...');
    
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
      reject(new Error('Timeout - Le serveur ne répond pas'));
    });

    req.end();
  });
}

// Fonction pour parser et afficher les infos
function analyzeHTML(html) {
  console.log('✅ HTML reçu (' + html.length + ' octets)');
  console.log('');
  
  // Chercher Track ID
  console.log('🔍 Recherche du Track ID...');
  
  let trackId = null;
  
  // Méthode 1
  let match = html.match(/>TrackId<\/th>\s*<\/tr>\s*<tr>\s*<td[^>]*>(-?\d+)<\/td>/i);
  if (match) {
    trackId = parseInt(match[1]);
    console.log('   ✅ Trouvé (méthode 1):', trackId);
  } else {
    console.log('   ⚠️  Méthode 1 échouée');
    
    // Méthode 2
    match = html.match(/TrackId<\/th>[\s\S]*?<td[^>]*>(-?\d+)<\/td>/i);
    if (match) {
      trackId = parseInt(match[1]);
      console.log('   ✅ Trouvé (méthode 2):', trackId);
    } else {
      console.log('   ⚠️  Méthode 2 échouée');
      
      // Méthode 3
      match = html.match(/TrackId[\s\S]{0,200}>(-?\d+)</i);
      if (match) {
        trackId = parseInt(match[1]);
        console.log('   ✅ Trouvé (méthode 3):', trackId);
      } else {
        console.log('   ❌ Aucune méthode n\'a fonctionné');
      }
    }
  }
  
  console.log('');
  
  // Afficher extrait HTML autour de TrackId
  const trackIdSection = html.match(/TrackId[\s\S]{0,500}/i);
  if (trackIdSection) {
    console.log('📄 Extrait HTML autour de "TrackId":');
    console.log('-'.repeat(60));
    console.log(trackIdSection[0].substring(0, 300));
    console.log('-'.repeat(60));
  } else {
    console.log('⚠️  "TrackId" non trouvé dans le HTML');
  }
  
  console.log('');
  
  // Chercher participants
  console.log('🔍 Recherche des participants...');
  const participantsMatch = html.match(/<h3>Session Participants<\/h3>\s*<table class="simple">([\s\S]*?)<\/table>/);
  
  if (participantsMatch) {
    const tableContent = participantsMatch[1];
    const rows = tableContent.match(/<tr>(.*?)<\/tr>/gs);
    const participantRows = rows ? rows.filter(r => !r.includes('<th')) : [];
    console.log('   ✅ Section trouvée:', participantRows.length, 'participants');
  } else {
    console.log('   ❌ Section "Session Participants" non trouvée');
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log('Track ID:', trackId || '❌ NON DÉTECTÉ');
  console.log('Participants:', participantsMatch ? '✅ OK' : '❌ NON TROUVÉS');
  console.log('');
  
  if (!trackId) {
    console.log('⚠️  ACTION REQUISE:');
    console.log('   1. Copie l\'extrait HTML ci-dessus');
    console.log('   2. Envoie-le pour créer une regex sur mesure');
  } else {
    console.log('✅ Tout fonctionne ! Le scraper devrait marcher.');
  }
  
  console.log('='.repeat(60));
}

// Lancer le test
fetchStatus(SERVER_URL)
  .then(html => {
    analyzeHTML(html);
  })
  .catch(err => {
    console.error('');
    console.error('❌ ERREUR:', err.message);
    console.error('');
    console.error('Causes possibles:');
    console.error('  - Le serveur AMS2 n\'est pas démarré');
    console.error('  - L\'URL est incorrecte');
    console.error('  - Le port 9000 est bloqué par le pare-feu');
    console.error('  - Tu n\'es pas en session (dans les menus)');
    console.error('');
  });
