import { Navigate } from 'react-router-dom';

const HomeRedirect = () => {
  const token = localStorage.getItem('accessToken');
  return token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

export default HomeRedirect;
