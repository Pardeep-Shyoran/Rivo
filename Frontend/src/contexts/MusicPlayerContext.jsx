import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MusicPlayerContext } from './MusicPlayerContextInstance';
import axiosMusic from '../api/axiosMusicConfig';

export const MusicPlayerProvider = ({ children }) => {
  const [currentMusic, setCurrentMusic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const audioRef = useRef(null);
  const RESTORE_KEY = 'rivo_player_state';
  const location = useLocation();
  const lastNavTimeRef = useRef(0);
  const userPausedRef = useRef(false);
  const currentIdRef = useRef(null);

  console.log('MusicPlayerProvider state:', { currentMusic: currentMusic?._id, isPlaying });

  // Initialize audio element and restore previous session if any
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    // Event listeners
    const handleTimeUpdate = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      // Persist progress periodically
      try {
        const prev = JSON.parse(sessionStorage.getItem(RESTORE_KEY) || '{}');
        if (prev && (prev.musicId || currentMusic?._id)) {
          sessionStorage.setItem(
            RESTORE_KEY,
            JSON.stringify({
              musicId: currentMusic?._id || prev.musicId,
              currentTime: t,
              isPlaying,
              volume: audio.volume,
            })
          );
        }
      } catch {
        // ignore storage write errors
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
    // We intentionally run this once on mount; dependencies are internalized
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep refs updated with latest values to avoid stale closures
  useEffect(() => { userPausedRef.current = userPaused; }, [userPaused]);
  useEffect(() => { currentIdRef.current = currentMusic?._id || null; }, [currentMusic]);

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
      // Play new music - fetch full details if musicUrl is not available
      try {
        setLoading(true);
        let musicData = music;
        
        // If music doesn't have musicUrl, fetch it from API
        if (!music.musicUrl) {
          const response = await axiosMusic.get(`/api/music/get-details/${music._id}`);
          musicData = response.data.music;
        }
        
        setCurrentMusic(musicData);
        audio.src = musicData.musicUrl;
        audio.volume = volume;
        
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
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
              setLoading(false);
            });
        }
      } catch (error) {
        console.error('Error fetching music details:', error);
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
