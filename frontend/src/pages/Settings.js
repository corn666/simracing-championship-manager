import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import '../styles/App.css';

function Settings() {
  const navigate = useNavigate();
  const [smsStatsPath, setSmsStatsPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testingConnection, setTestingConnection] = useState(false);
  
  // SSL States
  const [sslEnabled, setSslEnabled] = useState(false);
  const [sslPublicCert, setSslPublicCert] = useState(null);
  const [sslPrivateKey, setSslPrivateKey] = useState(null);
  const [sslIntermediateCert, setSslIntermediateCert] = useState(null);
  const [sslMessage, setSslMessage] = useState({ type: '', text: '' });
  const [sslStatus, setSslStatus] = useState(''); // 'configured', 'not_configured'

  // Détecter si on est en HTTPS
  const isHttps = window.location.protocol === 'https:';

  // Charger les paramètres au montage
  useEffect(() => {
    loadSettings();
    // Si on est connecté en HTTPS, cocher automatiquement la case SSL
    if (isHttps) {
      setSslEnabled(true);
    }
  }, [isHttps]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      if (!response.ok) throw new Error('Erreur chargement paramètres');
      
      const data = await response.json();
      setSmsStatsPath(data.sms_stats_path || '');
      setSslEnabled(data.ssl_enabled === 'true' || false);
      setSslStatus(data.ssl_status || 'not_configured');
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setMessage({ type: 'error', text: 'Impossible de charger les paramètres' });
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!smsStatsPath.trim()) {
      setMessage({ type: 'error', text: 'Le chemin du fichier est requis' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms_stats_path: smsStatsPath })
      });

      if (!response.ok) throw new Error('Erreur sauvegarde');

      setMessage({ type: 'success', text: '✅ Paramètres sauvegardés avec succès !' });
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' });
    }
  };

  const handleTestConnection = async () => {
    if (!smsStatsPath.trim()) {
      setMessage({ type: 'error', text: 'Veuillez d\'abord entrer un chemin' });
      return;
    }

    setTestingConnection(true);
    setMessage({ type: '', text: '' });

    try {
      // Sauvegarder d'abord le chemin
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms_stats_path: smsStatsPath })
      });

      // Tester la connexion
      const response = await fetch(`${API_BASE_URL}/api/pit-wall/live-data`);
      
      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: `✅ Connexion réussie ! Course détectée : ${data.raceInfo.track}` 
        });
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: `❌ ${error.error || 'Fichier non trouvé ou invalide'}` 
        });
      }
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: '❌ Impossible de lire le fichier. Vérifiez le chemin.' 
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleFileSelect = () => {
    // Créer un input file invisible pour ouvrir le dialogue
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Le navigateur ne donne que le nom du fichier, pas le chemin complet
        // On vérifie si c'est le bon fichier et on aide l'utilisateur
        if (file.name === 'sms_stats_data.json') {
          setMessage({
            type: 'info',
            text: `✅ Fichier "${file.name}" sélectionné.\n\n💡 Le navigateur ne peut pas récupérer le chemin complet pour des raisons de sécurité.\n\nCopiez le chemin complet du fichier depuis l'Explorateur Windows (clic droit → "Copier en tant que chemin") et collez-le dans le champ ci-dessus.`
          });
        } else {
          setMessage({
            type: 'error',
            text: `⚠️ Le fichier sélectionné est "${file.name}".\n\nVeuillez sélectionner "sms_stats_data.json" généré par le serveur dédié AMS2.`
          });
        }
      }
    };

    input.click();
  };

  const handleSslToggle = async (enabled) => {
    setSslEnabled(enabled);

    // Sauvegarder l'état SSL en base de données
    try {
      await fetch(`${API_BASE_URL}/api/settings/ssl_enabled`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: enabled ? 'true' : 'false' })
      });

      if (!enabled && isHttps) {
        setSslMessage({
          type: 'info',
          text: '⚠️ SSL désactivé. Redémarrez l\'application pour passer en HTTP.'
        });
      } else if (!enabled) {
        setSslMessage({ type: 'success', text: '✅ SSL désactivé.' });
        setTimeout(() => setSslMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Erreur toggle SSL:', err);
    }
  };

  const handleSslUpload = async () => {
    if (!sslEnabled) {
      setSslMessage({ type: 'error', text: 'Cochez la case "Activer SSL/HTTPS" d\'abord' });
      return;
    }

    if (!sslPublicCert || !sslPrivateKey || !sslIntermediateCert) {
      setSslMessage({ type: 'error', text: 'Tous les fichiers sont requis (certificat public, clé privée, certificat intermédiaire)' });
      return;
    }

    const formData = new FormData();
    formData.append('ssl_enabled', sslEnabled);
    formData.append('ssl_public_cert', sslPublicCert);
    formData.append('ssl_private_key', sslPrivateKey);
    formData.append('ssl_intermediate_cert', sslIntermediateCert);

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/ssl`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      setSslMessage({ 
        type: 'success', 
        text: '✅ Certificats SSL installés avec succès !\n\n🔄 Redémarrez l\'application pour activer HTTPS sur le port 8081.' 
      });
      setSslStatus('configured');
      
      setTimeout(() => setSslMessage({ type: '', text: '' }), 10000);
      
    } catch (err) {
      console.error('Erreur SSL:', err);
      setSslMessage({ type: 'error', text: `❌ ${err.message}` });
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header-centered">
          <h1>⚙️ Paramètres</h1>
        </div>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-centered">
        <h1>⚙️ Paramètres</h1>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h2>🏁 Configuration Pit Wall</h2>
          <p className="settings-description">
            Configurez le chemin vers le fichier <code>sms_stats_data.json</code> généré par le serveur dédié AMS2.
          </p>

          <form onSubmit={handleSave} className="settings-form">
            <div className="form-group">
              <label htmlFor="sms-stats-path">
                📁 Chemin du fichier sms_stats_data.json
              </label>
              <div className="input-with-button">
                <input
                  id="sms-stats-path"
                  type="text"
                  value={smsStatsPath}
                  onChange={(e) => setSmsStatsPath(e.target.value)}
                  placeholder="C:\AMS2\UserData\Dedicated\sms_stats_data.json"
                  className="file-path-input"
                />
                <button 
                  type="button" 
                  onClick={handleFileSelect}
                  className="btn-secondary"
                  title="Parcourir"
                >
                  📂 Parcourir
                </button>
              </div>
              <small className="input-hint">
                Windows : <code>C:\Program Files\Steam\steamapps\common\Automobilista 2\UserData\Dedicated\sms_stats_data.json</code>
                <br />
                Linux : <code>/home/user/.steam/steam/steamapps/common/Automobilista 2/UserData/Dedicated/sms_stats_data.json</code>
              </small>
            </div>

            {message.text && (
              <div className={`message message-${message.type}`} style={{whiteSpace: 'pre-line'}}>
                {message.text}
              </div>
            )}

            <div className="settings-actions">
              <button type="submit" className="btn-primary">
                💾 Sauvegarder
              </button>
              <button 
                type="button" 
                onClick={handleTestConnection}
                className="btn-test"
                disabled={testingConnection}
              >
                {testingConnection ? '⏳ Test en cours...' : '🔍 Tester la connexion'}
              </button>
            </div>
          </form>
        </div>

        {/* Section SSL */}
        <div className="settings-section" style={{marginTop: '30px'}}>
          <h2>🔒 Sécurité HTTPS / SSL</h2>
          <p className="settings-description">
            Activez HTTPS pour sécuriser les communications. Nécessite des certificats SSL valides.
          </p>

          {sslStatus === 'configured' && (
            <div className="message message-success" style={{marginBottom: '15px'}}>
              ✅ SSL configuré - L'application utilise HTTPS sur le port 8081
            </div>
          )}

          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
              <input
                type="checkbox"
                checked={sslEnabled}
                onChange={(e) => handleSslToggle(e.target.checked)}
                style={{marginRight: '10px', width: '20px', height: '20px'}}
              />
              <span>Activer SSL/HTTPS {isHttps && '(actuellement connecté en HTTPS)'}</span>
            </label>
          </div>

          {sslMessage.text && !sslEnabled && (
            <div className={`message message-${sslMessage.type}`} style={{whiteSpace: 'pre-line', marginTop: '10px'}}>
              {sslMessage.text}
            </div>
          )}

          {sslEnabled && (
            <div style={{marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
              <div className="form-group">
                <label htmlFor="ssl-public-cert">
                  📄 Certificat public (.cer)
                </label>
                <input
                  id="ssl-public-cert"
                  type="file"
                  accept=".cer,.crt,.pem"
                  onChange={(e) => setSslPublicCert(e.target.files[0])}
                  style={{color: '#333'}}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ssl-private-key">
                  🔑 Clé privée (.key)
                </label>
                <input
                  id="ssl-private-key"
                  type="file"
                  accept=".key,.pem"
                  onChange={(e) => setSslPrivateKey(e.target.files[0])}
                  style={{color: '#333'}}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ssl-intermediate-cert">
                  🔗 Certificat intermédiaire (.cer)
                </label>
                <input
                  id="ssl-intermediate-cert"
                  type="file"
                  accept=".cer,.crt,.pem"
                  onChange={(e) => setSslIntermediateCert(e.target.files[0])}
                  style={{color: '#333'}}
                />
              </div>

              {sslMessage.text && (
                <div className={`message message-${sslMessage.type}`} style={{whiteSpace: 'pre-line'}}>
                  {sslMessage.text}
                </div>
              )}

              <button 
                type="button"
                onClick={handleSslUpload}
                className="btn-primary"
                style={{marginTop: '15px'}}
              >
                🔒 Installer les certificats SSL
              </button>

              <p style={{marginTop: '15px', color: '#666', fontSize: '14px'}}>
                💡 Après l'installation, <strong>redémarrez l'application</strong> pour activer HTTPS.
                <br />
                L'application sera accessible sur <code>https://votre-domaine.fr:8081</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
