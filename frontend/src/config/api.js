// Configuration de l'API pour le mode standalone
// L'application tourne toujours sur le même serveur que le backend

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

export default API_BASE_URL;
