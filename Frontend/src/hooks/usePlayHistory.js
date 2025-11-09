import { useState, useEffect } from 'react';
import axiosMusic from '../api/axiosMusicConfig';

/**
 * Custom hook to fetch play history from backend
 * Falls back to local storage if backend fails
 * @param {number} limit - Number of items to fetch
 * @returns {Object} { history, loading, error, refresh }
 */
export function usePlayHistory(limit = 50) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosMusic.get(`/api/music/history?limit=${limit}`);
      const serverHistory = response.data.history || [];

      // Map server response to match local format
      const formattedHistory = serverHistory.map(entry => ({
        ...entry.music,
        playedAt: entry.playedAt,
        _historyId: entry._id,
      }));

      setHistory(formattedHistory);
    } catch (err) {
      console.warn('Failed to fetch play history from server, using local fallback:', err?.message);
      setError(err?.message || 'Failed to fetch history');

      // Fallback to local storage
      try {
        const localHistory = localStorage.getItem('rivo_play_history');
        if (localHistory) {
          setHistory(JSON.parse(localHistory));
        }
      } catch (localErr) {
        console.warn('Failed to load local play history:', localErr?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return {
    history,
    loading,
    error,
    refresh: fetchHistory,
  };
}
