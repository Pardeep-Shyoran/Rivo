import { useMusicPlayer } from '../../contexts/useMusicPlayer';
import styles from './MusicPlayer.module.css';

const MusicPlayer = () => {
  const {
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    volume,
    loading,
    pauseMusic,
    resumeMusic,
    seekTo,
    changeVolume,
    closePlayer,
  } = useMusicPlayer();

  console.log('MusicPlayer render:', { currentMusic: currentMusic?._id, isPlaying });

  if (!currentMusic) {
    return null;
  }

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    changeVolume(parseFloat(e.target.value));
  };

  // Toggle mute
  const toggleMute = () => {
    changeVolume(volume === 0 ? 1 : 0);
  };

  // Calculate progress percentage
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;

  return (
    <div className={styles.musicPlayer}>
      {/* Close Button */}
      <button className={styles.closeBtn} onClick={closePlayer} title="Close player">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>

      {/* Album Art */}
      <div className={styles.albumArt}>
        <img
          src={currentMusic.coverImageUrl || '/placeholder.jpg'}
          alt={currentMusic.title}
        />
        {isPlaying && (
          <div className={styles.playingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      {/* Music Info */}
      <div className={styles.musicInfo}>
        <h3 className={styles.title}>{currentMusic.title}</h3>
        <p className={styles.artist}>{currentMusic.artist}</p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={styles.playPauseBtn}
          onClick={isPlaying ? pauseMusic : resumeMusic}
          disabled={loading}
        >
          {loading ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.spinner}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <div
          className={styles.progressBar}
          onClick={handleProgressClick}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className={styles.progressHandle}></div>
          </div>
        </div>
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>

      {/* Volume Control */}
      <div className={styles.volumeControl}>
        <button
          className={styles.volumeBtn}
          onClick={toggleMute}
          title={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : volume < 0.5 ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 9v6h4l5 5V4l-5 5H7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          )}
        </button>
        <div className={styles.volumeSliderContainer}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            style={{ '--volume-percent': `${volumePercentage}%` }}
            title={`Volume: ${Math.round(volumePercentage)}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
