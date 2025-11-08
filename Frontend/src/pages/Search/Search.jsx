import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosMusicConfig from '../../api/axiosMusicConfig';
import PageWrapper from '../../components/PageWrapper/PageWrapper';
import MusicCard from '../../components/MusicCard/MusicCard';
import ArtistTab from '../../components/ArtistTab/ArtistTab';
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';
import SearchBar from '../../components/SearchBar/SearchBar';
import styles from './Search.module.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const navigate = useNavigate();
  
  const [results, setResults] = useState({ musics: [], playlists: [] });
  const [artists, setArtists] = useState([]); // derived unique artists
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'music', 'playlist', 'artist'
  const [artistFilter, setArtistFilter] = useState(null);

  const performSearch = async () => {
    if (!query) return;
    
    setLoading(true);
    setError(null);

    try {
      const endpoint = activeTab === 'all'
        ? '/api/music/search'
        : activeTab === 'music'
        ? '/api/music/search/music'
        : activeTab === 'playlist'
        ? '/api/music/search/playlist'
        : '/api/music/search/music'; // artist tab leverages music search then aggregates

    //   console.log('🔍 Search Request:', {
    //     query,
    //     activeTab,
    //     endpoint,
    //     fullUrl: axiosMusicConfig.defaults.baseURL + endpoint
    //   });

      const response = await axiosMusicConfig.get(endpoint, {
        params: { q: query }
      });

    //   console.log('✅ Search Response:', response.data);

      if (activeTab === 'all') {
        setResults({
          musics: response.data.results?.musics || [],
          playlists: response.data.results?.playlists || []
        });
      } else if (activeTab === 'music' || activeTab === 'artist') {
        setResults({
          musics: response.data.musics || [],
          playlists: []
        });
      } else {
        setResults({
          musics: [],
          playlists: response.data.playlists || []
        });
      }

      // Derive unique artists whenever we have musics (for all, music, artist tabs)
      const sourceMusics = activeTab === 'all' ? (response.data.results?.musics || []) : (activeTab === 'playlist' ? [] : (response.data.musics || []));
      const map = new Map();
      for (const m of sourceMusics) {
        const key = (m.artist || 'Unknown').trim();
        const obj = map.get(key) || { name: key, count: 0, latestSong: null, latestDate: 0 };
        obj.count += 1;
        const created = new Date(m.createdAt || 0).getTime();
        if (!obj.latestSong || created > obj.latestDate) {
          obj.latestSong = m;
          obj.latestDate = created;
        }
        map.set(key, obj);
      }
      setArtists(Array.from(map.values()).sort((a,b) => b.count - a.count));
    } catch (err) {
      console.error('Search error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to fetch search results';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTab]);

  const totalResults = results.musics.length + results.playlists.length;

  // Check if current tab has no results
  const hasNoResults = () => {
    if (activeTab === 'all') return totalResults === 0;
    if (activeTab === 'music') return results.musics.length === 0;
    if (activeTab === 'playlist') return results.playlists.length === 0;
    if (activeTab === 'artist') return artists.length === 0;
    return false;
  };

  return (
    <PageWrapper>
      <div className={styles.searchPage}>
        <div className={styles.searchHeader}>
          <div className={styles.headerTop}>
            <h1>Search Results</h1>
            <div className={styles.searchBarWrapper}>
              <SearchBar placeholder="Search for more..." alwaysExpanded={true} />
            </div>
          </div>
          {query && (
            <p className={styles.searchQuery}>
              Showing results for: <span>"{query}"</span>
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'music' ? styles.active : ''}`}
            onClick={() => setActiveTab('music')}
          >
            Songs
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'playlist' ? styles.active : ''}`}
            onClick={() => setActiveTab('playlist')}
          >
            Playlists
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'artist' ? styles.active : ''}`}
            onClick={() => setActiveTab('artist')}
          >
            Artists
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : hasNoResults() ? (
          <EmptyState 
            icon="🔍"
            title={
              activeTab === 'music' 
                ? `No songs found for "${query}"` 
                : activeTab === 'playlist' 
                ? `No playlists found for "${query}"` 
                : `No results found for "${query}"`
            }
            description={
              activeTab === 'music' 
                ? "Try searching for different song titles or artist names" 
                : activeTab === 'playlist' 
                ? "Try searching for different playlist names or artists" 
                : "Try searching with different keywords or check other tabs"
            }
          />
        ) : (
          <div className={styles.resultsContainer}>
            {/* Artist Results */}
            {activeTab === 'artist' && artists.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Artists ({artists.length})</h2>
                <ArtistTab 
                  musics={results.musics}
                  disableAutoPlay
                  enableCounts
                  previewLimit={undefined}
                  onSelectArtist={(artist) => navigate(`/artists/${encodeURIComponent(artist.name)}`)}
                />
              </section>
            )}

            {/* Music Results */}
            {(activeTab === 'all' || activeTab === 'music') && results.musics.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {artistFilter ? `Songs by ${artistFilter}` : 'Songs'} {activeTab === 'all' && !artistFilter && `(${results.musics.length})`}
                </h2>
                <div className={styles.grid}>
                  {(artistFilter ? results.musics.filter(m => m.artist?.trim().toLowerCase() === artistFilter.toLowerCase()) : results.musics).map((music) => (
                    <MusicCard key={music._id} music={music} />
                  ))}
                </div>
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
                    >Clear Artist Filter</button>
                  </div>
                )}
              </section>
            )}

            {/* Empty state for no songs in "All" tab when playlists exist */}
            {activeTab === 'all' && results.musics.length === 0 && results.playlists.length > 0 && (
              <section className={styles.section}>
                <div className={styles.emptySection}>
                  <p className={styles.emptySectionText}>No songs found for "{query}"</p>
                </div>
              </section>
            )}

            {/* Playlist Results */}
            {(activeTab === 'all' || activeTab === 'playlist') && results.playlists.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Playlists {activeTab === 'all' && `(${results.playlists.length})`}
                </h2>
                <div className={styles.playlistGrid}>
                  {results.playlists.map((playlist) => (
                    <PlaylistCard key={playlist._id} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state for no playlists in "All" tab when songs exist */}
            {activeTab === 'all' && results.playlists.length === 0 && results.musics.length > 0 && (
              <section className={styles.section}>
                <div className={styles.emptySection}>
                  <p className={styles.emptySectionText}>No playlists found for "{query}"</p>
                </div>
              </section>
            )}
            {/* Empty state for Artists tab when no artists */}
            {activeTab === 'artist' && artists.length === 0 && (
              <section className={styles.section}>
                <EmptyState icon="🎤" title={`No artists matched "${query}"`} description="Try a different name or check Songs tab." />
              </section>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Search;
