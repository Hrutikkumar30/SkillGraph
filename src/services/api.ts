import axios from 'axios';

// Get backend API URL from environment variables, defaulting to '/api' for local development
let baseURL = import.meta.env.VITE_API_URL || '/api';

// Format custom backend URL if provided without '/api' suffix
if (baseURL !== '/api' && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL,
});

export default api;
