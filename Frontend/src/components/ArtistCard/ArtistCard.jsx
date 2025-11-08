import PropTypes from 'prop-types';
import { memo } from 'react';
import styles from './ArtistCard.module.css';

// ArtistCard: Presentational redesigned artist tile
// Props: artist { name, count, latestSong, latestDate }, isPlayingArtist (bool), loading (bool)
// onPlay: function(artist) to toggle/play
// onSelect: function(artist) when name clicked
// enableCounts: show track count
// onDetails: optional details callback
// disableAutoPlay: if true, central play button hidden
// timeAgo: helper injected for relative time formatting
const ArtistCard = ({
  artist,
  isPlayingArtist,
  loading,
  onPlay,
  onSelect,
  enableCounts = true,
  disableAutoPlay = false,
  timeAgo
}) => {
  const cover = artist.latestSong?.coverImageUrl;
  const latestTs = artist.latestDate;
  const latestSongTitle = artist.latestSong?.title;

  return (
    <div
      className={styles.card}
      data-state={isPlayingArtist ? 'playing' : 'idle'}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect && onSelect(artist)}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(artist);
        }
      }}
    >
      <button
        type="button"
        className={styles.media}
        aria-label={disableAutoPlay ? `View ${artist.name}` : isPlayingArtist ? `Pause ${artist.name}` : `Play ${artist.name}`}
        onClick={(e) => {
          e.stopPropagation();
          if (disableAutoPlay) {
            onSelect && onSelect(artist);
          } else {
            onPlay(artist);
          }
        }}
      >
        {cover ? (
          <img src={cover} alt={`${artist.name} cover`} className={styles.image} />
        ) : (
          <div className={styles.avatar} aria-hidden>
            {artist.name.charAt(0).toUpperCase()}
          </div>
        )}
        {!disableAutoPlay && (
          <div className={styles.centerAction}>
            <button
              type="button"
              className={styles.playBtn}
              aria-label={isPlayingArtist ? 'Pause' : 'Play'}
              onClick={(e) => { e.stopPropagation(); onPlay(artist); }}
            >
              {loading && isPlayingArtist ? '⏳' : isPlayingArtist ? '⏸' : '▶'}
            </button>
          </div>
        )}
        {isPlayingArtist && !disableAutoPlay && (
          <div className={styles.eq} aria-hidden>
            <span></span><span></span><span></span>
          </div>
        )}
      </button>
      <button
        type="button"
        className={styles.name}
        onClick={(e) => { e.stopPropagation(); onSelect && onSelect(artist); }}
      >
        {artist.name}
      </button>
      
      <div className={styles.sub}>
        {enableCounts && (
          <div className={styles.trackCount} title={`${artist.count} tracks`}>
            <span className={styles.trackIcon}>🎵</span>
            {artist.count} track{artist.count !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {latestSongTitle && (
        <>
          <div className={styles.latestSong} title={latestSongTitle}>
            Latest: {latestSongTitle}
          </div>
          {latestTs && timeAgo && (
            <div className={styles.latestInfo}>
              <span className={styles.dot}>•</span>
              {timeAgo(latestTs)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

ArtistCard.propTypes = {
  artist: PropTypes.shape({
    name: PropTypes.string.isRequired,
    count: PropTypes.number,
    latestSong: PropTypes.object,
    latestDate: PropTypes.number
  }).isRequired,
  isPlayingArtist: PropTypes.bool,
  loading: PropTypes.bool,
  onPlay: PropTypes.func,
  onSelect: PropTypes.func,
  enableCounts: PropTypes.bool,
  disableAutoPlay: PropTypes.bool,
  timeAgo: PropTypes.func
};

export default memo(ArtistCard);
