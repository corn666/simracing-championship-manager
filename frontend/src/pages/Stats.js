import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

// Formater le temps en mm:ss.xxx
const formatLapTime = (timeMs) => {
  if (!timeMs || timeMs <= 0) return '-';
  const totalSeconds = timeMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  return `${minutes}:${seconds.padStart(6, '0')}`;
};

function Stats() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerTracks, setPlayerTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/players`);
      if (!response.ok) throw new Error('Erreur chargement joueurs');
      const data = await response.json();
      setPlayers(data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const loadPlayerTracks = async (playerName) => {
    setLoadingTracks(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/players/${encodeURIComponent(playerName)}/tracks`);
      if (!response.ok) throw new Error('Erreur chargement stats');
      const data = await response.json();
      setPlayerTracks(data);
      setLoadingTracks(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoadingTracks(false);
    }
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    loadPlayerTracks(player.driver_name);
  };

  const handleBackToList = () => {
    setSelectedPlayer(null);
    setPlayerTracks([]);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header-centered">
          <h1>Stats Joueurs</h1>
        </div>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  // Vue détaillée d'un joueur
  if (selectedPlayer) {
    return (
      <div className="container">
        <div className="header-centered">
          <button
            onClick={handleBackToList}
            className="btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            Retour a la liste
          </button>
          <h1>{selectedPlayer.driver_name}</h1>
          <p style={{ color: '#666', marginTop: '10px' }}>
            {selectedPlayer.total_races} course{selectedPlayer.total_races > 1 ? 's' : ''} - {selectedPlayer.total_laps} tour{selectedPlayer.total_laps > 1 ? 's' : ''} au total
          </p>
        </div>

        {loadingTracks ? (
          <div className="loading">Chargement des stats...</div>
        ) : playerTracks.length === 0 ? (
          <div className="card">
            <p className="empty-state">Aucune donnee de tour disponible</p>
          </div>
        ) : (
          <div className="card">
            <h2>Performances par circuit</h2>
            <table className="results-table" style={{ width: '100%', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Circuit</th>
                  <th style={{ textAlign: 'center' }}>Meilleur temps</th>
                  <th style={{ textAlign: 'center' }}>Record serveur</th>
                  <th style={{ textAlign: 'left' }}>Voiture</th>
                  <th style={{ textAlign: 'center' }}>Tours</th>
                  <th style={{ textAlign: 'center' }}>Courses</th>
                </tr>
              </thead>
              <tbody>
                {playerTracks.map((track, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'left', fontWeight: '500' }}>
                      {track.track_name}
                    </td>
                    <td style={{
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: track.is_server_record ? '#9933ff' : '#28a745',
                      textShadow: track.is_server_record ? '0 0 5px rgba(153, 51, 255, 0.5)' : 'none'
                    }}>
                      {formatLapTime(track.personal_best)}
                      {track.is_server_record && ' *'}
                    </td>
                    <td style={{
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      {formatLapTime(track.server_best)}
                      <br />
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        ({track.server_best_driver})
                      </span>
                    </td>
                    <td style={{ textAlign: 'left', fontSize: '13px' }}>
                      {track.vehicle_name}
                      {track.vehicle_class && (
                        <span style={{ color: '#666', fontSize: '11px', display: 'block' }}>
                          {track.vehicle_class}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {track.total_laps}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {track.races_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                <span style={{ color: '#9933ff', fontWeight: 'bold' }}>* Violet</span> = Record du serveur (meilleur temps de tous les joueurs)
                <br />
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>Vert</span> = Meilleur temps personnel
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vue liste des joueurs
  return (
    <div className="container">
      <div className="header-centered">
        <h1>Stats Joueurs</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          {players.length} joueur{players.length > 1 ? 's' : ''} humain{players.length > 1 ? 's' : ''}
        </p>
      </div>

      {players.length === 0 ? (
        <div className="card">
          <p className="empty-state">Aucun joueur humain dans l'historique des courses</p>
        </div>
      ) : (
        <div className="card">
          <h2>Joueurs</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Cliquez sur un joueur pour voir ses statistiques detaillees
          </p>

          <div style={{ display: 'grid', gap: '10px' }}>
            {players.map((player, index) => (
              <div
                key={index}
                onClick={() => handlePlayerClick(player)}
                style={{
                  padding: '15px 20px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e9ecef';
                  e.currentTarget.style.borderColor = '#1e3c72';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div>
                  <strong style={{ fontSize: '16px', color: '#1e3c72' }}>
                    {player.driver_name}
                  </strong>
                </div>
                <div style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '14px' }}>
                  <span>{player.total_races} course{player.total_races > 1 ? 's' : ''}</span>
                  <span>{player.total_laps} tour{player.total_laps > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Stats;
