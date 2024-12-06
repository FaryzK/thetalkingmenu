import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchDashboards,
  createDashboard,
  clearDashboardsState,
} from "../redux/slices/dashboardsSlice";
import { fetchUserAccessData } from "../redux/slices/userAccessSlice";
import { useNavigate } from "react-router-dom";
import { Spinner, Button } from "flowbite-react";

const EmptyState = () => (
  <div className="mt-8 w-full max-w-lg mx-auto">
    <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">No Dashboard Yet?</h2>
      <p className="text-gray-600">
        We’re building something amazing. Dashboards are currently created upon
        request as part of our prototyping phase.
      </p>
      <p className="text-gray-600">
        Fill out the form below, and we’ll help you get started with a custom
        dashboard tailored to your needs.
      </p>

      <Button
        color="blue"
        className="w-full mt-6"
        onClick={() =>
          window.open("https://forms.gle/zZEqaupHhgs4yBVc7", "_blank")
        }
      >
        Join the Waiting List
      </Button>

      {/* <iframe
        src="https://forms.gle/zZEqaupHhgs4yBVc7"
        width="100%"
        height="600"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
        title="Dashboard Request Form"
      >
        Loading…
      </iframe> */}
    </div>
  </div>
);

export default function Dashboards() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dashboards = useSelector((state) => state.dashboards.data);
  const status = useSelector((state) => state.dashboards.status);
  let error = useSelector((state) => state.dashboards.error);
  const { currentUser } = useSelector((state) => state.user);

  // Convert error to string if it’s an object
  if (typeof error === "object") {
    error = JSON.stringify(error);
  }

  useEffect(() => {
    const auth = getAuth();

    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchDashboards(token));
      dispatch(fetchUserAccessData(user.uid));
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
        Your Role:{" "}
        {dashboard.role
          ? dashboard.role.charAt(0).toUpperCase() + dashboard.role.slice(1)
          : ""}
      </p>
    </button>
  );

  return (
    <div className="bg-gray-100 p-4 md:p-6 min-h-screen flex flex-col items-center">
      {status === "loading" && (
        <div className="flex justify-center mt-10">
          <Spinner size="lg" />
        </div>
      )}
      {status === "failed" && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          Error: {error}
        </div>
      )}

      {dashboards.length > 0 ? (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
            MY DASHBOARDS
          </h1>
          <div className="w-full max-w-md space-y-4">
            {dashboards.map((dashboard) => (
              <DashboardCard dashboard={dashboard} key={dashboard._id} />
            ))}
          </div>
          {/* <div className="w-full max-w-md mt-6">
            <Button
              onClick={handleCreateDashboard}
              color="blue"
              className="w-full"
            >
              Create Dashboard
            </Button>
          </div> */}
        </>
      ) : (
        status === "succeeded" && <EmptyState />
      )}
    </div>
  );
}
