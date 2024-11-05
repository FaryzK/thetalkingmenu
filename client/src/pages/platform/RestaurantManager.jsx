import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchAllRestaurants,
  deleteRestaurant,
} from "../../redux/slices/platformControlPanelRestaurantsSlice";

export default function RestaurantManager() {
  const dispatch = useDispatch();

  // Access the platformControlPanelRestaurants state
  const { allRestaurants: restaurants, status } = useSelector(
    (state) => state.platformControlPanelRestaurants
  );

  useEffect(() => {
    const auth = getAuth();

    // Fetch restaurants only if authenticated
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchAllRestaurants(token));
    };

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [dispatch]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "failed") return <p>Error loading restaurants</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Restaurant Management
      </h1>
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant._id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-lg font-semibold">
              {restaurant.name} ({restaurant.ownerEmail})
            </h2>
            <p className="text-gray-500">{restaurant.location}</p>
            <button
              className="mt-2 text-red-500"
              onClick={async () => {
                const user = getAuth().currentUser;
                if (user) {
                  const token = await user.getIdToken();
                  dispatch(
                    deleteRestaurant({ token, restaurantId: restaurant._id })
                  );
                }
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
