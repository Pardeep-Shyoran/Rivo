import { useNavigate } from 'react-router-dom';
import styles from './DashBoard.module.css';
import StatCard from '../../../components/StatCard/StatCard';
import MusicCard from '../../../components/MusicCard/MusicCard';
import PlaylistCard from '../../../components/PlaylistCard/PlaylistCard';
import Loader from '../../../components/Loader/Loader';
import useListenerDashboardData from '../../../hooks/useListenerDashboardData';
import { useMusicPlayer } from '../../../contexts/useMusicPlayer';

const DashBoard = () => {
  const navigate = useNavigate();
  const {
    musics,
    playlists,
    loading,
    error,
  // totalTracks removed from stats
  // newToday removed from stats
    totalPlaylists,
    topArtists,
    recommendations,
    timeOfDayRecommendations,
    timeOfDayTag,
    genreDistribution,
    listeningStreak,
    listenerName,
  } = useListenerDashboardData({ limit: 36 });

  const { playHistory } = useMusicPlayer();

  const stats = [
    { icon: '📁', value: totalPlaylists, label: 'My Playlists', onClick: () => navigate('/listener/playlists') },
    { icon: '🔥', value: listeningStreak, label: 'Day Streak' },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back{listenerName ? `, ${listenerName}` : ''} 👋</h1>
          <p className={styles.subtitle}>Here's what's new and tailored for you.</p>
        </div>
        <button 
          className={styles.createPlaylistBtn} 
          onClick={() => navigate('/listener/create-playlist')}
          aria-label="Create new playlist"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Create Playlist</span>
        </button>
      </header>

      {loading && (
        <div className={styles.loaderWrapper}>
          <Loader />
        </div>
      )}

      {error && !loading && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <>
          <section className={styles.statsSection} aria-label="listener stats">
            {stats.map((s) => (
              <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} onClick={s.onClick} />
            ))}
          </section>

          {playHistory?.length > 0 && (
            <section className={styles.section} aria-label="continue listening">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Continue Listening</h2>
                <p className={styles.sectionDesc}>Pick up where you left off</p>
              </div>
              <div className={styles.gridTracks}>
                {playHistory.slice(0, 8).map((m) => (
                  <MusicCard key={m._id} music={m} />
                ))}
              </div>
            </section>
          )}

          {recommendations?.length > 0 && (
            <section className={styles.section} aria-label="recommended for you">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Top Picks For You</h2>
                <p className={styles.sectionDesc}>Based on your listening</p>
              </div>
              <div className={styles.gridTracks}>
                {recommendations.map((m) => (
                  <MusicCard key={m._id} music={m} />
                ))}
              </div>
            </section>
          )}

          {timeOfDayRecommendations?.length > 0 && (
            <section className={styles.section} aria-label="time of day picks">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{timeOfDayTag} Picks</h2>
                <p className={styles.sectionDesc}>Handpicked for your current vibe</p>
              </div>
              <div className={styles.gridTracks}>
                {timeOfDayRecommendations.map((m) => (
                  <MusicCard key={m._id} music={m} />
                ))}
              </div>
            </section>
          )}

          <section className={styles.section} aria-label="recent tracks">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Tracks</h2>
              <p className={styles.sectionDesc}>Freshly added or trending now</p>
            </div>
            {musics.length === 0 ? (
              <p className={styles.emptyState}>No tracks available yet.</p>
            ) : (
              <div className={styles.gridTracks}>
                {musics.slice(0, 12).map((m) => (
                  <MusicCard key={m._id} music={m} />
                ))}
              </div>
            )}
          </section>

          <section className={styles.section} aria-label="top artists">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Top Artists</h2>
              <p className={styles.sectionDesc}>Most active creators</p>
            </div>
            {topArtists.length === 0 ? (
              <p className={styles.emptyState}>No artists to show yet.</p>
            ) : (
              <ul className={styles.artistList}>
                {topArtists.map((a) => (
                  <li key={a.artist} className={styles.artistItem}>
                    <span className={styles.artistName}>{a.artist}</span>
                    <span className={styles.artistCount}>{a.count} tracks</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {genreDistribution?.length > 0 && (
            <section className={styles.section} aria-label="genres">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Genres</h2>
                <p className={styles.sectionDesc}>Where you spend most time</p>
              </div>
              <ul className={styles.genreList}>
                {genreDistribution.map((g) => (
                  <li key={g.genre} className={styles.genreItem}>
                    <span className={styles.genreName}>{g.genre}</span>
                    <span className={styles.genreCount}>{g.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.section} aria-label="my playlists">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Playlists</h2>
              <p className={styles.sectionDesc}>Your recent collections</p>
              {playlists.length > 6 && (
                <button
                  className={styles.viewAllPlaylistsBtn}
                  onClick={() => navigate('/listener/playlists')}
                  aria-label="View all playlists"
                >
                  View All
                </button>
              )}
            </div>
            {playlists.length === 0 ? (
              <div className={styles.emptyPlaylists}>
                <div className={styles.emptyIcon}>🎵</div>
                <p className={styles.emptyText}>You haven't created any playlists yet</p>
                <button 
                  className={styles.createPlaylistBtnSecondary}
                  onClick={() => navigate('/listener/create-playlist')}
                >
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className={styles.playlistsList}>
                {playlists.slice(0, 6).map((p) => (
                  <PlaylistCard key={p._id} playlist={p} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DashBoard;