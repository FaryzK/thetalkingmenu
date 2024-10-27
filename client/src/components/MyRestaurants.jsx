// src/components/MyRestaurants.js
import React, { useState } from "react";

export default function MyRestaurants({
  restaurants,
  onRestaurantClick,
  onAddRestaurant,
}) {
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLocation, setRestaurantLocation] = useState("");

  const handleAddRestaurant = () => {
    onAddRestaurant({ name: restaurantName, location: restaurantLocation });
    setShowRestaurantForm(false);
    setRestaurantName("");
    setRestaurantLocation("");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-semibold">MY RESTAURANTS</h2>
      {restaurants?.map((restaurant) => (
        <button
          key={restaurant._id}
          onClick={() => onRestaurantClick(restaurant._id)}
          className="w-full bg-gray-100 p-4 mt-2 rounded-lg shadow hover:bg-gray-200 transition"
        >
          <h3 className="text-lg font-semibold text-gray-700">
            {restaurant.name}
          </h3>
          <p className="text-gray-500">{restaurant.location}</p>
        </button>
      ))}

      {/* Button to toggle restaurant form */}
      <button
        onClick={() => setShowRestaurantForm(!showRestaurantForm)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Restaurant
      </button>

      {/* Form to add a new restaurant */}
      {showRestaurantForm && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Restaurant Name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Restaurant Location"
            value={restaurantLocation}
            onChange={(e) => setRestaurantLocation(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleAddRestaurant}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save Restaurant
          </button>
        </div>
      )}
    </div>
  );
}
