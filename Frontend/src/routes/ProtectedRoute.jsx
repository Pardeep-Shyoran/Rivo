import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/useUser';
import Loader from '../components/Loader/Loader';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
