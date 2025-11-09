import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_MUSIC_URL || import.meta.env.VITE_API_URL || '';

// In-memory token reference (will be set by UserContext)
let authToken = null;

// Function to set token from UserContext
export const setMusicAuthToken = (token) => {
  authToken = token;
};

// Basic instance with credentials for cross-domain
const instance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

instance.defaults.withCredentials = true;

// Interceptor to attach Authorization header from in-memory token
instance.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;