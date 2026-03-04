import { Navigate, Outlet } from 'react-router-dom';
import { GetAuthToken } from '../../utils/token';

export const PrivateRoute = () => {
  const isAuthenticated = !!GetAuthToken();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};