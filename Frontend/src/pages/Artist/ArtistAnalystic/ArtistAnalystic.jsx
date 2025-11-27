import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ArtistAnalystic.module.css';
import axiosInstance from '../../../api/axiosMusicConfig';
import Sparkline from '../../../components/Charts/Sparkline';
import RadialMetric from '../../../components/Charts/RadialMetric';
import LineChart from '../../../components/Charts/LineChart';
import BarChart from '../../../components/Charts/BarChart';
import Loader from '../../../components/Loader/Loader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import FollowersTab from '../../../components/FollowersTab/FollowersTab';
import { useMusicPlayer } from '../../../contexts/useMusicPlayer';

// Small table component for top tracks
const TopTracksTable = ({ tracks = [], averagePlays = 0 }) => {
  if (!tracks.length) {
    return <EmptyState icon="🎵" title="No plays yet" description="Your tracks will appear here once they get plays." />;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Track</th>
            <th>Plays</th>
            <th>Likes</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((t, i) => {
            const plays = t.playCount ?? 0;
            const trending = plays > averagePlays;
            return (
            <tr key={t._id || t.id || i} className={trending ? styles.trendingRow : undefined}>
              <td>{i + 1}</td>
              <td className={styles.trackNameCell}>
                <span className={styles.trackName}>{t.title || t.name || 'Untitled'}</span>
                {t.genre && <span className={styles.badge}>{t.genre}</span>}
                {trending && <span className={styles.trendUp} title="Above average plays">▲</span>}
              </td>
              <td>{plays}</td>
              <td>{t.likes ?? t.likeCount ?? 0}</td>
              <td>{t.duration ? formatDuration(t.duration) : '—'}</td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
};

// Helper to format seconds to mm:ss
const formatDuration = (value) => {
  if (!value || Number.isNaN(Number(value))) return '—';
  const total = Number(value);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ArtistAnalystic = () => {
  const navigate = useNavigate();
  const { currentMusic } = useMusicPlayer();
  const [musics, setMusics] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [timeRange, setTimeRange] = useState('30d'); // default range for analytics
  const [summary, setSummary] = useState(null);
  const [playsTrendData, setPlaysTrendData] = useState([]);
  const [followersTrendData, setFollowersTrendData] = useState([]);
  const [engagementData, setEngagementData] = useState(null);

  const fetchMusics = async () => {
    try {
      const res = await axiosInstance.get('/api/music/artist/musics');
      setMusics(res.data.musics || []);
    } catch (err) {
      setError((prev) => prev ?? 'Failed to fetch tracks');
      console.error(err);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await axiosInstance.get('/api/music/artist/followers');
      setFollowers(res.data.followers || []);
    } catch (err) {
      setError((prev) => prev ?? 'Failed to fetch followers');
      console.error(err);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await axiosInstance.get('/api/music/artist/playlist');
      setPlaylists(res.data.playlists || []);
    } catch (err) {
      setError((prev) => prev ?? 'Failed to fetch playlists');
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchMusics(), fetchFollowers(), fetchPlaylists()]);
        // Fetch backend analytics after base data
        const [summaryRes, playsRes, followersRes, engagementRes] = await Promise.all([
          axiosInstance.get('/api/music/artist/analytics/summary'),
          axiosInstance.get(`/api/music/artist/analytics/plays?range=${timeRange}`),
          axiosInstance.get(`/api/music/artist/analytics/followers?range=${timeRange}`),
          axiosInstance.get(`/api/music/artist/analytics/engagement?range=${timeRange}`)
        ]);
        setSummary(summaryRes.data || null);
        setPlaysTrendData((playsRes.data?.data || []).map(d => d.plays));
        setFollowersTrendData((followersRes.data?.data || []).map(d => d.cumulativeFollowers));
        setEngagementData(engagementRes.data || null);
      } catch (err) {
        console.error('Analytics fetch failed, falling back to synthetic trends', err);
      }
      setLoading(false);
    };
    load();
  }, [timeRange]);

  const totalPlays = useMemo(() => summary?.totalPlays ?? musics.reduce((sum, m) => sum + (m.playCount || 0), 0), [summary, musics]);
  const averagePlays = useMemo(() => summary?.avgPlaysPerTrack ?? (musics.length ? Math.round(totalPlays / musics.length) : 0), [summary, totalPlays, musics.length]);
  const genres = useMemo(() => {
    const set = new Set();
    musics.forEach(m => { if (m.genre) set.add(m.genre); });
    return Array.from(set).sort();
  }, [musics]);

  const filteredMusics = useMemo(() => {
    return musics.filter(m => {
      const genreMatch = selectedGenre === 'all' || m.genre === selectedGenre;
      // timeRange logic placeholder (requires createdAt or play events)
      return genreMatch;
    });
  }, [musics, selectedGenre]);

  const topTracks = useMemo(() => [...filteredMusics].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 5), [filteredMusics]);
  const recentFollowers = useMemo(() => [...followers].sort((a, b) => new Date(b.followedAt) - new Date(a.followedAt)).slice(0, 8), [followers]);

  // Synthetic trend arrays (placeholder until real time-series endpoints)
  const playsTrend = useMemo(() => (playsTrendData.length ? playsTrendData : filteredMusics.map(m => m.playCount || 0)), [playsTrendData, filteredMusics]);

  const followerTrend = useMemo(() => (followersTrendData.length ? followersTrendData : (() => {
    const last = recentFollowers.slice(0, 12).reverse();
    let acc = 0;
    return last.map(() => ++acc);
  })()), [followersTrendData, recentFollowers]);

  const engagementRatio = useMemo(() => {
    if (engagementData?.engagementPct !== undefined) {
      return Number(engagementData.engagementPct);
    }
    if (!filteredMusics.length) return 0;
    const liked = filteredMusics.reduce((sum, m) => sum + (m.likes || m.likeCount || 0), 0);
    const plays = filteredMusics.reduce((sum, m) => sum + (m.playCount || 0), 0);
    return liked ? Math.min(liked / (plays || 1) * 100, 100) : 0;
  }, [engagementData, filteredMusics]);

  if (loading) {
    return <div className={`${styles.page} ${currentMusic ? styles.withPlayer : ''}`}><Loader message="Loading analytics..." inline /></div>;
  }

  return (
    <div className={`${styles.page} ${currentMusic ? styles.withPlayer : ''}`}>
      <div className={styles.header}> 
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Artist Analytics</h1>
          <p className={styles.subtitle}>Performance overview & audience insights</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.backBtn} onClick={() => navigate('/artist/dashboard')}>← Dashboard</button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.statsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}><span>Tracks</span></div>
          <div className={styles.metricValue}>{musics.length}</div>
          <div className={styles.metricSpark}><Sparkline data={playsTrend} stroke="var(--primary-color)" /></div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}><span>Total Plays</span></div>
          <div className={styles.metricValue}>{totalPlays}</div>
          <div className={styles.metricSpark}><Sparkline data={playsTrend} stroke="var(--secondary-color)" /></div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}><span>Avg Plays / Track</span></div>
          <div className={styles.metricValue}>{averagePlays}</div>
          <div className={styles.metricSpark}><Sparkline data={playsTrend.slice(-8)} stroke="#ff6b35" /></div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}><span>Playlists</span></div>
          <div className={styles.metricValue}>{playlists.length}</div>
          <div className={styles.metricSpark}><Sparkline data={[playlists.length || 0]} stroke="var(--secondary-color)" /></div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}><span>Followers</span></div>
          <div className={styles.metricValue}>{followers.length}</div>
          <div className={styles.metricSpark}><Sparkline data={followerTrend} stroke="var(--primary-color)" /></div>
        </div>
        <div className={`${styles.metricCard} ${styles.metricRadial}`}>
          <div className={styles.metricHeader}><span>Engagement</span></div>
          <RadialMetric value={engagementRatio} max={100} label="Likes/Plays" />
        </div>
      </div>

      <div className={styles.gridLayout}>
        <section className={styles.panel} aria-labelledby="top-tracks-heading">
          <div className={styles.panelHeader}>
            <h2 id="top-tracks-heading">Top Tracks</h2>
            <p className={styles.panelSub}>Your most played music</p>
          </div>
          <div className={styles.filtersBar}>
            <div className={styles.filterGroup}>
              <label htmlFor="genreFilter" className={styles.filterLabel}>Genre</label>
              <select
                id="genreFilter"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className={styles.select}
              >
                <option value="all">All</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="timeRange" className={styles.filterLabel}>Range</label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.select}
              >
                <option value="all">All time</option>
                <option value="30d">Last 30d</option>
                <option value="7d">Last 7d</option>
              </select>
            </div>
          </div>
          <TopTracksTable tracks={topTracks} averagePlays={averagePlays} />
        </section>

        <section className={styles.panel} aria-labelledby="followers-heading">
          <div className={styles.panelHeader}>
            <h2 id="followers-heading">Recent Followers</h2>
            <p className={styles.panelSub}>Latest audience growth</p>
          </div>
          <div className={styles.followersWrapper}>
            <FollowersTab followers={recentFollowers} />
          </div>
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="insights-heading">
        <div className={styles.panelHeader}>
          <h2 id="insights-heading">Insights (Coming Soon)</h2>
          <p className={styles.panelSub}>Charts & geographic breakdown will appear here.</p>
        </div>
        <div className={styles.placeholderCharts}>
          <div className={styles.chartBlock}>
            <h3>Plays Trend</h3>
            <LineChart data={playsTrend} width={320} height={140} stroke="var(--secondary-color)" fill="rgba(255,107,53,0.25)" label="Plays trend" />
          </div>
          <div className={styles.chartBlock}>
            <h3>Follower Growth</h3>
            <BarChart data={followerTrend.map((v,i)=>({label:`-${followerTrend.length - i - 1}d`, value:v}))} width={320} height={140} barColor="var(--primary-color)" label="Follower growth" />
          </div>
          <div className={styles.chartBlock}>
            <h3>Engagement</h3>
            <RadialMetric value={engagementRatio} max={100} label="Likes/Plays" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtistAnalystic;