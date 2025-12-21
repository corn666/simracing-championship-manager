import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <ul>
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Accueil
          </Link>
        </li>
        <li>
          <Link to="/calendar" className={location.pathname === '/calendar' ? 'active' : ''}>
            Calendrier
          </Link>
        </li>
        <li>
          <Link to="/championships" className={location.pathname === '/championships' ? 'active' : ''}>
            Championnats
          </Link>
        </li>
        <li>
          <Link to="/events" className={location.pathname === '/events' ? 'active' : ''}>
            Événements
          </Link>
        </li>
        <li>
          <Link to="/pit-wall" className={location.pathname === '/pit-wall' ? 'active' : ''}>
            Pit Wall
          </Link>
        </li>
        <li>
          <Link to="/last-race" className={location.pathname === '/last-race' ? 'active' : ''}>
            Dernière Course
          </Link>
        </li>
        <li>
          <Link to="/race-history" className={location.pathname === '/race-history' ? 'active' : ''}>
            Historique
          </Link>
        </li>
        <li>
          <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
            ⚙️ Paramètres
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
