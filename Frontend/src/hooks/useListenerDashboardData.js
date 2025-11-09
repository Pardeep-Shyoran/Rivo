import { useEffect, useMemo, useState } from 'react';
import musicApi from '../api/axiosMusicConfig.jsx';
import { useUser } from '../contexts/useUser';
import { useMusicPlayer } from '../contexts/useMusicPlayer';
import { usePlayHistory } from './usePlayHistory';

/**
 * Unified data hook for Listener Dashboard
 * Fetches musics + playlists in parallel and derives:
 * - totalTracks
 * - newToday count
 * - totalPlaylists
 * - topArtists (by track count)
 * - recommendations (unplayed recent tracks)
 * Uses server-synced play history with local fallback
 */
export function useListenerDashboardData(options = {}) {
  const { limit = 50 } = options; // raise default limit to have richer aggregation
  const { user } = useUser();
  const { playHistory: localPlayHistory } = useMusicPlayer();
  const { history: serverPlayHistory } = usePlayHistory(50);
  
  // Use server history if available, fallback to local
  const playHistory = serverPlayHistory.length > 0 ? serverPlayHistory : localPlayHistory;
  const [musics, setMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch only this user's playlists (listener or artist) instead of all playlists
        const [musicsRes, playlistsRes] = await Promise.all([
          musicApi.get(`/api/music?limit=${limit}`),
          musicApi.get('/api/music/user/playlist'),
        ]);
        if (!active) return;
        setMusics(musicsRes.data.musics || []);
        setPlaylists(playlistsRes.data.playlists || []);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [limit]);

  const [serverStreak, setServerStreak] = useState(null);

  // Fetch server streak (sync) once musics finished loading or on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await musicApi.get('/api/music/streak');
        if (active) setServerStreak(res.data?.streak ?? null);
      } catch {
        if (active) setServerStreak(null); // fallback silently
      }
    })();
    return () => { active = false; };
  }, []);

  const derived = useMemo(() => {
    const totalTracks = musics.length;
    const totalPlaylists = playlists.length;

    // Date partitions
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today.getTime() - 86400000);

    let newToday = 0;
    let newYesterday = 0;

    // Genre distribution placeholder (if backend adds genre later; we infer from title keywords now)
    const genreCounts = {};
    const genreKeywords = [
      { key: 'rock', label: 'Rock' },
      { key: 'pop', label: 'Pop' },
      { key: 'jazz', label: 'Jazz' },
      { key: 'lofi', label: 'Lo-Fi' },
      { key: 'chill', label: 'Chill' },
      { key: 'classical', label: 'Classical' },
      { key: 'rap', label: 'Rap' },
    ];

    // Time-of-day buckets for recommendations
    const hour = new Date().getHours();
    let timeOfDayTag = 'Daytime';
    if (hour < 5) timeOfDayTag = 'Late Night';
    else if (hour < 11) timeOfDayTag = 'Morning';
    else if (hour < 17) timeOfDayTag = 'Afternoon';
    else if (hour < 22) timeOfDayTag = 'Evening';

    // Collect artist counts & candidate tracks for recommendations
    const artistCounts = {};
    const playedIds = new Set(playHistory.map(p => p._id));
    const unplayed = [];
    const todayTracks = [];

    for (const m of musics) {
      // New today / yesterday counters
      if (m.createdAt) {
        const d = new Date(m.createdAt);
        if (d >= today) newToday++;
        else if (d >= yesterday) newYesterday++;
        if (d >= today) todayTracks.push(m);
      }
      // Artist counts
      if (m.artist) artistCounts[m.artist] = (artistCounts[m.artist] || 0) + 1;
      // Genre heuristic
      const lowerTitle = (m.title || '').toLowerCase();
      for (const g of genreKeywords) {
        if (lowerTitle.includes(g.key)) {
          genreCounts[g.label] = (genreCounts[g.label] || 0) + 1;
        }
      }
      // Unplayed set
      if (!playedIds.has(m._id)) unplayed.push(m);
    }

    const topArtists = Object.entries(artistCounts)
      .sort((a,b) => b[1]-a[1])
      .slice(0,5)
      .map(([artist, count]) => ({ artist, count }));

    // Basic time-of-day recommendations: prefer today's tracks, fallback to unplayed
    const timeOfDayRecommendations = (todayTracks.length ? todayTracks : unplayed).slice(0, 6);

    // General recommendations (distinct from timeOfDay): first unplayed sorted by recency
    const recommendations = unplayed.slice(0, 6);

    // Listening streak: consecutive days with at least one play recorded in history
    const daySet = new Set();
    for (const p of playHistory) {
      if (p && p._id && p.playedAt) {
        daySet.add(new Date(p.playedAt).toDateString());
      } else if (p && p._id && p.createdAt) {
        // fallback to createdAt if playedAt not tracked yet
        daySet.add(new Date(p.createdAt).toDateString());
      }
    }
    // naive streak: check backward from today
    let streak = 0;
    const todayStr = new Date().toDateString();
    const lookback = 14; // limit computation
    for (let i=0; i<lookback; i++) {
      const d = new Date(Date.now() - i*86400000).toDateString();
      if (daySet.has(d)) streak++;
      else break;
      if (d === todayStr && !daySet.has(d)) break; // just defensive
    }

    const listenerName = user ? `${user.fullName?.firstName || ''} ${user.fullName?.lastName || ''}`.trim() : 'Guest';

    // Sort genres descending
    const genreDistribution = Object.entries(genreCounts)
      .sort((a,b) => b[1]-a[1])
      .map(([genre, count]) => ({ genre, count }));

    // Prefer server streak if available, fallback to local
    const effectiveStreak = typeof serverStreak === 'number' ? serverStreak : streak;

    return {
      totalTracks,
      totalPlaylists,
      newToday,
      newYesterday,
      topArtists,
      recommendations,
      timeOfDayRecommendations,
      timeOfDayTag,
      genreDistribution,
      listeningStreak: effectiveStreak,
      listenerName,
    };
  }, [musics, playlists, playHistory, user, serverStreak]);

  return { musics, playlists, loading, error, ...derived };
}

export default useListenerDashboardData;