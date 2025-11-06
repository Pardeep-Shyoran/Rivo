import React, { useState, useEffect } from 'react';
import axios from '../api/axiosAuthConfig.jsx';

import { UserContext } from './UserContextInstance.js';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
        // Also fetch JWT from cookie to enable Authorization header on other services
        try {
          const tokenRes = await axios.get('/api/auth/token');
          if (tokenRes.data?.token) {
            try {
              localStorage.setItem('rivo_jwt', tokenRes.data.token);
            } catch {
              // ignore storage errors
            }
          }
        } catch {
          // ignore token fetch errors
        }
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
