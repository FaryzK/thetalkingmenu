import React, { useEffect, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDashboards,
  deleteDashboard,
} from "../../redux/slices/platformControlPanelDashboardsSlice";
import { debounce } from "lodash";
import { FiArrowLeft } from "react-icons/fi";

const DashboardManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // **Redux State Selectors**
  const { dashboards, status, error } = useSelector(
    (state) => state.platformControlPanelDashboards
  );

  // **Local State for Modal Handling**
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [filteredDashboards, setFilteredDashboards] = useState(dashboards);

  // **Fetch all dashboards on component mount**
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        dispatch(fetchAllDashboards({ token, page: 1, search: "" })); // fetch initial page 1
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [dispatch]);

  // **Update filtered dashboards whenever dashboards or searchQuery changes**
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredDashboards(dashboards); // Show all dashboards if no search
    } else {
      const filtered = dashboards.filter((dashboard) =>
        dashboard.dashboardOwnerEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredDashboards(filtered);
    }
  }, [dashboards, searchQuery]);

  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300), // Wait 300ms after user stops typing
    []
  );

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

      // **Dispatch Redux Action to Delete Dashboard**
      dispatch(deleteDashboard({ token, dashboardId: selectedDashboard._id }))
        .unwrap()
        .then(() => {
          closeModal();
        })
        .catch((err) => {
          setDeleteError(err || "Failed to delete dashboard.");
        });
    } catch (err) {
      setDeleteError("Failed to delete dashboard.");
    }
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/platform-control-panel`)}
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Admin
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        ALL DASHBOARDS
      </h1>

      {/* **Search Input** */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by owner's email"
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {filteredDashboards.length === 0 ? (
        <p className="text-center text-gray-600">No dashboards available.</p>
      ) : (
        <div className="space-y-4">
          {filteredDashboards.map((dashboard) => (
            <button
              key={dashboard._id}
              onClick={() => handleDashboardClick(dashboard._id)} // Click event for whole card
              className="bg-white p-4 rounded-lg shadow-md w-full text-left hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event from triggering parent onClick
                  openDeleteModal(dashboard);
                }}
                className="mt-4 text-red-500 underline"
              >
                Delete Dashboard
              </button>
            </button>
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
