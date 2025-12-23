// Utiliser le même protocole/host/port que la page actuelle (pour mode standalone)
const API_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;

// ============ CHAMPIONNATS ============
export const getChampionships = async () => {
  const response = await fetch(`${API_URL}/championships`);
  return response.json();
};

export const getChampionship = async (id) => {
  const response = await fetch(`${API_URL}/championships/${id}`);
  return response.json();
};

export const createChampionship = async (championship) => {
  const response = await fetch(`${API_URL}/championships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(championship)
  });
  return response.json();
};

export const deleteChampionship = async (id) => {
  const response = await fetch(`${API_URL}/championships/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const getChampionshipStandings = async (id) => {
  const response = await fetch(`${API_URL}/championships/${id}/standings`);
  return response.json();
};

export const getChampionshipEvents = async (id) => {
  const response = await fetch(`${API_URL}/championships/${id}/events`);
  return response.json();
};

// ============ ÉVÉNEMENTS ============
export const getEvents = async () => {
  const response = await fetch(`${API_URL}/events`);
  return response.json();
};

export const getEvent = async (id) => {
  const response = await fetch(`${API_URL}/events/${id}`);
  return response.json();
};

export const createEvent = async (event) => {
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
  return response.json();
};

export const updateEventStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/events/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return response.json();
};

export const deleteEvent = async (id) => {
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const saveEventResults = async (eventId, results) => {
  const response = await fetch(`${API_URL}/events/${eventId}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results })
  });
  return response.json();
};
