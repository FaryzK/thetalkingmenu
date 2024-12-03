import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DashboardManager = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  // Fetch all dashboards on component mount
  useEffect(() => {
    const auth = getAuth();

    const fetchDashboards = async (token) => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboards/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch dashboards");
        }
        const data = await response.json();
        setDashboards(data.dashboards);
      } catch (err) {
        setError("Failed to load dashboards.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        fetchDashboards(token);
      } else {
        setError("Authentication required.");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleDashboardClick = (dashboardId) => {
    navigate(`/dashboards/${dashboardId}`);
  };

  const openDeleteModal = (dashboard) => {
    setSelectedDashboard(dashboard);
    setModalVisible(true);
    setEmailInput("");
    setDeleteError(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDashboard(null);
    setEmailInput("");
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (emailInput !== selectedDashboard.dashboardOwnerEmail) {
      setDeleteError("Email does not match the dashboard owner's email.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await fetch(`/api/dashboards/${selectedDashboard._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete dashboard");
      }

      // Refresh the dashboard list after deletion
      setDashboards((prevDashboards) =>
        prevDashboards.filter((d) => d._id !== selectedDashboard._id)
      );
      closeModal();
    } catch (err) {
      setDeleteError("Failed to delete dashboard.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading dashboards...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className=" bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        ALL DASHBOARDS
      </h1>

      {dashboards.length === 0 ? (
        <p className="text-center text-gray-600">No dashboards available.</p>
      ) : (
        <div className="space-y-4">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard._id}
              className="bg-white p-4 rounded-lg shadow-md w-full text-left hover:bg-gray-200 transition"
            >
              <h2 className="text-xl font-semibold text-gray-700">
                Dashboard Owner: {dashboard.dashboardOwnerEmail}
              </h2>
              <ul className="mt-2 text-gray-500">
                {dashboard.restaurants.map((restaurant) => (
                  <li key={restaurant._id}>
                    {restaurant.name} - {restaurant.location}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openDeleteModal(dashboard)}
                className="mt-4 text-red-500 underline"
              >
                Delete Dashboard
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">
              Confirm Dashboard Deletion
            </h2>
            <p className="text-gray-600 mb-4">
              Type the dashboard owner's email (
              <span className="font-semibold">
                {selectedDashboard.dashboardOwnerEmail}
              </span>
              ) to confirm deletion.
            </p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
              placeholder="Enter email"
            />
            {deleteError && (
              <p className="text-red-500 text-sm mb-4">{deleteError}</p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardManager;
