import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/App.css';

function PitWall() {
  const [trackMap, setTrackMap] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [previousPositions, setPreviousPositions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackMapError, setTrackMapError] = useState(null);
  const [hoveredParticipant, setHoveredParticipant] = useState(null);
  const canvasRef = useRef(null);

  // Polling des positions toutes les 250ms
  useEffect(() => {
    fetchLivePositions();
    
    const interval = setInterval(() => {
      fetchLivePositions();
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Charger le tracé quand trackId change
  useEffect(() => {
    if (currentTrackId) {
      loadTrackMap(currentTrackId);
    }
  }, [currentTrackId]);

  const loadTrackMap = async (trackId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trackmaps/${trackId}`);
      
      if (!response.ok) {
        setTrackMapError(`Tracé non disponible pour ce circuit`);
        setTrackMap(null);
        return;
      }
      
      const data = await response.json();
      
      // Vérifier que line_mid existe
      if (data && data.line_mid && Array.isArray(data.line_mid) && data.line_mid.length > 0) {
        setTrackMap(data);
        setTrackMapError(null);
      } else {
        setTrackMapError('Format de tracé invalide');
        setTrackMap(null);
      }
    } catch (err) {
      setTrackMapError(err.message);
      setTrackMap(null);
    }
  };

  const fetchLivePositions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pit-wall/live-positions`);
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer les positions');
      }
      
      const data = await response.json();
      
      // Sauvegarder les informations de session
      setSessionInfo({
        sessionState: data.sessionState || null,
        sessionStage: data.sessionStage || null,
        trackTemp: data.trackTemp || null,
        airTemp: data.airTemp || null,
        trackName: data.trackName || null
      });
      
      // S'assurer que participants est toujours un tableau
      const participantsArray = Array.isArray(data.participants) ? data.participants : [];
      
      // Sauvegarder les positions précédentes pour l'animation
      const newPositions = {};
      participantsArray.forEach((p, index) => {
        if (p && p.participantId) {
          newPositions[p.participantId] = index + 1;
        }
      });
      setPreviousPositions(newPositions);
      
      setParticipants(participantsArray);
      
      // Charger le circuit si trackId change
      if (data.trackId && data.trackId !== currentTrackId) {
        setCurrentTrackId(data.trackId);
      }
      
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Erreur fetch positions:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Dessiner le circuit + participants
  useEffect(() => {
    if (canvasRef.current) {
      drawScene();
    }
  }, [trackMap, participants, hoveredParticipant]);

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Effacer et fond noir
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Vérifier si trackMap et line_mid existent
    if (!trackMap || !trackMap.line_mid || !Array.isArray(trackMap.line_mid) || trackMap.line_mid.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        trackMapError || 'Tracé du circuit non disponible', 
        canvasWidth / 2, 
        canvasHeight / 2
      );
      return;
    }

    const coordinates = trackMap.line_mid;

    // Calculer les bounds
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    coordinates.forEach(([x, z]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    });

    const trackWidth = maxX - minX;
    const trackHeight = maxZ - minZ;

    const padding = 30;
    const scaleX = (canvasWidth - padding * 2) / trackWidth;
    const scaleZ = (canvasHeight - padding * 2) / trackHeight;
    const scale = Math.min(scaleX, scaleZ);

    const offsetX = padding + (canvasWidth - padding * 2 - trackWidth * scale) / 2;
    const offsetZ = padding + (canvasHeight - padding * 2 - trackHeight * scale) / 2;

    // Fonction pour transformer coordonnées circuit -> canvas
    const toCanvasCoords = (x, z) => ({
      x: offsetX + (x - minX) * scale,
      y: offsetZ + (maxZ - z) * scale // Inverser Z pour Y canvas
    });

    // Dessiner le circuit
    ctx.strokeStyle = '#2d5c2d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    coordinates.forEach(([x, z], index) => {
      const canvasPos = toCanvasCoords(x, z);
      if (index === 0) {
        ctx.moveTo(canvasPos.x, canvasPos.y);
      } else {
        ctx.lineTo(canvasPos.x, canvasPos.y);
      }
    });
    ctx.stroke();

    // Ligne Start/Finish
    const [startX, startZ] = coordinates[0];
    const [nextX, nextZ] = coordinates[1];
    const startPos = toCanvasCoords(startX, startZ);
    
    // Calculer la direction perpendiculaire
    const dx = nextX - startX;
    const dz = nextZ - startZ;
    const length = Math.sqrt(dx * dx + dz * dz);
    
    const perpX = -dz / length;
    const perpZ = dx / length;
    
    const sfLineLength = 20;
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(
      startPos.x + perpX * sfLineLength * scale / 1000,
      startPos.y - perpZ * sfLineLength * scale / 1000
    );
    ctx.lineTo(
      startPos.x - perpX * sfLineLength * scale / 1000,
      startPos.y + perpZ * sfLineLength * scale / 1000
    );
    ctx.stroke();

    // Dessiner les participants avec leurs vraies positions
    if (Array.isArray(participants) && participants.length > 0) {
      participants.forEach(p => {
        if (!p) return;
        
        // Vérifier si le participant a des coordonnées valides
        if (!p.positionX || !p.positionZ || (p.positionX === 0 && p.positionZ === 0)) {
          return; // Pas de position valide
        }

        const pos = toCanvasCoords(p.positionX, p.positionZ);

        // Couleur selon le type
        const color = p.isPlayer ? '#00ff00' : '#ffffff';

        // Dessiner le point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Contour noir
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Afficher le nom si survolé
        if (hoveredParticipant && hoveredParticipant === p.participantId) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.font = 'bold 11px Arial';
          const textWidth = ctx.measureText(p.name).width;
          ctx.fillRect(pos.x + 10, pos.y - 18, textWidth + 10, 18);
          
          ctx.fillStyle = '#fff';
          ctx.fillText(p.name, pos.x + 15, pos.y - 6);
        }
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || !trackMap || !trackMap.line_mid || participants.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const coordinates = trackMap.line_mid;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    coordinates.forEach(([x, z]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    });

    const trackWidth = maxX - minX;
    const trackHeight = maxZ - minZ;
    const padding = 30;
    const scaleX = (canvas.width - padding * 2) / trackWidth;
    const scaleZ = (canvas.height - padding * 2) / trackHeight;
    const scale = Math.min(scaleX, scaleZ);
    const offsetX = padding + (canvas.width - padding * 2 - trackWidth * scale) / 2;
    const offsetZ = padding + (canvas.height - padding * 2 - trackHeight * scale) / 2;

    const toCanvasCoords = (x, z) => ({
      x: offsetX + (x - minX) * scale,
      y: offsetZ + (maxZ - z) * scale
    });

    // Trouver le participant le plus proche de la souris
    let closestParticipant = null;
    let closestDistance = Infinity;

    participants.forEach(p => {
      if (!p.positionX || !p.positionZ) return;
      
      const pos = toCanvasCoords(p.positionX, p.positionZ);
      const distance = Math.sqrt(
        Math.pow(pos.x - mouseX, 2) + Math.pow(pos.y - mouseY, 2)
      );

      if (distance < 15 && distance < closestDistance) {
        closestDistance = distance;
        closestParticipant = p.participantId;
      }
    });

    setHoveredParticipant(closestParticipant);
  };

  const formatTime = (ms) => {
    if (!ms || ms === 0) return '--:--:---';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const formatSector = (ms) => {
    if (!ms || ms === 0) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const formatGap = (currentParticipant, index, sortedParticipants) => {
    if (index === 0) return '--';
    
    const leader = sortedParticipants[0];
    if (!leader || !currentParticipant) return '--';
    
    // Si tours différents
    if (currentParticipant.currentLap < leader.currentLap) {
      const lapDiff = leader.currentLap - currentParticipant.currentLap;
      return `+${lapDiff} LAP${lapDiff > 1 ? 'S' : ''}`;
    }
    
    // Si même tour
    if (currentParticipant.fastestLapTime > 0 && leader.fastestLapTime > 0) {
      const gap = currentParticipant.fastestLapTime - leader.fastestLapTime;
      return `+${(gap / 1000).toFixed(3)}`;
    }
    
    return '--';
  };

  const getSortedParticipants = () => {
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return [];
    }
    
    const isQualifying = sessionInfo?.sessionStage?.toLowerCase()?.includes('qualif') || false;
    
    if (isQualifying) {
      return [...participants].sort((a, b) => {
        if (!a || !b) return 0;
        if (a.fastestLapTime === 0) return 1;
        if (b.fastestLapTime === 0) return -1;
        return a.fastestLapTime - b.fastestLapTime;
      });
    } else {
      return [...participants].sort((a, b) => {
        if (!a || !b) return 0;
        if (a.racePosition === 0) return 1;
        if (b.racePosition === 0) return -1;
        return a.racePosition - b.racePosition;
      });
    }
  };

  const getSessionType = () => {
    if (!sessionInfo?.sessionStage) return 'Session';
    
    const stage = sessionInfo.sessionStage.toLowerCase();
    if (stage.includes('qualif')) return 'QUALIFICATION';
    if (stage.includes('race')) return 'RACE';
    if (stage.includes('practice')) return 'PRACTICE';
    if (stage.includes('warmup')) return 'WARM-UP';
    
    return sessionInfo.sessionStage.toUpperCase();
  };

  // Vérifier si la session est idle
  const isIdle = !sessionInfo || 
                 sessionInfo.sessionState?.toLowerCase() === 'idle' || 
                 sessionInfo.sessionState?.toLowerCase() === 'none' ||
                 sessionInfo.sessionState?.toLowerCase() === 'lobby';

  // État de chargement
  if (loading && !sessionInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff'
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>Loading...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Connecting to AMS2 server...</div>
        </div>
      </div>
    );
  }

  // État "Waiting for race to start"
  if (isIdle) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          color: '#ff0000',
          animation: 'pulse 2s infinite',
          marginBottom: '30px'
        }}>
          WAITING FOR RACE TO START
        </h1>
        <div style={{
          width: '80px',
          height: '80px',
          border: '8px solid #333',
          borderTop: '8px solid #ff0000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const sortedParticipants = getSortedParticipants();
  const globalBest = sortedParticipants.length > 0 && sortedParticipants[0]?.fastestLapTime > 0 
    ? sortedParticipants[0].fastestLapTime 
    : null;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      padding: '10px',
      background: '#0a0a0a',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Canvas circuit */}
      <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column' }}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={800}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredParticipant(null)}
          style={{
            border: '1px solid #333',
            borderRadius: '4px',
            background: '#0a0a0a',
            cursor: 'crosshair',
            width: '100%',
            height: 'auto'
          }}
        />
        
        {/* Informations de session */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid #333',
          borderRadius: '8px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            color: '#fff'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>CIRCUIT</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {sessionInfo?.trackName || (currentTrackId ? `Circuit ID: ${currentTrackId}` : 'Unknown')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>SESSION</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff0000' }}>
                {getSessionType()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>TRACK TEMP</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {sessionInfo?.trackTemp ? `${sessionInfo.trackTemp}°C` : '--°C'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>AIR TEMP</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {sessionInfo?.airTemp ? `${sessionInfo.airTemp}°C` : '--°C'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau timing */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="pit-wall-table-container">
          <table className="pit-wall-table">
            <thead>
              <tr>
                <th className="col-pos">POS</th>
                <th className="col-driver">DRIVER</th>
                <th className="col-lap">LAP</th>
                <th className="col-sector">S1</th>
                <th className="col-sector">S2</th>
                <th className="col-sector">S3</th>
                <th className="col-time">LAST</th>
                <th className="col-time">BEST</th>
                <th className="col-gap">GAP</th>
                <th className="col-class">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sortedParticipants.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No participants
                  </td>
                </tr>
              ) : (
                sortedParticipants.map((p, index) => {
                  if (!p) return null;
                  
                  const previousPos = previousPositions[p.participantId];
                  const currentPos = index + 1;
                  const positionChanged = previousPos && previousPos !== currentPos;

                  return (
                    <tr 
                      key={p.participantId || index}
                      className={`${p.isPlayer ? 'player-row' : ''} ${positionChanged ? 'position-changed' : ''}`}
                      style={{ transition: 'all 0.5s ease-out' }}
                    >
                      <td className="col-pos">
                        <div className="position-badge" style={{ backgroundColor: p.isPlayer ? '#00ff00' : '#666' }}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="col-driver">
                        <div className="driver-info">
                          {p.isPlayer && <span className="player-icon">👤</span>}
                          <span className="driver-name">{p.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="col-lap" style={{ textAlign: 'center', color: '#888' }}>
                        {p.currentLap || 0}
                      </td>
                      <td className="col-sector">{formatSector(p.sector1Time)}</td>
                      <td className="col-sector">{formatSector(p.sector2Time)}</td>
                      <td className="col-sector">{formatSector(p.sector3Time)}</td>
                      <td className="col-time">{formatTime(p.lastLapTime)}</td>
                      <td className={`col-time ${
                        p.fastestLapTime === globalBest ? 'time-purple' : 
                        (p.fastestLapTime > 0 ? 'time-green' : '')
                      }`}>
                        {formatTime(p.fastestLapTime)}
                      </td>
                      <td className="col-gap" style={{ textAlign: 'center', color: '#ffa500' }}>
                        {formatGap(p, index, sortedParticipants)}
                      </td>
                      <td className="col-class">
                        <span className={`class-badge ${p.state === 'Racing' ? 'racing' : ''}`}>
                          {p.state || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PitWall;