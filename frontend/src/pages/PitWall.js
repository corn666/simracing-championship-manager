import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/App.css';

function PitWall() {
  const [trackMap, setTrackMap] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredParticipant, setHoveredParticipant] = useState(null);
  const canvasRef = useRef(null);

  // Polling des positions toutes les 250ms
  useEffect(() => {
    // Charger Spa par défaut au démarrage
    loadTrackMap('775712153');
    
    fetchLivePositions(); // Premier appel immédiat
    
    const interval = setInterval(() => {
      fetchLivePositions();
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Charger le tracé quand trackId change (et différent du défaut)
  useEffect(() => {
    if (currentTrackId && currentTrackId !== 775712153) {
      loadTrackMap(currentTrackId);
    }
  }, [currentTrackId]);

  const loadTrackMap = async (trackId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trackmaps/${trackId}`);
      
      if (!response.ok) {
        setError(`Tracé non disponible pour le circuit ${trackId}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setTrackMap(data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchLivePositions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pit-wall/live-positions`);
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer les positions');
      }
      
      const data = await response.json();
      setParticipants(data.participants || []);
      
      // Charger le circuit si trackId change
      if (data.trackId && data.trackId !== currentTrackId) {
        setCurrentTrackId(data.trackId);
      }
    } catch (err) {
      console.error('Erreur fetch positions:', err);
    }
  };

  // Dessiner le circuit + participants
  useEffect(() => {
    if (trackMap && canvasRef.current) {
      drawScene();
    }
  }, [trackMap, participants, hoveredParticipant]);

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const coordinates = trackMap.line_mid;

    if (!coordinates || coordinates.length === 0) {
      return;
    }

    // Calculer les bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    coordinates.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const trackWidth = maxX - minX;
    const trackHeight = maxY - minY;

    const padding = 30;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const scaleX = (canvasWidth - padding * 2) / trackWidth;
    const scaleY = (canvasHeight - padding * 2) / trackHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padding + (canvasWidth - padding * 2 - trackWidth * scale) / 2;
    const offsetY = padding + (canvasHeight - padding * 2 - trackHeight * scale) / 2;

    // Fonction pour transformer coordonnées circuit -> canvas
    const toCanvasCoords = (x, y) => ({
      x: offsetX + (x - minX) * scale,
      y: offsetY + (maxY - y) * scale // Inverser Y
    });

    // Effacer
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Fond noir
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Dessiner le circuit
    ctx.strokeStyle = '#2d5c2d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    coordinates.forEach(([x, y], index) => {
      const canvasPos = toCanvasCoords(x, y);
      if (index === 0) {
        ctx.moveTo(canvasPos.x, canvasPos.y);
      } else {
        ctx.lineTo(canvasPos.x, canvasPos.y);
      }
    });
    ctx.stroke();

    // Ligne Start/Finish (perpendiculaire au circuit)
    const [startX, startY] = coordinates[0];
    const [nextX, nextY] = coordinates[1];
    const startPos = toCanvasCoords(startX, startY);
    
    // Calculer la direction du circuit
    const dx = nextX - startX;
    const dy = nextY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Vecteur perpendiculaire (tourné de 90°)
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Longueur de la ligne S/F en pixels
    const sfLineLength = 20;
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(
      startPos.x + perpX * sfLineLength * scale / 1000,
      startPos.y - perpY * sfLineLength * scale / 1000
    );
    ctx.lineTo(
      startPos.x - perpX * sfLineLength * scale / 1000,
      startPos.y + perpY * sfLineLength * scale / 1000
    );
    ctx.stroke();

    // Dessiner les participants
    participants.forEach(p => {
      // Utiliser X et Z (pas Y qui est la hauteur)
      if (p.positionX === 0 && p.positionZ === 0) return; // Pas de position

      const pos = toCanvasCoords(p.positionX, p.positionZ);

      // Couleur : vert pour joueurs, blanc pour IA
      const color = p.isPlayer ? '#00ff00' : '#ffffff';

      // Point pour la voiture
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Contour noir pour mieux voir
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Afficher le nom si survolé
      if (hoveredParticipant && hoveredParticipant.name === p.name) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        const textWidth = ctx.measureText(p.name).width;
        ctx.fillRect(pos.x + 10, pos.y - 18, textWidth + 10, 18);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(p.name, pos.x + 15, pos.y - 6);
      }
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || !trackMap || participants.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Recalculer les bounds
    const coordinates = trackMap.line_mid;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    coordinates.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const trackWidth = maxX - minX;
    const trackHeight = maxY - minY;
    const padding = 30;
    const scaleX = (canvas.width - padding * 2) / trackWidth;
    const scaleY = (canvas.height - padding * 2) / trackHeight;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = padding + (canvas.width - padding * 2 - trackWidth * scale) / 2;
    const offsetY = padding + (canvas.height - padding * 2 - trackHeight * scale) / 2;

    const toCanvasCoords = (x, y) => ({
      x: offsetX + (x - minX) * scale,
      y: offsetY + (maxY - y) * scale
    });

    // Trouver le participant le plus proche de la souris
    let closest = null;
    let minDist = 15;

    participants.forEach(p => {
      if (p.positionX === 0 && p.positionZ === 0) return;
      
      const pos = toCanvasCoords(p.positionX, p.positionZ);
      const dist = Math.sqrt((pos.x - mouseX) ** 2 + (pos.y - mouseY) ** 2);

      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    });

    setHoveredParticipant(closest);
  };

  const formatTime = (ms) => {
    if (!ms || ms === 0) return '-';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  };

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a'}}>
        <div style={{color: '#4CAF50', fontSize: '24px'}}>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a'}}>
        <div style={{color: '#ff0000', fontSize: '18px'}}>⚠️ {error}</div>
      </div>
    );
  }

  // Trier par meilleur temps (fastest lap)
  const sortedParticipants = [...participants].sort((a, b) => {
    // Si pas de temps, mettre à la fin
    if (!a.fastestLapTime) return 1;
    if (!b.fastestLapTime) return -1;
    return a.fastestLapTime - b.fastestLapTime;
  });

  // Trouver le meilleur temps global
  const globalBest = sortedParticipants.length > 0 && sortedParticipants[0].fastestLapTime 
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
      <div style={{ flex: '0 0 45%' }}>
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
      </div>

      {/* Tableau timing */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <table className="pit-wall-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="col-pos">POS</th>
              <th className="col-driver">DRIVER</th>
              <th className="col-time">S1</th>
              <th className="col-time">S2</th>
              <th className="col-time">S3</th>
              <th className="col-time">LAST LAP</th>
              <th className="col-time">BEST LAP</th>
              <th className="col-pit">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map((p, index) => (
              <tr 
                key={p.participantId}
                className={p.isPlayer ? 'player-row' : ''}
                style={{
                  transition: 'all 0.3s ease-out',
                  transform: 'translateY(0)'
                }}
              >
                <td className="col-pos">
                  <div className="position-badge" style={{ backgroundColor: p.isPlayer ? '#00ff00' : '#666' }}>
                    {index + 1}
                  </div>
                </td>
                <td className="col-driver">
                  <div className="driver-info">
                    {p.isPlayer && <span className="player-icon">👤</span>}
                    <span className="driver-name">{p.name}</span>
                  </div>
                </td>
                <td className="col-time">{formatTime(p.sector1Time)}</td>
                <td className="col-time">{formatTime(p.sector2Time)}</td>
                <td className="col-time">{formatTime(p.sector3Time)}</td>
                <td className="col-time">{formatTime(p.lastLapTime)}</td>
                <td className={`col-time ${p.fastestLapTime === globalBest && globalBest ? 'time-purple' : p.fastestLapTime ? 'time-green' : ''}`}>
                  {formatTime(p.fastestLapTime)}
                </td>
                <td className="col-pit" style={{ 
                  color: p.state === 'Racing' ? '#4CAF50' : 
                         p.state.includes('Pit') ? '#ff9800' : '#888'
                }}>
                  {p.state}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PitWall;
