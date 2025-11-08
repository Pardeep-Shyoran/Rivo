import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PlaylistCard.module.css';
import MusicCard from '../MusicCard/MusicCard';


const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  // Detect small screen (phone). We keep it simple; a hook could be added later for dynamic resize.
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 640;

  const handleHeaderClick = () => {
    if (isSmallScreen) {
      // On phones: navigate directly to playlist detail instead of expanding.
      navigate(`/playlist/${playlist._id}`);
      return;
    }
    // Desktop / larger screens: toggle expand.
    setIsExpanded(prev => !prev);
  };

  const handleViewAll = (e) => {
    e.stopPropagation();
    navigate(`/playlist/${playlist._id}`);
  };

  return (
    <div className={styles.playlistCard}>
      <div
        className={styles.playlistHeader}
        onClick={handleHeaderClick}
        role="button"
        aria-expanded={!isSmallScreen && isExpanded}
        aria-label={isSmallScreen ? `Open playlist ${playlist.title}` : `${isExpanded ? 'Collapse' : 'Expand'} playlist ${playlist.title}`}
      >
        <div className={styles.playlistIcon}>📋</div>
        <div className={styles.playlistInfo}>
          <h3 className={styles.playlistTitle}>{playlist.title}</h3>
          {playlist.artist && (
            <p className={styles.playlistArtist}>
              By{' '}
              <button
                type="button"
                className={styles.playlistArtistLink}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/artists/${encodeURIComponent(playlist.artist)}`);
                }}
              >
                {playlist.artist}
              </button>
            </p>
          )}
          <p className={styles.playlistCount}>
            {playlist.musics?.length || 0} tracks
          </p>
        </div>
        {!isSmallScreen && (
          <div className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
              <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
            </svg>
          </div>
        )}
      </div>
      {!isSmallScreen && isExpanded && playlist.musics && playlist.musics.length > 0 && (
        <div className={styles.playlistMusicsList}>
          {playlist.musics.slice(0, 3).map((music) => (
            <MusicCard key={music._id} music={music} />
          ))}
          {playlist.musics.length > 3 && (
            <button
              className={styles.viewAllBtn}
              onClick={handleViewAll}
            >
              View All ({playlist.musics.length} tracks)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;
