import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const useAuthorization = (allowedRoles = [], fetchEntity) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboardId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const dashboards = useSelector((state) => state.dashboards.data);
  const dashboard = dashboards.find((d) => d._id === dashboardId);

  // Flags to control flow
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Check authentication status and fetch data if authenticated
    const checkAuthAndFetchData = () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdToken();
          console.log("User authenticated. Fetching data...");
          await dispatch(fetchEntity(token)); // Wait for dispatch to complete
          setIsDataFetched(true); // Set after data is fetched
        } else {
          console.log("User not authenticated. Redirecting to sign-in...");
          navigate("/sign-in"); // Redirect if not authenticated
        }
        setIsAuthChecked(true); // Confirm that auth status has been checked
      });
      return () => unsubscribe();
    };

    if (!isAuthChecked) {
      console.log("Authentication status not checked yet. Checking now...");
      checkAuthAndFetchData();
    }

    // Grant automatic access for "talking menu admin"
    if (currentUser?.roles?.includes("the talking menu admin")) {
      console.log("User is a 'talking menu admin' and has automatic access.");
      return;
    }

    // Redirect if data fetch completed but no dashboard was found
    if (
      isAuthChecked &&
      isDataFetched &&
      !dashboard &&
      dashboards.length === 0
    ) {
      console.log("No dashboard found for this user.");
      alert("You do not have access to this dashboard or no dashboard exists.");
      navigate("/"); // Redirect to home
      return;
    }

    // Check authorization after both auth and data fetching are confirmed
    if (isAuthChecked && isDataFetched && dashboard && currentUser) {
      console.log("Checking authorization...");
      console.log("Current User:", currentUser);
      console.log("Dashboard:", dashboard);
      console.log("Allowed Roles:", allowedRoles);

      const isAuthorized =
        allowedRoles.some((role) => currentUser.roles?.includes(role)) ||
        currentUser.uid === dashboard.dashboardOwnerId ||
        dashboard.restaurantAdmins.includes(currentUser.uid);

      if (!isAuthorized) {
        console.log("User is not authorized. Redirecting to home page.");
        alert("You are not authorized to view this dashboard.");
        navigate("/");
      } else {
        console.log("User is authorized to access this dashboard.");
      }
    } else {
      console.log("Waiting for authentication and data fetch to complete...");
      console.log("isAuthChecked:", isAuthChecked);
      console.log("isDataFetched:", isDataFetched);
      console.log("Dashboard:", dashboard);
      console.log("Current User:", currentUser);
    }
  }, [
    dashboard,
    allowedRoles,
    currentUser,
    dispatch,
    fetchEntity,
    navigate,
    isAuthChecked,
    isDataFetched,
    dashboards,
  ]);
};

export default useAuthorization;
