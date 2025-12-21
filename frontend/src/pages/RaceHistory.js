import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import '../styles/App.css';

function RaceHistory() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null);
  const [raceDetails, setRaceDetails] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverLaps, setDriverLaps] = useState([]);
  const [events, setEvents] = useState([]);
  const [showLinkEvent, setShowLinkEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [linkMessage, setLinkMessage] = useState('');

  useEffect(() => {
    loadRaces();
    loadEvents();
  }, []);

  const loadRaces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/race-history`);
      if (!response.ok) throw new Error('Erreur chargement');
      
      const data = await response.json();
      setRaces(data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error('Erreur chargement événements');
      
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const linkRaceToEvent = async () => {
    if (!selectedEvent) {
      setLinkMessage('Veuillez sélectionner un événement');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/race-history/${selectedRace}/link-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent })
      });

      if (response.ok) {
        setLinkMessage('✅ Course liée à l\'événement !');
        setShowLinkEvent(false);
        setSelectedEvent('');
        loadRaceDetails(selectedRace); // Reload details
        setTimeout(() => setLinkMessage(''), 3000);
      } else {
        setLinkMessage('❌ Erreur lors de la liaison');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setLinkMessage('❌ Erreur lors de la liaison');
    }
  };

  const handleUnlinkEvent = async () => {
    if (!window.confirm('Détacher cette course de l\'événement ?\n\nCela supprimera les résultats et recalculera le classement du championnat.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/race-history/${selectedRace}/unlink-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.wasReferenceRace) {
          setLinkMessage('⚠️ Course de référence détachée ! Le roster du championnat a été réinitialisé.');
        } else {
          setLinkMessage('✅ Course détachée de l\'événement !');
        }
        
        loadRaceDetails(selectedRace); // Reload details
        setTimeout(() => setLinkMessage(''), 5000);
      } else {
        setLinkMessage('❌ Erreur lors du détachement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setLinkMessage('❌ Erreur lors du détachement');
    }
  };

  const loadRaceDetails = async (raceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/race-history/${raceId}`);
      if (!response.ok) throw new Error('Erreur chargement détails');
      
      const data = await response.json();
      console.log('Race details loaded:', data);
      console.log('track_name:', data.track_name);
      console.log('start_time:', data.start_time);
      console.log('duration:', data.duration);
      console.log('total_laps:', data.total_laps);
      console.log('total_drivers:', data.total_drivers);
      console.log('participants length:', data.participants?.length);
      console.log('participants sample:', data.participants?.[0]);
      console.log('event_id:', data.event_id);
      setRaceDetails(data);
      setSelectedRace(raceId);
      
      // Si la course est liée, fermer le toggle
      if (data.event_id) {
        setShowLinkEvent(false);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const deleteRace = async (raceId) => {
    if (!window.confirm('Supprimer cette course de l\'historique ?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/race-history/${raceId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadRaces();
        if (selectedRace === raceId) {
          setSelectedRace(null);
          setRaceDetails(null);
        }
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const loadDriverLaps = async (raceId, driverName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/race-history/${raceId}/driver-laps/${encodeURIComponent(driverName)}`);
      if (!response.ok) throw new Error('Impossible de charger les tours');
      
      const laps = await response.json();
      setDriverLaps(laps);
    } catch (err) {
      console.error('Erreur chargement tours:', err);
      setDriverLaps([]);
    }
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    loadDriverLaps(selectedRace, driver.driver_name);
  };

  const closeModal = () => {
    setSelectedDriver(null);
    setDriverLaps([]);
  };

  const formatTime = (ms) => {
    if (!ms || ms === 0) return '---';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSector = (ms) => {
    if (!ms || ms === 0) return '---.---';
    const seconds = Math.floor(ms / 1000);
    const millis = ms % 1000;
    return `${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  };

  const getTimeClass = (currentTime, previousTime, isFastestOverall) => {
    if (isFastestOverall) return 'time-purple';
    if (!previousTime || currentTime === 0) return '';
    if (currentTime < previousTime) return 'time-green';
    if (currentTime > previousTime) return 'time-yellow';
    return '';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header-centered">
          <h1>📜 Historique des Courses</h1>
        </div>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-centered">
        <h1>📜 Historique des Courses</h1>
      </div>

      {races.length === 0 ? (
        <div className="empty-state">
          <p>Aucune course enregistrée pour le moment.</p>
          <small>Les courses terminées seront automatiquement sauvegardées ici.</small>
        </div>
      ) : (
        <div className="history-layout">
          {/* Liste des courses */}
          <div className="races-list">
            <h2>Courses ({races.length})</h2>
            {races.map(race => (
              <div 
                key={race.id}
                className={`race-card ${selectedRace === race.id ? 'selected' : ''}`}
                onClick={() => loadRaceDetails(race.id)}
              >
                <div className="race-card-header">
                  <h3>{race.track_name}</h3>
                  <button 
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteRace(race.id); }}
                  >
                    🗑️
                  </button>
                </div>
                <div className="race-card-info">
                  <div className="info-row">
                    <span className="label">📅 Date:</span>
                    <span>{formatDate(race.start_time)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">🏆 Vainqueur:</span>
                    <span>{race.winner_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">⚡ Meilleur tour:</span>
                    <span>{formatTime(race.fastest_lap_time)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">💥 Collisions:</span>
                    <span className="collision-count">{race.total_collisions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Détails de la course sélectionnée */}
          <div className="race-details">
            {!raceDetails ? (
              <div className="empty-state">
                <p>Sélectionnez une course pour voir les détails</p>
              </div>
            ) : (
              <>
                <h2>Détails - {raceDetails.track_name}</h2>
                
                <div className="details-section">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <h3 style={{margin: 0}}>📊 Informations</h3>
                    
                    {/* Toggle Championnat */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span style={{color: '#fff', fontSize: '15px'}}>Championnat</span>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={raceDetails.event_id ? true : showLinkEvent}
                          onChange={(e) => {
                            if (raceDetails.event_id) {
                              // Détacher
                              handleUnlinkEvent();
                            } else {
                              // Activer/désactiver le panneau de liaison
                              setShowLinkEvent(e.target.checked);
                              if (!e.target.checked) setSelectedEvent('');
                            }
                          }}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      {raceDetails.event_id && (
                        <span style={{color: '#4CAF50', fontSize: '13px'}}>✓ Lié</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Circuit:</span>
                      <span>{raceDetails.track_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span>{formatDate(raceDetails.start_time)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Durée:</span>
                      <span>{formatDuration(raceDetails.duration)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tours:</span>
                      <span>{raceDetails.total_laps}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pilotes:</span>
                      <span>{raceDetails.total_drivers}</span>
                    </div>
                    <div className="detail-item collision-highlight">
                      <span className="detail-label">💥 Collisions totales:</span>
                      <span className="collision-count-big">{raceDetails.total_collisions}</span>
                    </div>
                  </div>
                  
                  {/* Menu déroulant si checkbox cochée */}
                  {showLinkEvent && (
                    <div style={{marginTop: '20px', padding: '15px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px'}}>
                      {linkMessage && (
                        <div style={{padding: '10px', marginBottom: '10px', background: linkMessage.includes('✅') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(220, 53, 69, 0.2)', borderRadius: '5px', color: '#fff'}}>
                          {linkMessage}
                        </div>
                      )}
                      
                      {events.length === 0 ? (
                        <p style={{color: '#fff', margin: 0}}>
                          Aucun événement disponible. <a href="/events" style={{color: '#4CAF50'}}>Créez un événement</a>
                        </p>
                      ) : (
                        <>
                          <select 
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              marginBottom: '10px',
                              fontSize: '14px',
                              borderRadius: '5px',
                              border: '2px solid #4CAF50',
                              background: '#fff',
                              color: '#000'
                            }}
                          >
                            <option value="">-- Sélectionner un événement --</option>
                            {events.map(event => (
                              <option key={event.id} value={event.id}>
                                {event.name} - {event.circuit} ({new Date(event.event_date).toLocaleDateString('fr-FR')})
                              </option>
                            ))}
                          </select>
                          
                          <button 
                            onClick={linkRaceToEvent}
                            className="btn btn-success"
                            disabled={!selectedEvent}
                          >
                            ✓ Lier à l'événement
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="details-section">
                  <h3>🏁 Classement Final</h3>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Pos</th>
                        <th>Pilote</th>
                        <th>Véhicule</th>
                        <th>Classe</th>
                        <th>Meilleur Tour</th>
                        <th>Tours</th>
                        <th>💥 Collisions</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raceDetails.participants && raceDetails.participants.length > 0 ? (
                        raceDetails.participants.map((p, index) => (
                        <tr 
                          key={index} 
                          className={`${Boolean(p.is_player) ? 'player-row' : ''} driver-clickable`}
                          onClick={() => handleDriverClick(p)}
                          title="Cliquez pour voir les détails des tours"
                        >
                          <td className="pos-cell">
                            <div className="position-badge-small" style={{ backgroundColor: index < 3 ? '#ffd700' : '#666' }}>
                              {p.final_position}
                            </div>
                          </td>
                          <td className="driver-cell">
                            {p.driver_name}
                          </td>
                          <td style={{fontSize: '13px'}}>{p.vehicle_name || 'Unknown'}</td>
                          <td><span className="class-badge">{p.vehicle_class || 'N/A'}</span></td>
                          <td className="time-cell">{formatTime(p.best_lap_time)}</td>
                          <td>{p.total_laps}</td>
                          <td className="collision-cell">{p.total_collisions}</td>
                          <td className={`status-${p.status.toLowerCase()}`}>{p.status}</td>
                        </tr>
                      ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{textAlign: 'center', padding: '20px', color: '#aaa'}}>
                            Aucun participant trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal détails des tours */}
      {selectedDriver && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏎️ {selectedDriver.driver_name}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {driverLaps.length === 0 ? (
                <div className="loading">Chargement...</div>
              ) : (
                <table className="laps-table">
                  <thead>
                    <tr>
                      <th>Tour</th>
                      <th>Temps</th>
                      <th>S1</th>
                      <th>S2</th>
                      <th>S3</th>
                      <th>Pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverLaps.map((lap, index) => {
                      const prevLap = index > 0 ? driverLaps[index - 1] : null;
                      const isBest = lap.lapTime === Math.min(...driverLaps.map(l => l.lapTime));
                      return (
                        <tr key={index}>
                          <td className="lap-number">{lap.lap + 1}</td>
                          <td className={`lap-time ${getTimeClass(lap.lapTime, prevLap?.lapTime, isBest)}`}>
                            {formatTime(lap.lapTime)}
                          </td>
                          <td className="lap-sector">{formatSector(lap.sector1)}</td>
                          <td className="lap-sector">{formatSector(lap.sector2)}</td>
                          <td className="lap-sector">{formatSector(lap.sector3)}</td>
                          <td className="lap-position">P{lap.position}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaceHistory;
