import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, role, children }) => {
  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
