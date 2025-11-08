import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosMusicConfig from '../../api/axiosMusicConfig';
import PageWrapper from '../../components/PageWrapper/PageWrapper';
import MusicCard from '../../components/MusicCard/MusicCard';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PlaylistDetail.module.css';

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await axiosMusicConfig.get(`/api/music/playlist/${playlistId}`);
        setPlaylist(res.data.playlist);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError('Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  if (loading) {
    return (
      <PageWrapper>
        <Loader />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <EmptyState
          icon="⚠️"
          title="Error Loading Playlist"
          description={error}
        />
      </PageWrapper>
    );
  }

  if (!playlist) {
    return (
      <PageWrapper>
        <EmptyState
          icon="📋"
          title="Playlist Not Found"
          description="The playlist you're looking for doesn't exist."
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={styles.playlistDetailContainer}>
        <div className={styles.playlistHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
            </svg>
            Back
          </button>
          <div className={styles.playlistInfo}>
            <div className={styles.playlistIcon}>📋</div>
            <div>
              <h1 className={styles.playlistTitle}>{playlist.title}</h1>
              {playlist.artist && (
                <p className={styles.playlistArtist}>By {playlist.artist}</p>
              )}
              <p className={styles.playlistCount}>
                {playlist.musics?.length || 0} {playlist.musics?.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.musicsGrid}>
          {playlist.musics && playlist.musics.length > 0 ? (
            playlist.musics.map((music) => (
              <MusicCard key={music._id} music={music} />
            ))
          ) : (
            <EmptyState
              icon="🎵"
              title="No Songs Yet"
              description="This playlist doesn't have any songs yet."
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default PlaylistDetail;
