import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { addMenuItem } from "../redux/slices/menuSlice";
import { getAuth } from "firebase/auth";

export default function MenuAddItem() {
  const { restaurantId, dashboardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  // Get the current status from Redux
  const status = useSelector((state) => state.menu.status);
  const apiError = useSelector((state) => state.menu.error);

  const handleAdd = async () => {
    // Validation for required fields
    if (!name || !description || !price) {
      setError("Please fill in all fields: Name, Description, and Price.");
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }

    try {
      setError(""); // Clear previous errors
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const newItem = { name, description, price: parseFloat(price) };

      // Wait for the action to complete
      const resultAction = await dispatch(
        addMenuItem({ token, restaurantId, newItem })
      ).unwrap();

      // Only navigate if the action was successful
      if (resultAction) {
        navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}/menu`);
      }
    } catch (err) {
      console.error("Failed to add menu item:", err);
      setError("Failed to add menu item. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>
      {(error || apiError) && (
        <div className="text-red-500 mb-4">{error || apiError}</div>
      )}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />

      <button
        onClick={handleAdd}
        disabled={status === "loading"}
        className={`px-4 py-2 bg-green-500 text-white rounded mt-4 ${
          status === "loading" ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {status === "loading" ? "Adding..." : "Add Item"}
      </button>
    </div>
  );
}
