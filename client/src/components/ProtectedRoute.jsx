import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate, useParams } from "react-router-dom";
import { fetchUserAccessData } from "../redux/slices/userAccessSlice";

export default function ProtectedRoute({ allowedRoles }) {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false); // State to handle ongoing fetch
  const { currentUser } = useSelector((state) => state.user);
  const { accessibleDashboards, accessibleRestaurants } = useSelector(
    (state) => state.userAccess
  );
  const userRoles = currentUser?.roles || [];

  // Check if user has any of the allowed roles
  const hasRoleAccess =
    Array.isArray(allowedRoles) &&
    allowedRoles.some((allowedRole) =>
      userRoles.some((role) => role.toLowerCase() === allowedRole.toLowerCase())
    );

  // Check if user has access to the specified dashboard or restaurant
  const hasResourceAccess =
    (!dashboardId && !restaurantId) ||
    (dashboardId && accessibleDashboards.includes(dashboardId)) ||
    (restaurantId && accessibleRestaurants.includes(restaurantId));

  // Initial authorization check
  const isAuthorized = hasRoleAccess && hasResourceAccess;

  // Fetch authorization data if `isAuthorized` is `false`, user is signed in, and data might be outdated
  useEffect(() => {
    if (!isAuthorized && !isFetching && currentUser?.uid) {
      setIsFetching(true); // Avoid re-triggering fetch while fetching
      dispatch(fetchUserAccessData(currentUser.uid)).finally(() =>
        setIsFetching(false)
      );
    }
  }, [isAuthorized, isFetching, dispatch, currentUser]);

  // Recalculate authorization after fetching if it was previously unauthorized
  const recheckedAuthorization = hasRoleAccess && hasResourceAccess;

  // If still unauthorized after refetch, redirect to home
  return recheckedAuthorization ? <Outlet /> : <Navigate to="/" />;
}
