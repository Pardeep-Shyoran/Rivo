import { useState } from 'react';
import styles from './PlaylistCard.module.css';
import MusicCard from '../MusicCard/MusicCard';

const PlaylistCard = ({ playlist }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.playlistCard}>
      <div 
        className={styles.playlistHeader} 
        onClick={toggleExpand}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} playlist ${playlist.title}`}
      >
        <div className={styles.playlistIcon}>📋</div>
        <div className={styles.playlistInfo}>
          <h3 className={styles.playlistTitle}>{playlist.title}</h3>
          {playlist.artist && (
            <p className={styles.playlistArtist}>By {playlist.artist}</p>
          )}
          <p className={styles.playlistCount}>
            {playlist.musics?.length || 0} tracks
          </p>
        </div>
        <div className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
        </div>
      </div>
      {isExpanded && playlist.musics && playlist.musics.length > 0 && (
        <div className={styles.playlistMusicsList}>
          {playlist.musics.map((music) => (
            <MusicCard key={music._id} music={music} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;
