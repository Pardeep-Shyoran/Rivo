import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Features from '../pages/Features/Features'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Search from '../pages/Search/Search'
import PageNotFound from '../pages/PageNotFound/PageNotFound'
import ArtistDashboard from '../pages/Artist/ArtistDashboard/ArtistDashboard'
import UploadMusic from '../pages/Artist/UploadMusic/UploadMusic'
import CreatePlaylist from '../pages/Artist/CreatePlaylist/CreatePlaylist'
import ListenerCreatePlaylist from '../pages/Listener/CreatePlaylist/CreatePlaylist'
import PlaylistDetail from '../pages/Playlist/PlaylistDetail'
import ArtistDetail from '../pages/Artist/ArtistDetail/ArtistDetail'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import { useUser } from '../contexts/useUser'
import Loader from '../components/Loader/Loader'
import ListenerDashboard from '../pages/Listener/DashBoard/DashBoard'
import MyPlaylists from '../pages/Listener/MyPlaylists/MyPlaylists'

const RootRoute = () => {
  const { user, loading } = useUser();

  if (loading) {
    return <Loader />;
  }

  // If user is logged in, show Home, otherwise show Features
  return user ? <Home /> : <Features />;
};

const MainRoutes = () => {
  return (
    <>
        <Routes>
            {/* Root route - shows Home if logged in, Features if not */}
            <Route path="/" element={<RootRoute />} />
            
            {/* Public routes - redirect to home if already logged in */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Search route - accessible to all authenticated users */}
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } 
            />

            {/* Protected routes - only accessible to artists */}
            <Route 
              path="/artist/dashboard" 
              element={
                <ProtectedRoute requiredRole="artist">
                  <ArtistDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/artist/upload" 
              element={
                <ProtectedRoute requiredRole="artist">
                  <UploadMusic />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/artist/create-playlist" 
              element={
                <ProtectedRoute requiredRole="artist">
                  <CreatePlaylist />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/listener/create-playlist" 
              element={
                <ProtectedRoute>
                  <ListenerCreatePlaylist />
                </ProtectedRoute>
              }
            />

            {/* Listener route - accessible to all authenticated users */}
            <Route 
              path="/listener/dashboard" 
              element={
                <ProtectedRoute>
                  <ListenerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/listener/playlists" 
              element={
                <ProtectedRoute>
                  <MyPlaylists />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/playlist/:playlistId" 
              element={
                <ProtectedRoute>
                  <PlaylistDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/artists/:artistName" 
              element={
                <ProtectedRoute>
                  <ArtistDetail />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    </>
  )
}

export default MainRoutes