import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <h1 className="title">🏁 GT3 Championship Manager</h1>
      
      <div className="hero-image">
        <img 
          src="/spa-gt3.jpg" 
          alt="GT3 Racing at Spa-Francorchamps" 
        />
      </div>
      
      <div className="card">
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <div className="card" style={{background: '#f8f9fa', textAlign: 'center'}}>
            <h3 style={{color: '#1e3c72', marginBottom: '15px'}}>📅 Calendrier</h3>
            <p style={{marginBottom: '15px', fontSize: '14px'}}>
              Consultez tous vos événements à venir
            </p>
            <Link to="/calendar">
              <button className="btn btn-primary">Voir le calendrier</button>
            </Link>
          </div>
          
          <div className="card" style={{background: '#f8f9fa', textAlign: 'center'}}>
            <h3 style={{color: '#1e3c72', marginBottom: '15px'}}>🏆 Championnats</h3>
            <p style={{marginBottom: '15px', fontSize: '14px'}}>
              Créez et suivez vos championnats
            </p>
            <Link to="/championships">
              <button className="btn btn-primary">Gérer les championnats</button>
            </Link>
          </div>
          
          <div className="card" style={{background: '#f8f9fa', textAlign: 'center'}}>
            <h3 style={{color: '#1e3c72', marginBottom: '15px'}}>🏁 Événements</h3>
            <p style={{marginBottom: '15px', fontSize: '14px'}}>
              Organisez vos courses et saisissez les résultats
            </p>
            <Link to="/events">
              <button className="btn btn-primary">Gérer les événements</button>
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <p>🏁 Fueled with ❤️ by <strong>CAZA</strong> • © 2025</p>
      </footer>
    </div>
  );
};

export default Home;
