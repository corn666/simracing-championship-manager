import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChampionship, getChampionshipStandings, getChampionshipEvents } from '../services/api';

const ChampionshipDetail = () => {
  const { id } = useParams();
  const [championship, setChampionship] = useState(null);
  const [standings, setStandings] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadChampionshipData();
  }, [id]);

  const loadChampionshipData = async () => {
    const champData = await getChampionship(id);
    const standingsData = await getChampionshipStandings(id);
    const eventsData = await getChampionshipEvents(id);
    
    setChampionship(champData);
    setStandings(standingsData);
    setEvents(eventsData);
  };

  if (!championship) {
    return <div className="loading">Chargement...</div>;
  }

  const completedEvents = events.filter(e => e.status === 'finished').length;
  const podium = standings.slice(0, 3);

  return (
    <div className="container">
      <Link to="/championships" style={{color: 'white', textDecoration: 'none', display: 'inline-block', marginBottom: '20px'}}>
        ← Retour aux championnats
      </Link>
      
      <h1 className="title">{championship.name}</h1>
      <p className="subtitle">
        {completedEvents} / {championship.total_races} courses terminées
      </p>
      
      {podium.length >= 3 && completedEvents > 0 && (
        <div className="card">
          <h2>🏆 Podium actuel</h2>
          <div className="podium">
            {podium[1] && (
              <div className="podium-place podium-2">
                <h3>2</h3>
                <div className="pilot-name">{podium[1].name}</div>
                <div className="pilot-points">{podium[1].total_points} pts</div>
              </div>
            )}
            
            {podium[0] && (
              <div className="podium-place podium-1">
                <h3>1</h3>
                <div className="pilot-name">{podium[0].name}</div>
                <div className="pilot-points">{podium[0].total_points} pts</div>
              </div>
            )}
            
            {podium[2] && (
              <div className="podium-place podium-3">
                <h3>3</h3>
                <div className="pilot-name">{podium[2].name}</div>
                <div className="pilot-points">{podium[2].total_points} pts</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="card">
        <h2>📊 Classement général</h2>
        
        {standings.length === 0 ? (
          <p className="empty-state">Aucun résultat pour le moment</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Pilote</th>
                <th>Type</th>
                <th>Courses</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((pilot, index) => (
                <tr key={pilot.id}>
                  <td className="position">{index + 1}</td>
                  <td>{pilot.name}</td>
                  <td>
                    <span className={`badge ${pilot.is_human ? 'badge-human' : 'badge-ai'}`}>
                      {pilot.is_human ? 'Humain' : 'IA'}
                    </span>
                  </td>
                  <td>{pilot.races_completed}</td>
                  <td className="points">{pilot.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="card">
        <h2>🏁 Courses du championnat</h2>
        
        {events.length === 0 ? (
          <p className="empty-state">
            Aucune course pour ce championnat. <Link to="/events">Créez un événement</Link>
          </p>
        ) : (
          <ul className="event-list">
            {events.map(event => (
              <li key={event.id} className="event-item">
                <div className="event-info">
                  <strong>{event.name}</strong>
                  <br />
                  <small style={{color: '#666'}}>
                    {event.circuit} - {new Date(event.event_date).toLocaleDateString('fr-FR')}
                  </small>
                  {' '}
                  <span className={`badge badge-${event.status === 'upcoming' ? 'upcoming' : event.status === 'ongoing' ? 'ongoing' : 'finished'}`}>
                    {event.status === 'upcoming' ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminée'}
                  </span>
                </div>
                <Link to={`/events/${event.id}`}>
                  <button className="btn btn-primary">Voir détails</button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChampionshipDetail;
