import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import axiosMusic from '../../../api/axiosMusicConfig';
import axiosAuth from '../../../api/axiosAuthConfig';
import { followArtist, unfollowArtist, getFollowStatus, getFollowersCount } from '../../../api/followAPI';
import PageWrapper from '../../../components/PageWrapper/PageWrapper';
import Loader from '../../../components/Loader/Loader';
import MusicTab from '../../../components/MusicTab/MusicTab';
import PlaylistTab from '../../../components/PlaylistTab/PlaylistTab';
import Tabs from '../../../components/Tabs/Tabs';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { useUser } from '../../../contexts/useUser';
import styles from './ArtistDetail.module.css';

/**
 * Artist Detail Page
 * 
 * Displays comprehensive artist profile with:
 * - Artist identity & avatar
 * - Statistics (tracks, playlists, latest release, total plays)
 * - Complete discography (tracks grid)
 * - Artist playlists (grid layout)
 * 
 * Uses backend search endpoint (/api/music/search) for efficient filtering by artist name.
 * Future enhancement: Dedicated backend endpoint /api/music/artist/public/:artistName
 */
const ArtistDetail = () => {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedArtist = decodeURIComponent(artistName);
  const { user, loading: userLoading } = useUser();
  
  const [artistId, setArtistId] = useState(null);
  const [followersCount, setFollowersCount] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatusLoading, setFollowStatusLoading] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [musics, setMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [artistProfile, setArtistProfile] = useState(null); // Artist bio and profile picture
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tracks'); // tabs: tracks | playlists

  const userId = user?.id || user?._id || null;
  const isOwnProfile = artistId && userId && String(artistId) === String(userId);

  useEffect(() => {
    let active = true;
    
    const fetchArtistData = async () => {
      setLoading(true);
      setError(null);
      setArtistProfile(null);
      setArtistId(null);
      setFollowersCount(null);
      setIsFollowing(false);
      
      try {
        // Use search endpoint to find artist's content
        // This is more efficient than fetching all and filtering client-side
        const [musicSearchRes, playlistSearchRes] = await Promise.all([
          axiosMusic.get('/api/music/search/music', {
            params: { q: decodedArtist, limit: 500 }
          }),
          axiosMusic.get('/api/music/search/playlist', {
            params: { q: decodedArtist, limit: 200 }
          })
        ]);
        
        if (!active) return;

        // Filter results to exact artist name match (case-insensitive)
        const artistMusics = (musicSearchRes.data.musics || []).filter(
          m => m.artist?.trim().toLowerCase() === decodedArtist.toLowerCase()
        );
        
        const artistPlaylists = (playlistSearchRes.data.playlists || []).filter(
          p => p.artist?.trim().toLowerCase() === decodedArtist.toLowerCase()
        );

        setMusics(artistMusics);
        setPlaylists(artistPlaylists);
        
        // Fetch artist profile data (bio, profilePicture)
        // Try by artistId first, then fall back to artist name
        const resolvedArtistId = artistMusics[0]?.artistId || artistPlaylists[0]?.artistId;
        setArtistId(resolvedArtistId ? String(resolvedArtistId) : null);
        
        if (resolvedArtistId) {
          try {
            const profileRes = await axiosAuth.get(`/api/auth/artist/public/${resolvedArtistId}`);
            setArtistProfile({
              bio: profileRes.data.artist.bio,
              profilePicture: profileRes.data.artist.profilePicture,
              displayName: profileRes.data.artist.displayName,
              createdAt: profileRes.data.artist.createdAt,
            });
          } catch (profileErr) {
            console.log('Artist profile by ID not found, trying by name:', profileErr);
            // Fallback: Try fetching by artist name
            try {
              const nameProfileRes = await axiosAuth.get(
                `/api/auth/artist/public/name/${encodeURIComponent(decodedArtist)}`
              );
              setArtistProfile({
                bio: nameProfileRes.data.artist.bio,
                profilePicture: nameProfileRes.data.artist.profilePicture,
                displayName: nameProfileRes.data.artist.displayName,
                createdAt: nameProfileRes.data.artist.createdAt,
              });
            } catch (nameErr) {
              console.log('Artist profile not available:', nameErr);
              // Continue without profile data - not a critical error
            }
          }
        } else {
          // No artistId available, try fetching by name directly
          try {
            const profileRes = await axiosAuth.get(
              `/api/auth/artist/public/name/${encodeURIComponent(decodedArtist)}`
            );
            setArtistProfile({
              bio: profileRes.data.artist.bio,
              profilePicture: profileRes.data.artist.profilePicture,
              displayName: profileRes.data.artist.displayName,
              createdAt: profileRes.data.artist.createdAt,
            });
          } catch (profileErr) {
            console.log('Artist profile not available:', profileErr);
            // Continue without profile data - not a critical error
          }
        }
        
        // If no content found, set appropriate error
        if (artistMusics.length === 0 && artistPlaylists.length === 0) {
          setError(null); // Not an error, just no content
        }
      } catch (err) {
        if (!active) return;
        console.error('Error fetching artist data:', err);
        setError('Failed to load artist content. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchArtistData();
    
    return () => {
      active = false;
    };
  }, [decodedArtist]);

  useEffect(() => {
    if (!artistId) {
      setFollowersCount(null);
      return;
    }

    let active = true;

    (async () => {
      try {
        const res = await getFollowersCount(artistId);
        if (!active) return;
        const count = typeof res.data?.count === 'number' ? res.data.count : 0;
        setFollowersCount(count);
      } catch (err) {
        if (!active) return;
        console.error('Error fetching follower count:', err);
        setFollowersCount(null);
      }
    })();

    return () => {
      active = false;
    };
  }, [artistId]);

  useEffect(() => {
    if (!artistId || !user || userLoading) {
      setFollowStatusLoading(false);
      setIsFollowing(false);
      return;
    }

    let active = true;
    setFollowStatusLoading(true);

    (async () => {
      try {
        const res = await getFollowStatus(artistId);
        if (!active) return;
        setIsFollowing(Boolean(res.data?.isFollowing));
      } catch (err) {
        if (!active) return;
        console.error('Error fetching follow status:', err);
        setIsFollowing(false);
      } finally {
        if (active) setFollowStatusLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [artistId, user, userLoading]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTracks = musics.length;
    const totalPlaylists = playlists.length;
    
    // Calculate total plays across all tracks (if available)
    const totalPlays = musics.reduce((sum, m) => sum + (m.plays || 0), 0);
    
    // Find latest track
    const sortedMusics = [...musics].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    const latestTrack = sortedMusics[0];
    
    // Find first track (earliest release)
    const earliestTrack = sortedMusics[sortedMusics.length - 1];
    
    return {
      totalTracks,
      totalPlaylists,
      totalPlays,
      latestTrack,
      earliestTrack,
      joinedDate: earliestTrack?.createdAt
    };
  }, [musics, playlists]);

  // Sort tracks by date (newest first)
  const sortedTracks = useMemo(() => {
    return [...musics].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [musics]);

  // Check if we have any content to display
  const hasContent = musics.length > 0 || playlists.length > 0;

  // Tabs definition
  const tabs = useMemo(() => [
    {
      id: 'tracks',
      label: `Tracks (${stats.totalTracks})`,
      content: (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All Tracks</h2>
            <p className={styles.sectionSubtitle}>
              {stats.totalTracks} track{stats.totalTracks !== 1 ? 's' : ''} • Sorted by newest first
            </p>
          </div>
          <MusicTab musics={sortedTracks} reverse={false} />
        </section>
      )
    },
    {
      id: 'playlists',
      label: `Playlists (${stats.totalPlaylists})`,
      content: (
        <section className={styles.section}>
          {playlists.length === 0 ? (
            <EmptyState 
              icon="📋" 
              title="No playlists yet" 
              description={`${decodedArtist} hasn't created any playlists.`}
            />
          ) : (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Playlists</h2>
                <p className={styles.sectionSubtitle}>
                  {stats.totalPlaylists} playlist{stats.totalPlaylists !== 1 ? 's' : ''} created by {decodedArtist}
                </p>
              </div>
              <PlaylistTab playlists={playlists} />
            </>
          )}
        </section>
      )
    }
  ], [playlists, sortedTracks, stats.totalTracks, stats.totalPlaylists, decodedArtist]);

  const handleFollowToggle = async () => {
    if (!artistId || followBusy || followStatusLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isOwnProfile) {
      return;
    }

    try {
      setFollowBusy(true);
      if (isFollowing) {
        const res = await unfollowArtist(artistId);
        setIsFollowing(false);
        if (typeof res.data?.followers === 'number') {
          setFollowersCount(res.data.followers);
        } else {
          setFollowersCount((prev) => Math.max(0, (prev ?? 1) - 1));
        }
        toast.success(`Unfollowed ${decodedArtist}`);
      } else {
        const res = await followArtist(artistId, { artistName: decodedArtist });
        setIsFollowing(true);
        if (typeof res.data?.followers === 'number') {
          setFollowersCount(res.data.followers);
        } else {
          setFollowersCount((prev) => (prev ?? 0) + 1);
        }
        toast.success(`Now following ${decodedArtist}`);
      }
    } catch (err) {
      console.error('Error updating follow state:', err);
      const message = err?.response?.data?.message || 'Failed to update follow state. Please try again.';
      toast.error(message);
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <PageWrapper>
      <div className={styles.artistPage}>
        {/* Artist Header */}
        <header className={styles.header}>
          <div className={styles.topSection}>
            <button 
              onClick={() => navigate(-1)} 
              className={styles.backButton}
              aria-label="Go back"
            >
              ← Back
            </button>
            {artistId && (
              <div className={styles.followActions}>
                {followersCount !== null && (
                  <span className={styles.followCount}>
                    {followersCount.toLocaleString()} follower{followersCount === 1 ? '' : 's'}
                  </span>
                )}
                {isOwnProfile ? (
                  <span className={styles.followSelf}>This is you</span>
                ) : (
                  <button
                    type="button"
                    className={styles.followButton}
                    onClick={handleFollowToggle}
                    disabled={followStatusLoading || followBusy}
                  >
                    {followStatusLoading
                      ? 'Loading…'
                      : user
                        ? isFollowing
                          ? 'Following'
                          : 'Follow'
                        : 'Sign in to follow'}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className={styles.identity}>
            <div className={styles.avatar}>
              {artistProfile?.profilePicture ? (
                <img 
                  src={artistProfile.profilePicture} 
                  alt={decodedArtist}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarInitial}>
                  {decodedArtist.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={styles.artistInfo}>
              <div className={styles.badge}>Artist</div>
              <h1 className={styles.title}>{decodedArtist}</h1>
              {stats.joinedDate && (
                <p className={styles.subtitle}>
                  Active since {new Date(stats.joinedDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>
          {hasContent && (
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.totalTracks}</span>
                <span className={styles.statLabel}>Track{stats.totalTracks !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.totalPlaylists}</span>
                <span className={styles.statLabel}>Playlist{stats.totalPlaylists !== 1 ? 's' : ''}</span>
              </div>
              {stats.totalPlays > 0 && (
                <div className={styles.stat}>
                  <span className={styles.statValue}>{stats.totalPlays.toLocaleString()}</span>
                  <span className={styles.statLabel}>Total Plays</span>
                </div>
              )}
              {stats.latestTrack && (
                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {new Date(stats.latestTrack.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className={styles.statLabel}>Latest Release</span>
                </div>
              )}
            </div>
          )}
          {artistProfile?.bio && (
            <div className={styles.bioSection}>
              <h3 className={styles.bioTitle}>About</h3>
              <p className={styles.bioText}>{artistProfile.bio}</p>
            </div>
          )}
        </header>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader message="Loading artist content..." inline />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <EmptyState 
              icon="⚠️" 
              title="Something went wrong" 
              description={error}
            />
            <button 
              onClick={() => window.location.reload()} 
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        ) : !hasContent ? (
          <div className={styles.emptyContainer}>
            <EmptyState 
              icon="🎤" 
              title="No content found" 
              description={`${decodedArtist} hasn't released any tracks or playlists yet.`}
            />
          </div>
        ) : (
          <div className={styles.body}>
            <Tabs 
              tabs={tabs} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              defaultTab="tracks" 
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ArtistDetail;
