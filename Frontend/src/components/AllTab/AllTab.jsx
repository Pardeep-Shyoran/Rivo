import PropTypes from 'prop-types';
import MusicTab from '../MusicTab/MusicTab';
import PlaylistTab from '../PlaylistTab/PlaylistTab';
import styles from './AllTab.module.css';
import { useMusicPlayer } from '../../contexts/useMusicPlayer';

const AllTab = ({ 
  exploreSongs, 
  musics, 
  playlists, 
  exploreLimit, 
  onNavigateToSongs, 
  onNavigateToPlaylists 
}) => {
  const { playHistory } = useMusicPlayer();

  return (
    <>
      {playHistory && playHistory.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recently Played</h2>
          <MusicTab musics={playHistory.slice(0, 6)} reverse={false} />
        </section>
      )}
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Explore Songs</h2>
        <MusicTab musics={exploreSongs.slice(0, exploreLimit)} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>All Songs</h2>
        <MusicTab musics={musics.slice(0, 6)} />
        {musics.length > 6 && (
          <div className={styles.viewMoreContainer}>
            <button
              onClick={onNavigateToSongs}
              className={styles.viewMoreButton}
            >
              View More
            </button>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Playlists</h2>
        <PlaylistTab playlists={playlists.slice(0, 2)} />
        {playlists.length > 2 && (
          <div className={styles.viewMoreContainer}>
            <button
              onClick={onNavigateToPlaylists}
              className={styles.viewMoreButton}
            >
              View More
            </button>
          </div>
        )}
      </section>
    </>
  );
};

AllTab.propTypes = {
  exploreSongs: PropTypes.array.isRequired,
  musics: PropTypes.array.isRequired,
  playlists: PropTypes.array.isRequired,
  exploreLimit: PropTypes.number.isRequired,
  onNavigateToSongs: PropTypes.func.isRequired,
  onNavigateToPlaylists: PropTypes.func.isRequired,
};

export default AllTab;
