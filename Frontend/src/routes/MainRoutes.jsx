import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import PageNotFound from '../pages/PageNotFound/PageNotFound'

const MainRoutes = () => {
  return (
    <>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    </>
  )
}

export default MainRoutes