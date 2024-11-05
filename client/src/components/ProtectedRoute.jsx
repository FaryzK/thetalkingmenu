import React from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate, useParams } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const { dashboardId, restaurantId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const userRoles = currentUser?.roles || [];

  // Access accessible dashboards and restaurants from userAccessSlice
  const accessibleDashboards =
    useSelector((state) => state.userAccess.accessibleDashboards) || [];
  const accessibleRestaurants =
    useSelector((state) => state.userAccess.accessibleRestaurants) || [];

  // Check if the user has any of the allowed roles (case-insensitive)
  const hasRoleAccess =
    Array.isArray(allowedRoles) &&
    allowedRoles.some((allowedRole) =>
      userRoles.some((role) => role.toLowerCase() === allowedRole.toLowerCase())
    );

  // Check if the user has access to the specific dashboard or restaurant if applicable
  const hasResourceAccess =
    (!dashboardId && !restaurantId) || // No specific resource required
    (dashboardId && accessibleDashboards.includes(dashboardId)) ||
    (restaurantId && accessibleRestaurants.includes(restaurantId));

  // User has access if they have the right role or resource access
  const isAuthorized = hasRoleAccess && hasResourceAccess;

  return isAuthorized ? <Outlet /> : <Navigate to="/" />;
}
