import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRestaurant,
  clearRestaurantState,
} from "../redux/slices/restaurantSlice";
import { fetchChatBot, clearChatBotState } from "../redux/slices/chatBotSlice";
import {
  fetchRestaurantChats,
  clearRestaurantChatsState,
} from "../redux/slices/restaurantChatsSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Restaurant() {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors for restaurant, chatBot, and chats data from Redux store
  const {
    data: restaurant,
    status: restaurantStatus,
    error: restaurantError,
  } = useSelector((state) => state.restaurant);
  const {
    data: chatBot,
    status: chatBotStatus,
    error: chatBotError,
  } = useSelector((state) => state.chatBot);
  const {
    data: restaurantChats,
    status: chatsStatus,
    error: chatsError,
  } = useSelector((state) => state.restaurantChats);

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchRestaurant({ token, restaurantId }));
      dispatch(fetchChatBot({ token, restaurantId }));
      dispatch(fetchRestaurantChats({ token, restaurantId }));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        dispatch(clearRestaurantState());
        dispatch(clearChatBotState());
        dispatch(clearRestaurantChatsState());
      }
    });

    return () => unsubscribe();
  }, [dispatch, restaurantId]);

  if (restaurantStatus === "loading" || chatBotStatus === "loading")
    return <div>Loading...</div>;
  if (restaurantStatus === "failed") return <div>Error: {restaurantError}</div>;
  if (chatBotStatus === "failed") return <div>Error: {chatBotError}</div>;
  if (chatsStatus === "failed") return <div>Error: {chatsError}</div>;
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
          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/qrcode`
              )
            }
          >
            Share AI Chat
          </button>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/info`
              )
            }
          >
            Restaurant Info
          </button>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/suggested-questions`
              )
            }
          >
            Update Suggested Questions
          </button>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/menu`
              )
            }
          >
            Update Menu
          </button>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/system-prompt`
              )
            }
          >
            Update Prompt
          </button>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access`
              )
            }
          >
            Manage Employee Access
          </button>
        </div>
      </div>

      {/* Performance Container */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold">PERFORMANCE</h2>
        <div className="mt-4">
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
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/restaurant-chats`
              )
            }
            className="text-blue-500 underline"
          >
            See All
          </button>
        </div>
        <div className="space-y-2">
          {restaurantChats.map((chat) => (
            <button
              key={chat._id}
              onClick={() =>
                navigate(`/restaurant/${restaurantId}/chat/${chat._id}`)
              }
              className="w-full bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition text-left"
            >
              <p className="text-gray-700 truncate">{chat.firstMessage}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
