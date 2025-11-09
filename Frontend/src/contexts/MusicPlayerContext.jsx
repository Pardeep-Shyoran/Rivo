import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MusicPlayerContext } from './MusicPlayerContextInstance';
import axiosMusic from '../api/axiosMusicConfig';
import { useUser } from './useUser';

export const MusicPlayerProvider = ({ children }) => {
  const [currentMusic, setCurrentMusic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [playHistory, setPlayHistory] = useState([]);
  const audioRef = useRef(null);
  const { user } = useUser();
  const userId = user?.id || user?._id || null;
  // User-scoped storage keys to prevent leakage across accounts
  const RESTORE_KEY = userId ? `rivo_player_state_${userId}` : 'rivo_player_state_anon';
  const HISTORY_KEY = userId ? `rivo_play_history_${userId}` : 'rivo_play_history_anon';
  const location = useLocation();
  const lastNavTimeRef = useRef(0);
  const userPausedRef = useRef(false);
  const currentIdRef = useRef(null);
  const isPlayingRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);

  // console.log('MusicPlayerProvider state:', { currentMusic: currentMusic?._id, isPlaying });

  // Load & sync play history when user identity changes
  useEffect(() => {
    let active = true;
    // Clear current state on identity switch to avoid showing previous account data
    setPlayHistory([]);
    if (!userId) {
      // If logged out, optionally clear anonymous keys
      return () => { active = false; };
    }
    // 1. Load user-scoped local history immediately for fast UI
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setPlayHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.warn('Failed to load play history for user:', userId, err?.message);
    }
    // 2. Hydrate from server (authoritative) and persist
    (async () => {
      try {
        const res = await axiosMusic.get('/api/music/history?limit=20');
        if (!active) return;
        const serverHistory = (res?.data?.history || []).map(entry => ({
          ...entry.music,
            playedAt: entry.playedAt,
            _historyId: entry._id,
        }));
        setPlayHistory(serverHistory);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(serverHistory)); } catch (storageErr) {
          console.warn('Failed to persist server history locally:', storageErr?.message);
        }
      } catch (fetchErr) {
        if (typeof window !== 'undefined') {
          console.warn('History server sync failed for user', userId, fetchErr?.message);
        }
      }
    })();
    return () => { active = false; };
  }, [userId, HISTORY_KEY]);

  // Initialize audio element and restore previous session if any
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    // Event listeners
    const handleTimeUpdate = () => {
      const t = audio.currentTime;
      const now = Date.now();
      
      // Throttle UI updates to ~10 times per second (every 100ms)
      if (now - lastUpdateTimeRef.current > 100) {
        lastUpdateTimeRef.current = now;
        setCurrentTime(t);
      }
      
      // Persist progress periodically (throttle to once every 2 seconds)
      if (now - lastSaveTimeRef.current > 2000) {
        lastSaveTimeRef.current = now;
        try {
          const musicId = currentIdRef.current;
          if (musicId) {
            sessionStorage.setItem(
              RESTORE_KEY,
              JSON.stringify({
                musicId,
                currentTime: t,
                isPlaying: isPlayingRef.current,
                volume: audio.volume,
              })
            );
          }
        } catch {
          // ignore storage write errors
        }
      }
    };
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      setLoading(false);
    };
    // In case an unexpected pause is triggered around navigation, try to auto-recover
    const handlePause = () => {
      const sinceNav = Date.now() - (lastNavTimeRef.current || 0);
      if (currentIdRef.current && !userPausedRef.current && sinceNav < 1500 && document.visibilityState === 'visible') {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
  audio.addEventListener('pause', handlePause);
    
    // Try restore from sessionStorage
    (async () => {
      try {
        const savedRaw = sessionStorage.getItem(RESTORE_KEY);
        if (!savedRaw) return;
        const saved = JSON.parse(savedRaw);
        if (!saved?.musicId) return;

        // Fetch fresh presigned URLs
        const response = await axiosMusic.get(`/api/music/get-details/${saved.musicId}`);
        const musicData = response.data.music;

        setCurrentMusic(musicData);
        audio.src = musicData.musicUrl;
        audio.volume = typeof saved.volume === 'number' ? saved.volume : 1;

        // Seek after metadata is ready
        const onLoaded = () => {
          try {
            if (saved.currentTime) {
              audio.currentTime = Math.min(saved.currentTime, audio.duration || saved.currentTime);
              setCurrentTime(audio.currentTime);
            }
          } catch {
            // ignore seek errors
          }
          audio.removeEventListener('loadedmetadata', onLoaded);
        };
        audio.addEventListener('loadedmetadata', onLoaded);

        // Attempt resume if was playing (may be blocked by autoplay policies)
        if (saved.isPlaying) {
          audio.play().then(() => setIsPlaying(true)).catch(() => {
            // If blocked, stay paused but state is restored
            setIsPlaying(false);
          });
        }
      } catch (err) {
        console.warn('Failed to restore previous playback:', err?.message);
      }
    })();

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, [RESTORE_KEY]);

  // Keep refs updated with latest values to avoid stale closures
  useEffect(() => { userPausedRef.current = userPaused; }, [userPaused]);
  useEffect(() => { currentIdRef.current = currentMusic?._id || null; }, [currentMusic]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Function to add music to play history
  const addToHistory = (music) => {
    setPlayHistory((prevHistory) => {
      // Remove if already exists to avoid duplicates
  const filtered = prevHistory.filter((item) => item._id !== music._id);
      // Decorate with playedAt timestamp for streak tracking
      const entry = { ...music, playedAt: new Date().toISOString() };
      // Add to the beginning, keep max 20 items
      const newHistory = [entry, ...filtered].slice(0, 20);

      // Save to localStorage
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (err) {
        console.warn('Failed to save play history:', err?.message);
      }

      return newHistory;
    });
  };

  // Play music
  const playMusic = async (music) => {
    const audio = audioRef.current;
    
    if (currentMusic?._id === music._id) {
      // Toggle play/pause for same music
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        setUserPaused(true);
      } else {
        audio.play();
        setIsPlaying(true);
        setUserPaused(false);
      }
    } else {
      // Play new music – always fetch fresh details to ensure valid presigned URLs
      try {
        setLoading(true);

        // Always refresh from backend to avoid expired presigned URLs from cached lists/history
        let musicData = music;
        try {
          const details = await axiosMusic.get(`/api/music/get-details/${music._id}`);
          if (details?.data?.music) {
            musicData = details.data.music;
          }
        } catch (e) {
          // If refresh fails, fall back to provided object; playback may still succeed if URL is valid
          console.warn('Failed to refresh music details, using provided object:', e?.message);
        }

        setCurrentMusic(musicData);
        audio.src = musicData.musicUrl;
        audio.volume = volume;

        // Add to play history (decorate with playedAt)
        addToHistory(musicData);
        
        // Wait for audio to be ready and then play
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setLoading(false);
              setUserPaused(false);
              // Persist now that we started playing
              try {
                sessionStorage.setItem(
                  RESTORE_KEY,
                  JSON.stringify({ musicId: musicData._id, currentTime: audio.currentTime || 0, isPlaying: true, volume: audio.volume })
                );
              } catch {
                // ignore storage errors
              }

              // Log play to backend for streak sync and play history
              // Backend will handle both daily activity (for streak) and individual history entry
              try {
                axiosMusic
                  .post(`/api/music/play/${musicData._id}`, {
                    // Optional: send additional metadata
                    deviceId: navigator.userAgent.slice(0, 50), // Simple device fingerprint
                  })
                  .then(async () => {
                    // Refresh history in background to reflect server order across devices
                    try {
                      const res = await axiosMusic.get('/api/music/history?limit=20');
                      const serverHistory = (res?.data?.history || []).map((entry) => ({
                        ...entry.music,
                        playedAt: entry.playedAt,
                        _historyId: entry._id,
                      }));
                      setPlayHistory(serverHistory);
                      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(serverHistory)); } catch (persistErr) {
                        console.warn('Failed to persist refreshed history:', persistErr?.message);
                      }
                    } catch (refreshErr) {
                      // silent: server history refresh not critical
                      if (typeof window !== 'undefined') {
                        console.warn('Post-play history refresh failed:', refreshErr?.message);
                      }
                    }
                  })
                  .catch((err) => {
                    console.warn('Failed to log play to backend:', err?.message);
                  });
              } catch {
                // ignore logging errors
              }
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
              setLoading(false);
            });
        }
      } catch (error) {
        console.error('Error playing music:', error);
        setLoading(false);
      }
    }
  };

  // Pause music
  const pauseMusic = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    setUserPaused(true);
  };

  // Resume music
  const resumeMusic = () => {
    audioRef.current.play();
    setIsPlaying(true);
    setUserPaused(false);
  };

  // Seek to specific time
  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Change volume
  const changeVolume = (newVolume) => {
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    // Persist volume
    try {
      const prev = JSON.parse(sessionStorage.getItem(RESTORE_KEY) || '{}');
      sessionStorage.setItem(
        RESTORE_KEY,
        JSON.stringify({
          musicId: currentMusic?._id || prev.musicId,
          currentTime: currentTime,
          isPlaying,
          volume: newVolume,
        })
      );
    } catch {
      // ignore
    }
  };

  // Close player
  const closePlayer = () => {
    audioRef.current.pause();
    setCurrentMusic(null);
    setIsPlaying(false);
    setUserPaused(false);
    setCurrentTime(0);
    setDuration(0);
    try { sessionStorage.removeItem(RESTORE_KEY); } catch { /* ignore */ }
  };

  // Auto-resume on route change if playback was active and pause wasn't user-initiated
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Mark navigation time for pause event heuristics
    lastNavTimeRef.current = Date.now();
    if (currentMusic && !userPaused && audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        // If blocked by autoplay policy, do nothing (user can press play)
      });
      // Short delayed retry in case the first attempt races with render
      setTimeout(() => {
        if (currentIdRef.current && !userPausedRef.current && audio.paused && document.visibilityState === 'visible') {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Resume when tab regains visibility if not user-paused
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.visibilityState === 'visible' && currentMusic && !userPaused && audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [currentMusic, userPaused]);

  const value = {
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    volume,
    loading,
    playHistory,
    playMusic,
    pauseMusic,
    resumeMusic,
    seekTo,
    changeVolume,
    closePlayer,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
