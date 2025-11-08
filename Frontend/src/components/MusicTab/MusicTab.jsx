import { useNavigate } from 'react-router-dom';
import MusicCard from '../MusicCard/MusicCard';
import EmptyState from '../EmptyState/EmptyState';
import Loader from '../Loader/Loader';
import styles from './MusicTab.module.css';

// musics: array of music objects
// isLoading: optional prop to show loading state from parent
// reverse: optional prop to reverse the order (default: true for backward compatibility)
const MusicTab = ({ musics, isLoading = false, reverse = true }) => {
  const navigate = useNavigate();

  // Show loader if explicitly loading from parent
  if (isLoading) {
    return <Loader message="Loading music..." inline />;
  }

  const displayMusics = reverse ? [...musics].reverse() : musics;

  return (
    <div className={styles.musicsGrid}>
      {musics.length === 0 ? (
        <EmptyState
          icon="🎵"
          title="No music uploaded yet"
          description="Start by uploading your first track"
          buttonText="Upload Music"
          onButtonClick={() => navigate('/artist/upload')}
        />
      ) : (
        displayMusics.map((music) => <MusicCard key={music._id} music={music} />)
      )}
    </div>
  );
};

export default MusicTab;
