import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import PageNotFound from '../pages/PageNotFound/PageNotFound'
import ArtistDashboard from '../pages/Artist/ArtistDashboard/ArtistDashboard'
import UploadMusic from '../pages/Artist/UploadMusic/UploadMusic'
import CreatePlaylist from '../pages/Artist/CreatePlaylist/CreatePlaylist'

const MainRoutes = () => {
  return (
    <>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/artist/dashboard" element={<ArtistDashboard />} />
            <Route path="/artist/upload" element={<UploadMusic />} />
            <Route path="/artist/create-playlist" element={<CreatePlaylist />} />


            <Route path="*" element={<PageNotFound />} />
        </Routes>
    </>
  )
}

export default MainRoutes