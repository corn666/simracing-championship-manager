import React, { useState, useEffect } from 'react';
import { getPilots, createPilot, deletePilot } from '../services/api';

const Pilots = () => {
  const [pilots, setPilots] = useState([]);
  const [name, setName] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPilots();
  }, []);

  const loadPilots = async () => {
    const data = await getPilots();
    setPilots(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setMessage('Veuillez saisir un nom');
      return;
    }

    try {
      await createPilot({ name: name.trim(), is_human: isHuman });
      setName('');
      setIsHuman(false);
      setMessage('Pilote ajouté avec succès !');
      loadPilots();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur lors de l\'ajout du pilote');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pilote ?')) {
      await deletePilot(id);
      setMessage('Pilote supprimé');
      loadPilots();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const humanCount = pilots.filter(p => p.is_human).length;
  const aiCount = pilots.filter(p => !p.is_human).length;

  return (
    <div className="container">
      <h1 className="title">👤 Gestion des Pilotes</h1>
      
      {message && (
        <div className={`message ${message.includes('Erreur') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <h2>Ajouter un pilote</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du pilote</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isHuman}
                onChange={(e) => setIsHuman(e.target.checked)}
              />
              Pilote humain
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Ajouter le pilote
          </button>
        </form>
      </div>
      
      <div className="card">
        <h2>Liste des pilotes ({pilots.length}/24)</h2>
        <p style={{marginBottom: '20px', color: '#666'}}>
          <span className="badge badge-human">{humanCount} Humains</span>
          {' '}
          <span className="badge badge-ai">{aiCount} IA</span>
        </p>
        
        {pilots.length === 0 ? (
          <p className="empty-state">Aucun pilote enregistré</p>
        ) : (
          <ul className="pilot-list">
            {pilots.map(pilot => (
              <li key={pilot.id} className="pilot-item">
                <div className="pilot-info">
                  <strong>{pilot.name}</strong>
                  {' '}
                  <span className={`badge ${pilot.is_human ? 'badge-human' : 'badge-ai'}`}>
                    {pilot.is_human ? 'Humain' : 'IA'}
                  </span>
                </div>
                <div className="pilot-actions">
                  <button 
                    onClick={() => handleDelete(pilot.id)}
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

export default Pilots;
