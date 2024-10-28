import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRestaurant,
  clearRestaurantState,
} from "../redux/slices/restaurantSlice"; // Update the import
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Restaurant() {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Select restaurant data from Redux store
  const {
    data: restaurant,
    status,
    error,
  } = useSelector((state) => state.restaurant);

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchRestaurant({ token, restaurantId }));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        dispatch(clearRestaurantState());
      }
    });

    return () => unsubscribe();
  }, [dispatch, restaurantId]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "failed") return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data available.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Restaurant Info Container */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-500">{restaurant.location}</p>
      </div>

      {/* Configure Container */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold">CONFIGURE</h2>
        <div className="mt-2 space-y-2">
          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Share AI Chat
          </button>
          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Update Prefilled Questions
          </button>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={() =>
              navigate(
                `/dashboard/${dashboardId}/restaurant/${restaurantId}/menu`
              )
            }
          >
            Update Menu
          </button>

          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Update Prompt
          </button>
          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Manage Employee Access
          </button>
        </div>
      </div>

      {/* Performance Container */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold">PERFORMANCE</h2>
        <div className="mt-4">
          {/* Placeholder for the graph */}
          <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              [Placeholder Graph for Chats by Month]
            </p>
          </div>
        </div>
      </div>

      {/* Latest Chats Container */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">LATEST CHATS</h2>
          <button
            onClick={() => navigate(`/restaurant/${restaurantId}/chats`)}
            className="text-blue-500 underline"
          >
            See All
          </button>
        </div>
        <div className="space-y-2">
          {restaurant.chats?.map((chat) => (
            <button
              key={chat._id}
              onClick={() =>
                navigate(`/restaurant/${restaurantId}/chat/${chat._id}`)
              }
              className="w-full bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition text-left"
            >
              <h3 className="text-lg font-semibold">{chat.title}</h3>
              <p className="text-gray-500">
                {restaurant.name} • {restaurant.location}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
