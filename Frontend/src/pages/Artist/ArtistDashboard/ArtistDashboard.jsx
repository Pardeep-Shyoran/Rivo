import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ArtistDashboard.module.css';
import axiosInstance from '../../../api/axiosMusicConfig';
import StatCard from '../../../components/StatCard/StatCard';
import Tabs from '../../../components/Tabs/Tabs';
import MusicTab from '../../../components/MusicTab/MusicTab';
import PlaylistTab from '../../../components/PlaylistTab/PlaylistTab';
import Loader from '../../../components/Loader/Loader';
import FollowersTab from '../../../components/FollowersTab/FollowersTab';
import { useMusicPlayer } from '../../../contexts/useMusicPlayer';

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const [musics, setMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('musics');
  const { currentMusic } = useMusicPlayer();

  // Fetch artist's musics
  const fetchMusics = async () => {
    try {
      const response = await axiosInstance.get('/api/music/artist/musics');
      setMusics(response.data.musics || []);
    } catch (err) {
      setError((prev) => prev ?? 'Failed to fetch musics');
      console.error('Failed to fetch musics', err);
    }
  };

  // Fetch artist's playlists
  const fetchPlaylists = async () => {
    try {
      const response = await axiosInstance.get('/api/music/artist/playlist');
      setPlaylists(response.data.playlists || []);
    } catch (err) {
      setError((prev) => prev ?? 'Failed to fetch playlists');
      console.error('Failed to fetch playlists', err);
    }
  };

  // Fetch artist's followers
  const fetchFollowers = async () => {
    try {
      const response = await axiosInstance.get('/api/music/artist/followers');
      const followersList = response.data.followers || [];
      setFollowers(followersList);
    } catch (err) {
      setError((prev) => prev ?? 'Failed to fetch followers');
      console.error('Failed to fetch followers', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchMusics(), fetchPlaylists(), fetchFollowers()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <Loader message="Loading your content..." inline />
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${currentMusic ? styles.withPlayer : ''}`}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Artist Dashboard</h1>
          <p className={styles.subtitle}>Manage your music and playlists</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.uploadBtn}
            onClick={() => navigate('/artist/upload')}
          >
            <span className={styles.btnIcon}>+</span> Upload Music
          </button>
          <button
            className={styles.playlistBtn}
            onClick={() => navigate('/artist/create-playlist')}
          >
            <span className={styles.btnIcon}>+</span> Create Playlist
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <StatCard icon="🎵" value={musics.length} label="Total Tracks" onClick={() => setActiveTab('musics')}/>
        <StatCard icon="📋" value={playlists.length} label="Playlists" onClick={() => setActiveTab('playlists')}/>
        <StatCard
          icon="👥"
          value={followers.length}
          label="Followers"
          onClick={() => setActiveTab('followers')}
        />
      </div>

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Tabs Component */}
      <Tabs
        tabs={[
          {
            id: 'musics',
            label: 'My Music',
            content: <MusicTab musics={musics} />,
          },
          {
            id: 'playlists',
            label: 'My Playlists',
            content: <PlaylistTab playlists={playlists} musics={musics} />, 
          },
          {
            id: 'followers',
            label: 'Followers',
            content: <FollowersTab followers={followers} />,
          },
        ]}
        defaultTab="musics"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default ArtistDashboard;