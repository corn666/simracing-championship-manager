import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
      if (!response.ok) throw new Error('Erreur chargement événement');
      
      const data = await response.json();
      setEvent(data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMessage(`Statut changé: ${newStatus === 'upcoming' ? 'À venir' : newStatus === 'ongoing' ? 'En cours' : 'Terminée'}`);
        loadEventData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Erreur changement de statut');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        navigate('/events');
      }
    } catch (err) {
      setMessage('Erreur suppression');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1 className="title">Chargement...</h1>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container">
        <h1 className="title">Événement non trouvé</h1>
        <Link to="/events">
          <button className="btn btn-primary">Retour aux événements</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-actions">
        <h1 className="title">🏁 {event.name}</h1>
        <div>
          <Link to="/events">
            <button className="btn btn-secondary">← Retour</button>
          </Link>
          <button 
            onClick={handleDelete} 
            className="btn btn-danger"
            style={{marginLeft: '10px'}}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Erreur') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <h2>📋 Informations</h2>
        <p>
          <strong>Statut:</strong>{' '}
          <span className={`badge badge-${event.status === 'upcoming' ? 'upcoming' : event.status === 'ongoing' ? 'ongoing' : 'finished'}`}>
            {event.status === 'upcoming' ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminée'}
          </span>
        </p>
        <p><strong>Circuit:</strong> {event.circuit}</p>
        <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        {event.championship_name && (
          <p style={{marginTop: '10px'}}>
            <strong>Championnat:</strong> {event.championship_name}
          </p>
        )}
        
        <div style={{marginTop: '20px'}}>
          <strong>Changer le statut:</strong>
          <div style={{marginTop: '10px'}}>
            <button 
              onClick={() => handleStatusChange('upcoming')}
              className="btn btn-warning"
              disabled={event.status === 'upcoming'}
            >
              À venir
            </button>
            <button 
              onClick={() => handleStatusChange('ongoing')}
              className="btn btn-danger"
              disabled={event.status === 'ongoing'}
              style={{ color: event.status === 'ongoing' ? '#000' : '#fff', marginLeft: '10px' }}
            >
              En cours
            </button>
            <button 
              onClick={() => handleStatusChange('finished')}
              className="btn btn-success"
              disabled={event.status === 'finished'}
              style={{ color: event.status === 'finished' ? '#000' : '#fff', marginLeft: '10px' }}
            >
              Terminée
            </button>
          </div>
        </div>
      </div>

      {/* Résultats automatiques */}
      {event.results && event.results.length > 0 ? (
        <div className="card">
          <h2>🏆 Résultats</h2>
          <p style={{color: '#28a745', marginBottom: '15px'}}>
            ✅ Résultats importés automatiquement depuis l'historique des courses
          </p>
          
          <table className="results-table">
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Pilote</th>
                <th>Points</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {event.results
                .sort((a, b) => {
                  if (a.status && !b.status) return 1;
                  if (!a.status && b.status) return -1;
                  return (a.position || 99) - (b.position || 99);
                })
                .map((result, idx) => (
                  <tr key={idx}>
                    <td>{result.position || '-'}</td>
                    <td>{result.pilot_name || 'Pilote inconnu'}</td>
                    <td>{result.points || 0}</td>
                    <td>
                      {result.status ? (
                        <span className={`badge badge-${result.status.toLowerCase()}`}>
                          {result.status}
                        </span>
                      ) : (
                        <span className="badge badge-finished">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h2>🏆 Résultats</h2>
          <p className="empty-state">
            Aucun résultat pour le moment.
          </p>
          <p style={{color: '#666', fontSize: '14px', marginTop: '10px'}}>
            💡 Pour associer une course à cet événement, allez dans <Link to="/race-history" style={{color: '#4CAF50'}}>Historique des courses</Link> et liez une course terminée à cet événement.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
