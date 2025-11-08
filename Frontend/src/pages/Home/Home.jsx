import { useEffect, useState } from "react";
import styles from "./Home.module.css";
import { Helmet } from "react-helmet";

import MusicTab from "../../components/MusicTab/MusicTab";
import PlaylistTab from "../../components/PlaylistTab/PlaylistTab";
import Tabs from "../../components/Tabs/Tabs";
import Loader from "../../components/Loader/Loader";
import SearchBar from "../../components/SearchBar/SearchBar";
import axiosMusic from "../../api/axiosMusicConfig";
import axiosAuth from "../../api/axiosAuthConfig";
import { useMusicPlayer } from "../../contexts/useMusicPlayer";

const Home = () => {
  const [user, setUser] = useState(null);
  const [musics, setMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const SONGS_LIMIT = 10;
  // Removed unused activeTab state, only setActiveTab is needed for onTabChange
  const [, setActiveTab] = useState();

  const { currentMusic } = useMusicPlayer();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userRes, musicRes, playlistRes] = await Promise.all([
          axiosAuth.get("/api/auth/me"),
          axiosMusic.get(`/api/music/?skip=0&limit=${SONGS_LIMIT}`),
          axiosMusic.get("/api/music/playlist"), // Already returns populated music objects
        ]);
        setUser(userRes.data.user || null);
        setMusics(musicRes.data.musics || []);
        setHasMore((musicRes.data.musics || []).length === SONGS_LIMIT);
        setPlaylists(playlistRes.data.playlists || []);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
              tabs={[
                {
                  id: "songs",
                  label: "Songs",
                  content: (
                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Songs</h2>
                      <MusicTab musics={musics} />
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
              ]}
              defaultTab="songs"
              onTabChange={setActiveTab}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
