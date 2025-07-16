import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  const checkUserLoggedIn = (data) => {
    if (!data?.userId) return "/unauthorized";
    if (data?.roles?.includes("Admin")) return "/dashboard/overview";
    if (data?.roles?.includes("Client")) return "/client";

    return "/unauthorized";
  };

  return auth?.roles?.find((role) => allowedRoles?.includes(role)) ? (
    <Outlet />
  ) : auth?.accessToken ? (
    <Navigate to={checkUserLoggedIn(auth)} state={{ from: location }} replace />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuth;
