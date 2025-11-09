import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_MUSIC_URL || import.meta.env.VITE_API_URL || '';

const instance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});


instance.defaults.withCredentials = true;

// Authorization now relies solely on httpOnly auth cookies; legacy localStorage token removed.

export default instance;