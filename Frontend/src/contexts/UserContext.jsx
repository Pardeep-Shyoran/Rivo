import React, { useState, useEffect } from 'react';
import axios from '../api/axiosAuthConfig.jsx';
import { setMusicAuthToken } from '../api/axiosMusicConfig.jsx';

import { UserContext } from './UserContextInstance.js';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(null); // In-memory token storage (no localStorage)
  
  // Wrapper to update both state and axios instance
  const setToken = (newToken) => {
    setTokenState(newToken);
    setMusicAuthToken(newToken); // Update axios interceptor
  };

  useEffect(() => {
    // Clean up legacy token from localStorage
    try { localStorage.removeItem('rivo_jwt'); } catch { /* ignore */ }
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
        
        // Bootstrap token from cookie via /api/auth/token for cross-domain music requests
        try {
          const tokenResp = await axios.get('/api/auth/token');
          if (tokenResp?.data?.token) {
            setToken(tokenResp.data.token);
          }
        } catch {
          // Token fetch failed, user can still use auth endpoints
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};

// Move useUser to a separate file for fast refresh compliance
