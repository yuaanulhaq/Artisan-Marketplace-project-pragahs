import { Navigate, useLocation } from "react-router-dom";

import LoadingState from "./LoadingState";
import { useAuth } from "../store/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

