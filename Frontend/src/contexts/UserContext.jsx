import React, { useState, useEffect } from 'react';
import axios from '../api/axiosAuthConfig.jsx';

import { UserContext } from './UserContextInstance.js';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Token state removed: cookie-only auth, we no longer mirror JWT client-side.

  useEffect(() => {
    // Clean up legacy token from localStorage
    try { localStorage.removeItem('rivo_jwt'); } catch { /* ignore */ }
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
        
        // Cookie already carries auth for both services; no need to fetch or store token.
      } catch {
  setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Move useUser to a separate file for fast refresh compliance
