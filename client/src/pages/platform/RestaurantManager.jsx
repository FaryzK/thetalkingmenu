import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchAllRestaurants,
  deleteRestaurant,
  transferRestaurantOwnership,
} from "../../redux/slices/platformControlPanelRestaurantsSlice";
import { Modal, Button, TextInput, Alert } from "flowbite-react";

export default function RestaurantManager() {
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Track error state
  const [successMessage, setSuccessMessage] = useState(""); // Track success state
  const [searchQuery, setSearchQuery] = useState(""); // Search input

  const { allRestaurants: restaurants, status } = useSelector(
    (state) => state.platformControlPanelRestaurants
  );

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchAllRestaurants(token));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchData(user);
    });

    return () => unsubscribe();
  }, [dispatch]);

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

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Restaurant Management
      </h1>

      {/* Search Input */}
      <TextInput
        type="text"
        placeholder="Search by restaurant name or owner email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

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

      <div className="space-y-4">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant._id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-lg font-semibold">
              {restaurant.name} ({restaurant.ownerEmail})
            </h2>
            <p className="text-gray-500">{restaurant.location}</p>
            <div className="mt-2 space-x-4">
              <button
                className="text-red-500"
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  setIsDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
              <button
                className="text-blue-500"
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  setIsTransferModalOpen(true);
                }}
              >
                Transfer Ownership
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      <Modal
        show={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Modal.Header>Confirm Delete</Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the restaurant{" "}
          <strong>{selectedRestaurant?.name}</strong>? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button color="red" onClick={handleDeleteRestaurant}>
            Confirm
          </Button>
          <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Transfer Ownership Modal */}
      <Modal
        show={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      >
        <Modal.Header>Transfer Ownership</Modal.Header>
        <Modal.Body>
          <TextInput
            type="email"
            placeholder="Enter new owner's email"
            value={newOwnerEmail}
            onChange={(e) => setNewOwnerEmail(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleOwnershipTransfer}>Confirm</Button>
          <Button color="gray" onClick={() => setIsTransferModalOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
