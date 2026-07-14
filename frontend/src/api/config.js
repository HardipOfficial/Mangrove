const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.match(/^192\.168\./)
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isLocalhost ? 'http://localhost:5000/api' : 'https://mangrove-backend-cin2.onrender.com/api');

export { API_BASE_URL };
