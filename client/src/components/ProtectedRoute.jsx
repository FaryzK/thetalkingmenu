import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate, useParams } from "react-router-dom";
import { fetchUserAccessData } from "../redux/slices/userAccessSlice";

const POLLING_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

export default function ProtectedRoute({ allowedRoles }) {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);
  const lastFetched = useRef(0); // Persist last fetched timestamp across renders
  const intervalRef = useRef(null); // Reference for the interval
  const { currentUser } = useSelector((state) => state.user);
  const { accessibleDashboards, accessibleRestaurants } = useSelector(
    (state) => state.userAccess
  );
  const userRoles = currentUser?.roles || [];

  const hasRoleAccess =
    Array.isArray(allowedRoles) &&
    allowedRoles.some((allowedRole) =>
      userRoles.some((role) => role.toLowerCase() === allowedRole.toLowerCase())
    );

  const hasResourceAccess = (() => {
    if (dashboardId && !restaurantId) {
      return accessibleDashboards.includes(dashboardId);
    } else if (dashboardId && restaurantId) {
      return (
        accessibleDashboards.includes(dashboardId) &&
        accessibleRestaurants.includes(restaurantId)
      );
    }
    return true;
  })();

  const isAuthorized =
    userRoles.includes("the talking menu admin") ||
    (hasRoleAccess && hasResourceAccess);

  useEffect(() => {
    const poll = () => {
      const now = Date.now();
      console.log("Polling triggered. Current time:", now);
      console.log("isAuthorized:", isAuthorized);
      console.log("currentUser.uid:", currentUser?.uid);
      console.log("isFetching:", isFetching);
      console.log("Time since last fetch:", now - lastFetched.current);

      if (
        (!isAuthorized || now - lastFetched.current > POLLING_INTERVAL) &&
        currentUser?.uid &&
        !isFetching
      ) {
        console.log("Polling condition met. Fetching user access data...");
        setIsFetching(true);

        dispatch(fetchUserAccessData(currentUser.uid))
          .then(() => {
            lastFetched.current = Date.now();
            console.log(
              "Data fetched successfully. Updated lastFetched:",
              lastFetched.current
            );
          })
          .catch((error) => {
            console.error("Error while fetching user access data:", error);
          })
          .finally(() => {
            setIsFetching(false);
            console.log("Fetch process complete. isFetching set to false.");
          });
      } else {
        console.log("Polling condition not met. No fetch executed.");
      }
    };

    // Start the polling interval
    intervalRef.current = setInterval(poll, POLLING_INTERVAL);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isAuthorized, currentUser, dispatch, isFetching]);

  return isAuthorized ? <Outlet /> : <Navigate to="/" />;
}
