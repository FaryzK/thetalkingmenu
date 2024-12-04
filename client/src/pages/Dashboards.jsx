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
import { Spinner, Button } from "flowbite-react";

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

  const DashboardCard = ({ dashboard }) => (
    <button
      key={dashboard._id}
      onClick={() => handleDashboardClick(dashboard._id)}
      aria-label={`Navigate to dashboard owned by ${dashboard.dashboardOwnerEmail}`}
      className="bg-white p-4 rounded-lg shadow-md w-full text-left hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
    >
      <h2 className="text-lg md:text-xl font-semibold text-gray-700">
        {dashboard.dashboardOwnerEmail}
      </h2>
      <p className="text-sm md:text-base text-gray-500">
        Your Role: {capitalizeFirstLetter(dashboard.role || "")}
      </p>
    </button>
  );

  const EmptyState = () => (
    <div className="text-center text-gray-500">
      <p>No dashboards available.</p>
      <p>Create a new dashboard to get started!</p>
    </div>
  );

  return (
    <div className="bg-gray-100 p-4 md:p-6 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
        MY DASHBOARDS
      </h1>

      {status === "loading" && (
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {status === "failed" && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          Error: {error}
        </div>
      )}

      {dashboards.length > 0 ? (
        <div className="w-full max-w-md space-y-4">
          {dashboards.map((dashboard) => (
            <DashboardCard dashboard={dashboard} key={dashboard._id} />
          ))}
        </div>
      ) : (
        status === "succeeded" && <EmptyState />
      )}

      <div className="w-full max-w-md mt-6">
        <button
          onClick={handleCreateDashboard}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Dashboard
        </button>
      </div>
    </div>
  );
}
