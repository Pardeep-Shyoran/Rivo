import { useNavigate } from 'react-router-dom';
import MusicCard from '../MusicCard/MusicCard';
import EmptyState from '../EmptyState/EmptyState';
import Loader from '../Loader/Loader';
import styles from './MusicTab.module.css';

// musics: array of music objects
// isLoading: optional prop to show loading state from parent
const MusicTab = ({ musics, isLoading = false }) => {
  const navigate = useNavigate();

  // Show loader if explicitly loading from parent
  if (isLoading) {
    return <Loader message="Loading music..." inline />;
  }

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
        [...musics].reverse().map((music) => <MusicCard key={music._id} music={music} />)
      )}
    </div>
  );
};

export default MusicTab;
