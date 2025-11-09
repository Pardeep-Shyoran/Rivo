import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_MUSIC_URL || import.meta.env.VITE_API_URL || '';

// Cookie-only auth: no Authorization header, rely on httpOnly cookie set by auth service.
const instance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

instance.defaults.withCredentials = true;

export default instance;