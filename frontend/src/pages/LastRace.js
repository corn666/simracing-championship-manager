import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/App.css';

function LastRace() {
  const [raceData, setRaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverLaps, setDriverLaps] = useState([]);

  // Charger les données de course
  const loadRaceData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pit-wall/live-data`);
      if (!response.ok) throw new Error('Impossible de charger les données');
      
      const data = await response.json();
      
      // La sauvegarde est maintenant gérée automatiquement par le backend
      // Plus besoin de déclencher manuellement depuis le frontend
      
      setRaceData(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Charger les tours d'un pilote
  const loadDriverLaps = async (participantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pit-wall/driver-laps/${participantId}`);
      if (!response.ok) throw new Error('Impossible de charger les tours');
      
      const laps = await response.json();
      setDriverLaps(laps);
    } catch (err) {
      console.error('Erreur:', err);
      setDriverLaps([]);
    }
  };

  // Auto-refresh
  useEffect(() => {
    loadRaceData();
    
    if (autoRefresh) {
      const interval = setInterval(loadRaceData, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Clic sur un pilote
  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    loadDriverLaps(driver.participantId);
  };

  const closeModal = () => {
    setSelectedDriver(null);
    setDriverLaps([]);
  };

  // Formatage
  const formatTime = (ms) => {
    if (!ms || ms === 0) return '---';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
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
          <h1>🏁 Dernière Course - Live Timing</h1>
        </div>
        <div className="loading">Chargement des données de course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header-centered">
          <h1>🏁 Dernière Course - Live Timing</h1>
        </div>
        <div className="error-message">
          ⚠️ Erreur : {error}
          <br />
          <small>Configurez le chemin dans les Paramètres</small>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-centered">
        <h1>🏁 Dernière Course - Live Timing</h1>
        <div className="auto-refresh-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (2s)
          </label>
        </div>
      </div>

      {/* Info course */}
      <div className="pit-wall-info">
        <div className="race-header">
          <div className="race-title">
            <h2>{raceData.raceInfo.track}</h2>
            <div className="race-progress">
              Lap {raceData.raceInfo.currentLap}/{raceData.raceInfo.totalLaps} • Start: {raceData.raceInfo.startTime}
            </div>
          </div>
          <div className="race-stats">
            <div className="stat-box">
              <div className="stat-label">CLASS BEST</div>
              <div className="stat-value time-purple">{raceData.raceInfo.bestLap}</div>
              <div className="stat-driver">{raceData.raceInfo.fastestDriver}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="pit-wall-table-container">
        <table className="pit-wall-table">
          <thead>
            <tr>
              <th className="col-pos">POS</th>
              <th className="col-driver">DRIVER</th>
              <th className="col-vehicle">VEHICLE</th>
              <th className="col-class">CLASS</th>
              <th className="col-pit">PIT INFO</th>
              <th className="col-lap">LAP</th>
              <th className="col-gap">GAP</th>
              <th className="col-int">INT</th>
              <th className="col-time">BEST LAP</th>
              <th className="col-time">LAST LAP</th>
              <th className="col-sector">S1</th>
              <th className="col-sector">S2</th>
              <th className="col-sector">S3</th>
            </tr>
          </thead>
          <tbody>
            {raceData.drivers.map((driver, index) => (
              <tr 
                key={index} 
                className={`${driver.isPlayer ? 'player-row' : ''} driver-clickable`}
                onClick={() => handleDriverClick(driver)}
                title="Cliquez pour voir les détails"
              >
                <td className="col-pos">
                  <div className="position-badge" style={{ backgroundColor: driver.isPlayer ? '#00ff00' : '#666' }}>
                    {driver.pos}
                  </div>
                </td>
                <td className="col-driver">
                  <div className="driver-info">
                    {driver.isPlayer && <span className="player-icon">👤</span>}
                    <span className="driver-name">{driver.name}</span>
                  </div>
                </td>
                <td className="col-vehicle">
                  <span className="vehicle-name">{driver.vehicle}</span>
                </td>
                <td className="col-class">
                  <span className="class-badge">{driver.class}</span>
                </td>
                <td className="col-pit">{driver.pitInfo}</td>
                <td className="col-lap">{driver.lap}</td>
                <td className="col-gap">{driver.gap}</td>
                <td className="col-int">{driver.interval}</td>
                <td className={`col-time ${driver.pos === 1 ? 'time-purple' : ''}`}>
                  {driver.bestLap}
                </td>
                <td className={`col-time ${getTimeClass(driver.lastLapRaw, driver.bestLapRaw, false)}`}>
                  {driver.lastLap}
                </td>
                <td className="col-sector">{driver.s1}</td>
                <td className="col-sector">{driver.s2}</td>
                <td className="col-sector">{driver.s3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal détails */}
      {selectedDriver && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏎️ {selectedDriver.name}</h2>
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

export default LastRace;
