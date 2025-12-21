import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import '../styles/App.css';

function Calendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error('Erreur chargement événements');
      
      const data = await response.json();
      
      // Trier par date (plus proche en premier)
      const sortedEvents = data.sort((a, b) => {
        return new Date(a.event_date) - new Date(b.event_date);
      });
      
      setEvents(sortedEvents);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'À venir', color: '#4CAF50' },
      ongoing: { text: 'En cours', color: '#2196F3' },
      completed: { text: 'Terminé', color: '#9E9E9E' }
    };
    
    const badge = badges[status] || badges.upcoming;
    
    return (
      <span style={{
        backgroundColor: badge.color,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {badge.text}
      </span>
    );
  };

  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header-centered">
          <h1>📅 Calendrier</h1>
        </div>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header-centered">
          <h1>📅 Calendrier</h1>
        </div>
        <div className="error">Erreur : {error}</div>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => !isPastEvent(e.event_date));
  const pastEvents = events.filter(e => isPastEvent(e.event_date));

  return (
    <div className="container">
      <div className="header-centered">
        <h1>📅 Calendrier</h1>
      </div>

      {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
        <div className="empty-state">
          <p>Aucun événement programmé</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/events')}
          >
            Aller aux événements
          </button>
        </div>
      ) : (
        <>
          {/* Événements à venir */}
          {upcomingEvents.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>
                🏁 Événements à venir ({upcomingEvents.length})
              </h2>
              <div style={{ display: 'grid', gap: '15px' }}>
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid #4CAF50',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '20px' }}>
                          {event.name}
                        </h3>
                        <p style={{ color: '#aaa', margin: '0', fontSize: '14px' }}>
                          🏎️ {event.circuit}
                        </p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    <p style={{ color: '#4CAF50', margin: '0', fontSize: '16px', fontWeight: '600' }}>
                      📅 {formatDate(event.event_date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Événements passés */}
          {pastEvents.length > 0 && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>
                ✅ Événements passés ({pastEvents.length})
              </h2>
              <div style={{ display: 'grid', gap: '15px' }}>
                {pastEvents.map(event => (
                  <div 
                    key={event.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'all 0.2s'
                    }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = 1;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = 0.7;
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '18px' }}>
                          {event.name}
                        </h3>
                        <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                          🏎️ {event.circuit}
                        </p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    <p style={{ color: '#888', margin: '0', fontSize: '14px' }}>
                      📅 {formatDate(event.event_date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Calendar;
