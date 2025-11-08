import PropTypes from 'prop-types';
import { useMemo } from 'react';
import styles from './ArtistTab.module.css';
import ArtistCard from '../ArtistCard/ArtistCard';
import EmptyState from '../EmptyState/EmptyState';
import Loader from '../Loader/Loader';
import { useMusicPlayer } from '../../contexts/useMusicPlayer';

// ArtistTab: shows a list of unique artists derived from musics
// Props:
// - musics: array of music objects each containing at least { artist, _id }
// - isLoading: optional loading override
// - onSelectArtist: optional callback when an artist card is clicked
// - enableCounts: show track counts per artist
// Options:
// previewLimit: show only first N artists (undefined = all)
// disableAutoPlay: if true, clicking media won't start playback
const ArtistTab = ({ musics, isLoading = false, onSelectArtist, enableCounts = true, previewLimit, disableAutoPlay = false }) => {
  const { currentMusic, isPlaying, loading, playMusic, pauseMusic } = useMusicPlayer();

  // Derive unique artists with counts + latest cover + last played
  const artists = useMemo(() => {
    const byArtist = new Map();
    for (const m of musics) {
      const originalName = (m.artist || 'Unknown').trim();
      // Use lowercase key for case-insensitive matching
      const key = originalName.toLowerCase();
      const cur = byArtist.get(key) || { name: originalName, count: 0, latestSong: null, latestDate: 0 };
      cur.count += 1;
      const created = new Date(m.createdAt || 0).getTime();
      if (!cur.latestSong || created > cur.latestDate) {
        cur.latestSong = m;
        cur.latestDate = created;
      }
      byArtist.set(key, cur);
    }
    return Array.from(byArtist.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [musics]);

  if (isLoading) {
    return <Loader message="Loading artists..." inline />;
  }

  if (artists.length === 0) {
    return (
      <EmptyState
        icon="🎤"
        title="No artists found"
        description="Upload music to see artist listings"
        // Could navigate to upload in future via callback
      />
    );
  }

  // Helpers
  const isArtistNowPlaying = (artistName) => {
    return !!currentMusic && currentMusic.artist?.trim().toLowerCase() === artistName.toLowerCase() && isPlaying;
  };

  const handlePrimaryAction = (artist) => {
    // If same artist is currently playing, toggle pause/play on the current track
    if (currentMusic && currentMusic.artist?.trim().toLowerCase() === artist.name.toLowerCase()) {
      if (isPlaying) pauseMusic();
      else playMusic(currentMusic);
      return;
    }
    // Else play latest song from this artist
    if (artist.latestSong) {
      playMusic(artist.latestSong);
    }
  };

  const timeAgo = (ts) => {
    if (!ts) return null;
    const diff = Date.now() - ts;
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  const finalList = previewLimit ? artists.slice(0, previewLimit) : artists;

  return (
    <div className={styles.artistsGrid}>
      {finalList.map((artist) => (
        <ArtistCard
          key={artist.name}
          artist={artist}
          isPlayingArtist={isArtistNowPlaying(artist.name)}
          loading={loading && currentMusic?.artist?.trim().toLowerCase() === artist.name.toLowerCase()}
          onPlay={handlePrimaryAction}
          onSelect={onSelectArtist}
          enableCounts={enableCounts}
          disableAutoPlay={disableAutoPlay}
          timeAgo={timeAgo}
        />
      ))}
    </div>
  );
};

ArtistTab.propTypes = {
  musics: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onSelectArtist: PropTypes.func,
  enableCounts: PropTypes.bool,
  previewLimit: PropTypes.number,
  disableAutoPlay: PropTypes.bool,
};

export default ArtistTab;
