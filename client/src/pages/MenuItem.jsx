import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../redux/slices/menuSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "flowbite-react";

export default function MenuItem() {
  const { dashboardId, restaurantId, itemId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth();

  // Selectors and local state
  const status = useSelector((state) => state.menu.status);
  const item = useSelector((state) =>
    state.menu.data?.menuItems.find((menuItem) => menuItem._id === itemId)
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  // Fetch item data on mount or when missing in Redux store
  useEffect(() => {
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      try {
        const resultAction = await dispatch(
          fetchMenuItem({ token, restaurantId, itemId })
        );
        if (fetchMenuItem.fulfilled.match(resultAction)) {
          const fetchedItem = resultAction.payload;
          setName(fetchedItem.name || "");
          setDescription(fetchedItem.description || "");
          setPrice(fetchedItem.price || "");
        } else {
          setError("Failed to fetch menu item details.");
        }
      } catch {
        setError("Failed to fetch menu item details.");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !item) {
        fetchData(user);
      } else if (item) {
        setName(item.name || "");
        setDescription(item.description || "");
        setPrice(item.price || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      price === null || // Check for null
      price === undefined || // Check for undefined
      parseFloat(price) < 0 // Price cannot be negative
    ) {
      setError("All fields are required and price must be greater than 0.");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const updatedItem = { name, description, price: parseFloat(price) };

      await dispatch(
        updateMenuItem({ token, restaurantId, itemId, updatedItem })
      ).unwrap();

      navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}/menu`);
    } catch {
      setError("Failed to update the menu item. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await dispatch(deleteMenuItem({ token, restaurantId, itemId })).unwrap();
      navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}/menu`);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      setError("Failed to delete the menu item. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Menu
      </button>

      <h2 className="text-2xl font-bold mb-4">Edit Menu Item</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="max-w-lg text-left mb-4 space-y-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded w-2/3"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 border rounded w-1/3"
          />
        </div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded w-full h-24"
        />
        <div className="flex space-x-4">
          <Button
            onClick={handleDelete}
            color="red"
            disabled={status === "loading"}
            className="flex-grow"
          >
            {status === "loading" ? "Deleting..." : "Delete Item"}
          </Button>

          <Button
            onClick={handleUpdate}
            color="blue"
            disabled={status === "loading"}
            className={`flex-grow ${
              status === "loading" ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {status === "loading" ? "Updating..." : "Update Item"}
          </Button>
        </div>
      </div>
    </div>
  );
}
