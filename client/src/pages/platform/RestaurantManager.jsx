import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchAllRestaurants,
  deleteRestaurant,
  transferRestaurantOwnership,
  createRestaurant,
} from "../../redux/slices/platformControlPanelRestaurantsSlice";
import { Modal, Button, TextInput, Alert } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { FiArrowLeft } from "react-icons/fi";

export default function RestaurantManager() {
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isRestaurantFormVisible, setIsRestaurantFormVisible] = useState(false); // For Add Restaurant form
  const [restaurantName, setRestaurantName] = useState(""); // Restaurant name input
  const [restaurantLocation, setRestaurantLocation] = useState(""); // Restaurant location input
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [confirmationInput, setConfirmationInput] = useState(""); // Track user input for confirmation
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Track error state
  const [successMessage, setSuccessMessage] = useState(""); // Track success state
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const { allRestaurants, totalPages, currentPage, status } = useSelector(
    (state) => state.platformControlPanelRestaurants
  );

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchAllRestaurants({ token, page, search: searchQuery }));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchData(user);
    });

    return () => unsubscribe();
  }, [dispatch, page, searchQuery]);

  // Debounced search
  const handleSearchChange = debounce((query) => {
    setPage(1); // Reset to page 1 when search is performed
    setSearchQuery(query);
  }, 300);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDeleteRestaurant = async () => {
    setErrorMessage("");
    const user = getAuth().currentUser;
    if (user && selectedRestaurant) {
      const token = await user.getIdToken();
      try {
        await dispatch(
          deleteRestaurant({ token, restaurantId: selectedRestaurant._id })
        ).unwrap();
        setSuccessMessage("Restaurant deleted successfully.");
        setIsDeleteModalOpen(false);
        setSelectedRestaurant(null);
      } catch (error) {
        setErrorMessage(error.message || "Failed to delete restaurant.");
      }
    }
  };

  const handleOwnershipTransfer = async () => {
    setErrorMessage(""); // Clear any previous errors
    if (!newOwnerEmail) {
      setErrorMessage("Please enter a valid email");
      return;
    }

    const user = getAuth().currentUser;
    if (user && selectedRestaurant) {
      const token = await user.getIdToken();

      try {
        await dispatch(
          transferRestaurantOwnership({
            token,
            restaurantId: selectedRestaurant._id,
            newOwnerEmail,
          })
        ).unwrap(); // Unwrap to directly handle success or failure
        setSuccessMessage("Ownership transferred successfully.");
        setIsTransferModalOpen(false);
        setNewOwnerEmail("");
        setSelectedRestaurant(null);
      } catch (error) {
        setErrorMessage(error.message || "Failed to transfer ownership.");
      }
    }
  };

  // 🔥 Add new restaurant function
  const handleAddRestaurant = async () => {
    const user = getAuth().currentUser;

    if (!user) {
      alert("No user is logged in");
      return;
    }

    try {
      const token = await user.getIdToken();
      const restaurantData = {
        name: restaurantName,
        location: restaurantLocation,
      };

      await dispatch(createRestaurant({ token, restaurantData })).unwrap();

      setSuccessMessage("Restaurant added successfully.");
      setIsRestaurantFormVisible(false);
      setRestaurantName("");
      setRestaurantLocation("");
    } catch (error) {
      setErrorMessage(error.message || "Failed to add restaurant.");
    }
  };

  return (
    <div className="bg-gray-100 p-6 ">
      <button
        onClick={() => navigate(`/platform-control-panel`)}
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Admin
      </button>
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Restaurant Management
        </h1>

        {/* Search Bar with Add Restaurant Button */}
        <div className="flex items-center mb-6 space-x-4">
          <TextInput
            type="text"
            placeholder="Search by restaurant name or location"
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => setIsRestaurantFormVisible(!isRestaurantFormVisible)}
            color="blue"
          >
            Add
          </Button>
        </div>

        {/* Add Restaurant Form */}
        {isRestaurantFormVisible && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Add New Restaurant</h2>
            <TextInput
              placeholder="Restaurant Name"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="mb-4"
            />
            <TextInput
              placeholder="Restaurant Location"
              value={restaurantLocation}
              onChange={(e) => setRestaurantLocation(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddRestaurant} color="green">
                Save Restaurant
              </Button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert
            color="green"
            onDismiss={() => setSuccessMessage("")}
            className="mb-4"
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <Alert
            color="red"
            onDismiss={() => setErrorMessage("")}
            className="mb-4"
          >
            {errorMessage}
          </Alert>
        )}

        {/* Restaurant List */}
        <div className="space-y-4">
          {allRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-700">
                {restaurant.name} ({restaurant.ownerEmail})
              </h2>
              <p className="text-gray-500">{restaurant.location}</p>

              {/* Management Buttons */}
              <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-center">
                {/* Left Section for Management Actions */}
                <div className="space-x-4 mb-4 md:mb-0">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      navigate(
                        `/dashboards/${restaurant.dashboardId}/restaurant/${restaurant._id}`
                      );
                    }}
                  >
                    View Restaurant
                  </button>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      navigate(
                        `/${restaurant.dashboardId}/${restaurant._id}/chat-manager`
                      );
                    }}
                  >
                    Manage Chats
                  </button>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setIsTransferModalOpen(true);
                    }}
                  >
                    Transfer Ownership
                  </button>
                </div>

                {/* Right Section for Delete Button */}
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={pageNum === currentPage}
                color={pageNum === currentPage ? "info" : "light"}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        show={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setConfirmationInput(""); // 🆕 Reset input when modal closes
        }}
      >
        <Modal.Header>Confirm Delete</Modal.Header>
        <Modal.Body>
          <p className="mb-4">
            To delete this restaurant, please type the restaurant name:{" "}
            <strong>{selectedRestaurant?.name}</strong>
          </p>
          <TextInput
            type="text"
            placeholder="Type restaurant name here"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="mb-4"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="red"
            onClick={handleDeleteRestaurant}
            disabled={confirmationInput !== selectedRestaurant?.name} // 🆕 Button is disabled until input matches
          >
            Confirm
          </Button>
          <Button
            color="gray"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setConfirmationInput(""); // 🆕 Reset input when canceling
            }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {isTransferModalOpen && (
        <Modal
          show={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
        >
          <Modal.Header>Transfer Ownership</Modal.Header>
          <Modal.Body>
            <p className="mb-4">
              Enter the email of the new owner for{" "}
              <strong>{selectedRestaurant?.name}</strong>:
            </p>
            <TextInput
              type="email"
              placeholder="New owner's email"
              value={newOwnerEmail}
              onChange={(e) => setNewOwnerEmail(e.target.value)}
              className="mb-4"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleOwnershipTransfer} color="green">
              Confirm
            </Button>
            <Button color="gray" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
