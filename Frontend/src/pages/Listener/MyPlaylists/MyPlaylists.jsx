import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosMusic from '../../../api/axiosMusicConfig.jsx';
import PageWrapper from '../../../components/PageWrapper/PageWrapper';
import Loader from '../../../components/Loader/Loader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import PlaylistCard from '../../../components/PlaylistCard/PlaylistCard';
import styles from './MyPlaylists.module.css';

const MyPlaylists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await axiosMusic.get('/api/music/user/playlist');
        setPlaylists(res.data.playlists || []);
      } catch (err) {
        console.error('Error fetching user playlists:', err);
        setError(err?.response?.data?.message || err.message || 'Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <PageWrapper>
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
            </svg>
            Back
          </button>
          <div className={styles.titleWrap}>
            <div className={styles.icon}>📁</div>
            <div>
              <h1 className={styles.title}>My Playlists</h1>
              <p className={styles.subtitle}>All playlists you created</p>
            </div>
          </div>
          <button 
            className={styles.createBtn}
            onClick={() => navigate('/listener/create-playlist')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Create Playlist</span>
          </button>
        </header>

        {loading && (
          <div className={styles.loaderWrap}><Loader /></div>
        )}

        {!loading && error && (
          <EmptyState icon="⚠️" title="Couldn't load" description={error} />
        )}

        {!loading && !error && (
          playlists.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No Playlists Yet"
              description="Create your first playlist to get started."
            />
          ) : (
            <div className={styles.grid}>
              {playlists.map((p) => (
                <PlaylistCard key={p._id} playlist={p} />
              ))}
            </div>
          )
        )}
      </div>
    </PageWrapper>
  );
};

export default MyPlaylists;
