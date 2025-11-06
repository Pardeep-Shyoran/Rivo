import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/useUser';
import Loader from '../components/Loader/Loader';

const PublicRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <Loader />;
  }

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
