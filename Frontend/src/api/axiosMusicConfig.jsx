import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_MUSIC_URL || import.meta.env.VITE_API_URL || '';

const instance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});


instance.defaults.withCredentials = true;

// Attach Authorization header if token is available (fallback when cookies aren't shared across services)
instance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('rivo_jwt');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

export default instance;