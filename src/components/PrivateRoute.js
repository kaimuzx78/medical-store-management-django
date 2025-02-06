import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('accessToken');
  const location = useLocation();

  useEffect(() => {
    // Disable browser back button
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 