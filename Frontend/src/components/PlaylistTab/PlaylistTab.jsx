import { useNavigate } from 'react-router-dom';
import PlaylistCard from '../PlaylistCard/PlaylistCard';
import { useMemo, useState, useEffect } from 'react';
import EmptyState from '../EmptyState/EmptyState';
import Loader from '../Loader/Loader';
import styles from './PlaylistTab.module.css';

// playlists: array of playlists (musics can be IDs or full objects)
// musics: array of all music objects (optional, needed only if playlist.musics contains IDs)
// isLoading: optional prop to show loading state from parent
const PlaylistTab = ({ playlists, musics, isLoading = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Map music IDs to music objects for fast lookup
  const musicMap = useMemo(() => {
    const map = {};
    if (musics) {
      musics.forEach((music) => {
        map[music._id] = music;
      });
    }
    return map;
  }, [musics]);

  // Attach full music objects to each playlist
  const playlistsWithMusics = useMemo(() => {
    return playlists.map((playlist) => {
      // Check if musics are already objects or just IDs
      const playlistMusics = Array.isArray(playlist.musics)
        ? playlist.musics.map((item) => {
            // If item is already an object with _id, return it
            if (typeof item === 'object' && item !== null && item._id) {
              return item;
            }
            // Otherwise, it's an ID, so map it from musicMap
            return musicMap[item];
          }).filter(Boolean)
        : [];

      return {
        ...playlist,
        musics: playlistMusics,
      };
    });
  }, [playlists, musicMap]);

  // Handle loading state - simulate processing time for data mapping
  useEffect(() => {
    setLoading(true);
    // Use a small timeout to show loader during data processing
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [playlists, musics]);

  // Show loader if explicitly loading from parent or internal loading
  if (isLoading || loading) {
    return <Loader message="Loading playlists..." inline />;
  }

  return (
    <div className={styles.playlistsGrid}>
      {playlists.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No playlists created yet"
          description="Create your first playlist to organize your music"
          buttonText="Create Playlist"
          onButtonClick={() => navigate('/artist/create-playlist')}
        />
      ) : (
        [...playlistsWithMusics].reverse().map((playlist) => (
          <PlaylistCard key={playlist._id} playlist={playlist} />
        ))
      )}
    </div>
  );
};

export default PlaylistTab;
