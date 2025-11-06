import { useNavigate } from 'react-router-dom';
import PlaylistCard from '../PlaylistCard/PlaylistCard';
import EmptyState from '../EmptyState/EmptyState';
import Loader from '../Loader/Loader';
import styles from './PlaylistTab.module.css';

// playlists: array of playlists with populated music objects
// isLoading: optional prop to show loading state from parent
const PlaylistTab = ({ playlists, isLoading = false }) => {
  const navigate = useNavigate();

  // Show loader if explicitly loading from parent
  if (isLoading) {
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
        [...playlists].reverse().map((playlist) => (
          <PlaylistCard key={playlist._id} playlist={playlist} />
        ))
      )}
    </div>
  );
};

export default PlaylistTab;
