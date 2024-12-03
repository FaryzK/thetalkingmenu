import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchDashboards,
  createDashboard,
  clearDashboardsState,
} from "../redux/slices/dashboardsSlice";
import { fetchUserAccessData } from "../redux/slices/userAccessSlice"; // Import access data fetch
import { useNavigate } from "react-router-dom";

export default function Dashboards() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access dashboards and status from Redux store
  const dashboards = useSelector((state) => state.dashboards.data);
  const status = useSelector((state) => state.dashboards.status);
  let error = useSelector((state) => state.dashboards.error);
  const { currentUser } = useSelector((state) => state.user);

  // Convert error to string if it’s an object
  if (typeof error === "object") {
    error = JSON.stringify(error);
  }

  // Helper function to capitalize the first letter of each word
  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch dashboards and access data when the component mounts
  useEffect(() => {
    const auth = getAuth();

    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchDashboards(token));
      dispatch(fetchUserAccessData(user.uid)); // Fetch user access
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        dispatch(clearDashboardsState());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleCreateDashboard = async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      alert("No user is logged in");
      return;
    }

    const token = await firebaseUser.getIdToken();
    dispatch(createDashboard(token));
  };

  const handleDashboardClick = (dashboardId) => {
    navigate(`/dashboards/${dashboardId}`);
  };

  return (
    <div className="bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        MY DASHBOARDS
      </h1>

      {status === "loading" && <p>Loading dashboards...</p>}
      {status === "failed" && <p>Error: {error}</p>}

      {dashboards.map((dashboard) => (
        <button
          key={dashboard._id}
          onClick={() => handleDashboardClick(dashboard._id)}
          className="bg-white p-4 rounded-lg shadow-md w-full text-left mb-4 hover:bg-gray-200 transition"
        >
          <h2 className="text-xl font-semibold text-gray-700">
            {dashboard.dashboardOwnerEmail}
          </h2>
          <p className="text-gray-500">
            Your Role: {capitalizeFirstLetter(dashboard.role || "")}
          </p>
        </button>
      ))}

      <button
        onClick={handleCreateDashboard}
        className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg"
      >
        Create Dashboard
      </button>
    </div>
  );
}
