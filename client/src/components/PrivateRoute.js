import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ user, role, children }) => {
  const location = useLocation();

  if (!user) {
    // Redirect to appropriate login based on route
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/agency/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // User is logged in but doesn't have the right role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
