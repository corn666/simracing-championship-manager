import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, createEvent, deleteEvent, getChampionships, getPilots } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [championships, setChampionships] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [circuit, setCircuit] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isChampionship, setIsChampionship] = useState(false);
  const [championshipId, setChampionshipId] = useState('');
  const [numParticipants, setNumParticipants] = useState(24);

  useEffect(() => {
    loadEvents();
    loadChampionships();
    loadPilots();
  }, []);

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  const loadChampionships = async () => {
    const data = await getChampionships();
    setChampionships(data);
  };

  const loadPilots = async () => {
    const data = await getPilots();
    setPilots(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !circuit.trim() || !eventDate) {
      setMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isChampionship && !championshipId) {
      setMessage('Veuillez sélectionner un championnat');
      return;
    }

    try {
      await createEvent({
        name: name.trim(),
        circuit: circuit.trim(),
        event_date: eventDate,
        championship_id: isChampionship ? championshipId : null
      });
      
      setName('');
      setCircuit('');
      setEventDate('');
      setIsChampionship(false);
      setChampionshipId('');
      setNumParticipants(24);
      setShowForm(false);
      setMessage('Événement créé avec succès !');
      loadEvents();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur lors de la création de l\'événement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Les résultats seront également supprimés.')) {
      await deleteEvent(id);
      setMessage('Événement supprimé');
      loadEvents();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="container">
      <h1 className="title">🏁 Événements (Courses)</h1>
      
      {message && (
        <div className={`message ${message.includes('Erreur') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0}}>Mes événements</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Annuler' : '+ Nouvel événement'}
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} style={{marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
            <div className="form-group">
              <label>Nom de l'événement *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Course Spa-Francorchamps"
              />
            </div>
            
            <div className="form-group">
              <label>Circuit *</label>
              <input
                type="text"
                value={circuit}
                onChange={(e) => setCircuit(e.target.value)}
                placeholder="Ex: Spa-Francorchamps"
              />
            </div>
            
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Nombre de participants</label>
              <input
                type="number"
                value={numParticipants}
                onChange={(e) => setNumParticipants(parseInt(e.target.value) || 1)}
                min="1"
                max="24"
              />
              <small style={{color: '#666'}}>Information uniquement (jusqu'à 24 participants)</small>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isChampionship}
                  onChange={(e) => setIsChampionship(e.target.checked)}
                />
                Course de championnat
              </label>
            </div>
            
            {isChampionship && (
              <div className="form-group">
                <label>Championnat *</label>
                {championships.length === 0 ? (
                  <p style={{color: '#dc3545'}}>
                    Aucun championnat disponible. <Link to="/championships">Créez un championnat d'abord</Link>
                  </p>
                ) : (
                  <select
                    value={championshipId}
                    onChange={(e) => setChampionshipId(e.target.value)}
                  >
                    <option value="">-- Sélectionnez un championnat --</option>
                    {championships.map(champ => (
                      <option key={champ.id} value={champ.id}>
                        {champ.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            
            <button type="submit" className="btn btn-success">
              Créer l'événement
            </button>
          </form>
        )}
        
        {events.length === 0 ? (
          <p className="empty-state">Aucun événement créé</p>
        ) : (
          <ul className="event-list">
            {events.map(event => (
              <li key={event.id} className="event-item">
                <div className="event-info">
                  <div>
                    <strong>{event.name}</strong>
                    {' '}
                    <span className={`badge badge-${event.status === 'upcoming' ? 'upcoming' : event.status === 'ongoing' ? 'ongoing' : 'finished'}`}>
                      {event.status === 'upcoming' ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminée'}
                    </span>
                  </div>
                  <small style={{color: '#666', display: 'block', marginTop: '5px'}}>
                    🏁 {event.circuit} - 📅 {new Date(event.event_date).toLocaleDateString('fr-FR')}
                  </small>
                  {event.championship_name && (
                    <small style={{color: '#2a5298', display: 'block', marginTop: '3px'}}>
                      🏆 {event.championship_name}
                    </small>
                  )}
                </div>
                <div className="event-actions">
                  <Link to={`/events/${event.id}`}>
                    <button className="btn btn-primary">Gérer</button>
                  </Link>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="btn btn-danger"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Events;
