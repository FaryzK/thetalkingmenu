import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRestaurant,
  updateRestaurantInfo,
} from "../redux/slices/restaurantSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "flowbite-react";

export default function RestaurantInfo() {
  const { dashboardId, restaurantId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth();

  const restaurant = useSelector((state) => state.restaurant.data);
  const status = useSelector((state) => state.restaurant.status);

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLocation, setRestaurantLocation] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      try {
        const resultAction = await dispatch(
          fetchRestaurant({ token, restaurantId })
        );
        if (fetchRestaurant.fulfilled.match(resultAction)) {
          const fetchedRestaurant = resultAction.payload;
          setRestaurantName(fetchedRestaurant.name || "");
          setRestaurantLocation(fetchedRestaurant.location || "");
          setLogoUrl(fetchedRestaurant.logo || "");
        } else {
          setErrorMessage("Failed to fetch restaurant details.");
        }
      } catch {
        setErrorMessage("Failed to fetch restaurant details.");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !restaurant) {
        fetchData(user);
      } else if (restaurant) {
        setRestaurantName(restaurant.name || "");
        setRestaurantLocation(restaurant.location || "");
        setLogoUrl(restaurant.logo || "");
      }
    });

    return () => unsubscribe();
  }, [dispatch, restaurantId, restaurant]);

  const handleSaveChanges = async () => {
    const token = await auth.currentUser.getIdToken();
    const updatedData = {
      name: restaurantName,
      location: restaurantLocation,
      logo: logoUrl,
    };

    try {
      const resultAction = await dispatch(
        updateRestaurantInfo({ token, restaurantId, updatedData })
      );
      if (updateRestaurantInfo.fulfilled.match(resultAction)) {
        alert("Restaurant information updated successfully!");
      } else {
        setErrorMessage("Failed to update restaurant information.");
      }
    } catch (error) {
      setErrorMessage("Failed to update restaurant information.");
    }
  };

  return (
    <div className="m bg-gray-100 p-6">
      {/* Back Navigation */}
      <button
        onClick={() =>
          navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}`)
        }
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      {/* Main Content */}
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Configure Restaurant Information
        </h2>

        {errorMessage && (
          <p className="text-red-600 bg-red-100 p-3 rounded mb-4 text-center">
            {errorMessage}
          </p>
        )}

        {/* Form Fields */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Restaurant Name
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter restaurant name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Location
          </label>
          <input
            type="text"
            value={restaurantLocation}
            onChange={(e) => setRestaurantLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter restaurant location"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Logo URL
          </label>
          <input
            type="text"
            placeholder="Enter logo URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Restaurant Logo"
              className="mt-4 w-24 h-24 object-cover rounded-lg mx-auto shadow-md"
            />
          )}
        </div>

        {/* Save Changes Button */}
        <Button onClick={handleSaveChanges} color="blue" className="w-full ">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
