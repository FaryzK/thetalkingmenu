import React from "react";

export default function MyRestaurants({ restaurants, onRestaurantClick }) {
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

      {restaurants?.length === 0 && (
        <div className="mt-6 text-center text-gray-500">
          <p>No restaurants added yet.</p>
          <p>Click "Add Restaurant" to get started!</p>
        </div>
      )}
    </div>
  );
}
