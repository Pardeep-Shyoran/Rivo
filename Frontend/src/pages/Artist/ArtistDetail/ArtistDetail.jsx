import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import axiosMusic from '../../../api/axiosMusicConfig';
import PageWrapper from '../../../components/PageWrapper/PageWrapper';
import Loader from '../../../components/Loader/Loader';
import MusicCard from '../../../components/MusicCard/MusicCard';
import PlaylistTab from '../../../components/PlaylistTab/PlaylistTab';
import EmptyState from '../../../components/EmptyState/EmptyState';
import styles from './ArtistDetail.module.css';

// Lightweight client-side aggregation using existing endpoints.
// In future, replace with dedicated backend endpoint: /api/music/artist/public/:artistName
const ArtistDetail = () => {
  const { artistName } = useParams();
  const decodedArtist = decodeURIComponent(artistName);
  const [musics, setMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        // Fetch a larger batch of songs and playlists then filter client-side
        const [musicRes, playlistRes] = await Promise.all([
          axiosMusic.get('/api/music/?skip=0&limit=200'),
          axiosMusic.get('/api/music/playlist'),
        ]);
        if (!active) return;
        const allMusics = musicRes.data.musics || [];
        const allPlaylists = playlistRes.data.playlists || [];
        setMusics(allMusics.filter(m => m.artist?.trim().toLowerCase() === decodedArtist.toLowerCase()));
        setPlaylists(allPlaylists.filter(p => p.artist?.trim().toLowerCase() === decodedArtist.toLowerCase()));
      } catch {
        if (!active) return;
        setError('Failed to load artist content');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [decodedArtist]);

  const totalTracks = musics.length;
  const totalPlaylists = playlists.length;

  const latestTrack = useMemo(() => {
    return musics.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [musics]);

  return (
    <PageWrapper>
      <div className={styles.artistPage}>
        <header className={styles.header}>
          <div className={styles.identity}> 
            <div className={styles.avatar}>
              {decodedArtist.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className={styles.title}>{decodedArtist}</h1>
              <p className={styles.subtitle}>Discography & Playlists</p>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}><span>{totalTracks}</span> Tracks</div>
            <div className={styles.stat}><span>{totalPlaylists}</span> Playlists</div>
            {latestTrack && (
              <div className={styles.stat}><span>{new Date(latestTrack.createdAt).toLocaleDateString()}</span> Latest Release</div>
            )}
          </div>
        </header>
        {loading ? (
          <Loader message="Loading artist content..." inline />
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.body}> 
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Tracks</h2>
              {musics.length === 0 ? (
                <EmptyState icon="🎵" title="No tracks" description="No tracks found for this artist." />
              ) : (
                <div className={styles.gridTracks}>
                  {musics.map(m => <MusicCard key={m._id} music={m} />)}
                </div>
              )}
            </section>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Playlists</h2>
              {playlists.length === 0 ? (
                <EmptyState icon="📋" title="No playlists" description="No playlists created by this artist." />
              ) : (
                // Reuse unified PlaylistTab vertical full-width layout like Home page
                <PlaylistTab playlists={playlists} />
              )}
            </section>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ArtistDetail;
