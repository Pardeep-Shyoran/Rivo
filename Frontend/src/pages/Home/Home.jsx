import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { Helmet } from "react-helmet";

import MusicTab from "../../components/MusicTab/MusicTab";
import ArtistTab from "../../components/ArtistTab/ArtistTab";
import PlaylistTab from "../../components/PlaylistTab/PlaylistTab";
import Tabs from "../../components/Tabs/Tabs";
import Loader from "../../components/Loader/Loader";
import SearchBar from "../../components/SearchBar/SearchBar";
import AllTab from "../../components/AllTab/AllTab";
import axiosMusic from "../../api/axiosMusicConfig";
import axiosAuth from "../../api/axiosAuthConfig";
import { useMusicPlayer } from "../../contexts/useMusicPlayer";

const Home = () => {
  const [user, setUser] = useState(null);
  const [musics, setMusics] = useState([]);
  const [allMusicsForArtists, setAllMusicsForArtists] = useState([]); // For artist counting
  const [playlists, setPlaylists] = useState([]);
  const [exploreSongs, setExploreSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingAllMusic, setLoadingAllMusic] = useState(false);
  const SONGS_LIMIT = 10;
  const EXPLORE_LIMIT = 6;
  const [activeTab, setActiveTab] = useState("all");
  const [artistFilter, setArtistFilter] = useState(null);

  const { currentMusic } = useMusicPlayer();
  const navigate = useNavigate();

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userRes, musicRes, playlistRes, exploreRes] = await Promise.all([
          axiosAuth.get("/api/auth/me"),
          axiosMusic.get(`/api/music/?skip=0&limit=${SONGS_LIMIT}`),
          axiosMusic.get("/api/music/playlist"), // Already returns populated music objects
          axiosMusic.get(`/api/music/?skip=0&limit=${EXPLORE_LIMIT}`), // Get songs for explore section
        ]);
        setUser(userRes.data.user || null);
        setMusics(musicRes.data.musics || []);
        setHasMore((musicRes.data.musics || []).length === SONGS_LIMIT);
        setPlaylists(playlistRes.data.playlists || []);
        setExploreSongs(exploreRes.data.musics || []);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch all music for artist counting
  useEffect(() => {
    const fetchAllMusic = async () => {
      if (allMusicsForArtists.length > 0) return; // Already fetched
      setLoadingAllMusic(true);
      try {
        const res = await axiosMusic.get('/api/music/?skip=0&limit=1000'); // Fetch large batch
        setAllMusicsForArtists(res.data.musics || []);
      } catch (err) {
        console.error('Failed to fetch all music for artists:', err);
        // Fallback to current musics if fetch fails
        setAllMusicsForArtists(musics);
      } finally {
        setLoadingAllMusic(false);
      }
    };
    
    // Only fetch when user switches to artists tab or all tab
    if ((activeTab === 'artists' || activeTab === 'all') && allMusicsForArtists.length === 0) {
      fetchAllMusic();
    }
  }, [activeTab, allMusicsForArtists.length, musics]);

  // Lazy load more songs
  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const skip = musics.length;
      const res = await axiosMusic.get(`/api/music/?skip=${skip}&limit=${SONGS_LIMIT}`);
      const newMusics = res.data.musics || [];
      setMusics((prev) => [...prev, ...newMusics]);
      setHasMore(newMusics.length === SONGS_LIMIT);
    } catch {
      setError("Failed to load more songs");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Home || Rivo</title>
        <meta name="description" content="Welcome to the Home page" />
      </Helmet>
      <div className={`${styles.home} ${currentMusic ? styles.withPlayer : ''}`}>
        <div className={styles.content}>
          <div className={styles.headerSection}>
            <h1 className={styles.heading}>
              Welcome to Rivo{user ? `, ${user.fullName.firstName + " " + user.fullName.lastName}` : ""}!
            </h1>
            <SearchBar />
          </div>
          {loading ? (
            <Loader message="Loading your content..." inline />
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <Tabs
              activeTab={activeTab}
              tabs={[
                {
                  id: "all",
                  label: "All",
                  content: (
                    <AllTab
                      exploreSongs={exploreSongs}
                      musics={allMusicsForArtists.length > 0 ? allMusicsForArtists : musics}
                      playlists={playlists}
                      exploreLimit={EXPLORE_LIMIT}
                      onNavigateToSongs={() => setActiveTab("songs")}
                      onNavigateToPlaylists={() => setActiveTab("playlists")}
                      onNavigateToArtists={() => setActiveTab("artists")}
                      onFilterByArtist={(name) => { setArtistFilter(name); setActiveTab("songs"); }}
                      onNavigateToArtistDetail={(artist) => navigate(`/artists/${encodeURIComponent(artist.name)}`)}
                    />
                  ),
                },
                {
                  id: "songs",
                  label: "Songs",
                  content: (
                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Songs</h2>
                      <MusicTab musics={artistFilter ? musics.filter(m => m.artist?.trim().toLowerCase() === artistFilter.toLowerCase()) : musics} />
                      {artistFilter && (
                        <div style={{marginTop:'0.75rem'}}>
                          <button
                            onClick={() => setArtistFilter(null)}
                            style={{
                              background:'none',
                              border:'none',
                              color:'var(--primary-color)',
                              cursor:'pointer',
                              fontWeight:600
                            }}
                          >Clear Artist Filter ({artistFilter})</button>
                        </div>
                      )}
                      {hasMore && (
                        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            style={{
                              padding: "0.75rem 2rem",
                              fontSize: "1rem",
                              borderRadius: "6px",
                              background: "var(--primary-color)",
                              color: "#fff",
                              border: "none",
                              cursor: loadingMore ? "not-allowed" : "pointer",
                              opacity: loadingMore ? 0.7 : 1,
                              fontWeight: 600,
                            }}
                          >
                            {loadingMore ? "Loading..." : "Load More"}
                          </button>
                        </div>
                      )}
                    </section>
                  ),
                },
                {
                  id: "playlists",
                  label: "Playlists",
                  content: (
                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Playlists</h2>
                      <PlaylistTab playlists={playlists} />
                    </section>
                  ),
                },
                {
                  id: "artists",
                  label: "Artists",
                  content: (
                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Artists</h2>
                      <ArtistTab 
                        musics={allMusicsForArtists.length > 0 ? allMusicsForArtists : musics}
                        isLoading={loadingAllMusic}
                        disableAutoPlay
                        onSelectArtist={(artist) => navigate(`/artists/${encodeURIComponent(artist.name)}`)}
                      />
                    </section>
                  ),
                },
              ]}
              defaultTab="all"
              onTabChange={setActiveTab}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
