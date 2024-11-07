import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate, useParams } from "react-router-dom";
import { fetchUserAccessData } from "../redux/slices/userAccessSlice";

export default function ProtectedRoute({ allowedRoles }) {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(true); // Initial fetching state
  const [isAuthorized, setIsAuthorized] = useState(false); // Authorization state

  const { currentUser } = useSelector((state) => state.user);
  const { accessibleDashboards, accessibleRestaurants } = useSelector(
    (state) => state.userAccess
  );
  const userRoles = currentUser?.roles || [];

  // Check if the user has the necessary role access
  const hasRoleAccess =
    Array.isArray(allowedRoles) &&
    allowedRoles.some((allowedRole) =>
      userRoles.some((role) => role.toLowerCase() === allowedRole.toLowerCase())
    );

  // Function to update authorization based on fetched data
  const updateAuthorization = () => {
    const hasResourceAccess =
      (!dashboardId && !restaurantId) ||
      (dashboardId && accessibleDashboards.includes(dashboardId)) ||
      (restaurantId && accessibleRestaurants.includes(restaurantId));

    setIsAuthorized(hasRoleAccess && hasResourceAccess);
  };

  // Fetch user access data each time this component mounts or currentUser changes
  useEffect(() => {
    if (currentUser?.uid) {
      setIsFetching(true);
      dispatch(fetchUserAccessData(currentUser.uid))
        .then(() => {
          updateAuthorization();
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [dispatch, currentUser, hasRoleAccess, dashboardId, restaurantId]);

  // Display loading indicator while fetching data
  if (isFetching) return <div>Loading...</div>;

  // Redirect if authorization is not granted, otherwise render the protected content
  return isAuthorized ? <Outlet /> : <Navigate to="/" />;
}
