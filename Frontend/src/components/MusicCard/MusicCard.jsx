import styles from './MusicCard.module.css';
import { useMusicPlayer } from '../../contexts/useMusicPlayer';

const MusicCard = ({ music }) => {
  const { playMusic, currentMusic, isPlaying, loading } = useMusicPlayer();

  const handlePlayClick = (e) => {
    e.stopPropagation();
    playMusic(music);
  };

  const isCurrentMusic = currentMusic?._id === music._id;
  const showPauseIcon = isCurrentMusic && isPlaying;
  const showLoadingIcon = isCurrentMusic && loading;

  return (
    <div className={styles.musicCard}>
      <div className={styles.musicCover}>
        <img
          src={music.coverImageUrl || '/placeholder.jpg'}
          alt={music.title}
        />
        <div className={styles.musicOverlay}>
          <button className={styles.playBtn} onClick={handlePlayClick} disabled={showLoadingIcon}>
            {showLoadingIcon ? '⏳' : showPauseIcon ? '⏸' : '▶'}
          </button>
        </div>
      </div>
      <div className={styles.musicInfo}>
        <h3 className={styles.musicTitle}>{music.title}</h3>
        <p className={styles.musicArtist}>{music.artist}</p>
        <p className={styles.musicDate}>
          {new Date(music.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MusicCard;
