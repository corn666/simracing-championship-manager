import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChampionships, createChampionship, deleteChampionship } from '../services/api';

const Championships = () => {
  const [championships, setChampionships] = useState([]);
  const [name, setName] = useState('');
  const [totalRaces, setTotalRaces] = useState(10);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadChampionships();
  }, []);

  const loadChampionships = async () => {
    const data = await getChampionships();
    setChampionships(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setMessage('Veuillez saisir un nom de championnat');
      return;
    }

    try {
      await createChampionship({
        name: name.trim(),
        total_races: totalRaces,
        participant_ids: [] // Plus besoin de pilotes
      });
      
      setName('');
      setTotalRaces(10);
      setShowForm(false);
      setMessage('Championnat créé avec succès !');
      loadChampionships();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur lors de la création du championnat');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce championnat ? Toutes les données associées seront perdues.')) {
      await deleteChampionship(id);
      setMessage('Championnat supprimé');
      loadChampionships();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="container">
      <h1 className="title">🏆 Championnats GT3</h1>
      
      {message && (
        <div className={`message ${message.includes('Erreur') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0}}>Mes championnats</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Annuler' : '+ Nouveau championnat'}
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} style={{marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
            <div className="form-group">
              <label>Nom du championnat</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Championnat GT3 Hiver 2024"
              />
            </div>
            
            <div className="form-group">
              <label>Nombre de courses prévues</label>
              <input
                type="number"
                value={totalRaces}
                onChange={(e) => setTotalRaces(parseInt(e.target.value) || 1)}
                min="1"
                max="50"
              />
            </div>
            
            <p style={{color: '#666', fontSize: '14px', marginTop: '15px'}}>
              ℹ️ Les participants seront ajoutés automatiquement lors de l'association des courses
            </p>
            
            <button type="submit" className="btn btn-success">
              Créer le championnat
            </button>
          </form>
        )}
        
        {championships.length === 0 ? (
          <p className="empty-state">Aucun championnat créé</p>
        ) : (
          <div style={{display: 'grid', gap: '15px'}}>
            {championships.map(championship => (
              <div key={championship.id} className="card" style={{background: '#f8f9fa'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                  <div style={{flex: 1}}>
                    <h3 style={{color: '#1e3c72', marginBottom: '10px'}}>{championship.name}</h3>
                    <p style={{color: '#666', marginBottom: '10px'}}>
                      📅 {championship.total_races} courses prévues
                    </p>
                    <Link to={`/championships/${championship.id}`}>
                      <button className="btn btn-primary">Voir le classement</button>
                    </Link>
                  </div>
                  <button 
                    onClick={() => handleDelete(championship.id)}
                    className="btn btn-danger"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Championships;
