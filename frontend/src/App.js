import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Championships from './pages/Championships';
import ChampionshipDetail from './pages/ChampionshipDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import PitWall from './pages/PitWall';
import LastRace from './pages/LastRace';
import Settings from './pages/Settings';
import RaceHistory from './pages/RaceHistory';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/championships" element={<Championships />} />
          <Route path="/championships/:id" element={<ChampionshipDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/pit-wall" element={<PitWall />} />
          <Route path="/last-race" element={<LastRace />} />
          <Route path="/race-history" element={<RaceHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
