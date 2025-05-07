import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessToken = auth.getAccessToken();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await auth.getLoggedUser();
      setLoggedUser(user);
      setLoading(false);
    };

    fetchUser();
  }, [auth]);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <p>Cargando usuario...</p>;
  }

  return children;
};

export default ProtectedRoute;
