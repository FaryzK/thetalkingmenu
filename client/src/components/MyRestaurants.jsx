// src/components/MyRestaurants.js
import React, { useState } from "react";
import { Button } from "flowbite-react";

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
    <div>
      {/* Restaurant List */}
      {restaurants?.length > 0 && (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant._id}
              onClick={() => onRestaurantClick(restaurant._id)}
              className="w-full bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
            >
              <h3 className="text-lg font-semibold text-gray-700">
                {restaurant.name}
              </h3>
              <p className="text-sm text-gray-500">{restaurant.location}</p>
            </button>
          ))}
        </div>
      )}

      {/* Add Restaurant Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={() => setShowRestaurantForm(!showRestaurantForm)}
          color="blue"
        >
          Add Restaurant
        </Button>
      </div>

      {/* Add Restaurant Form */}
      {showRestaurantForm && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="Restaurant Name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />
          <input
            type="text"
            placeholder="Restaurant Location"
            value={restaurantLocation}
            onChange={(e) => setRestaurantLocation(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />
          <div className="flex justify-end">
            <Button color="green" onClick={handleAddRestaurant}>
              Save Restaurant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
