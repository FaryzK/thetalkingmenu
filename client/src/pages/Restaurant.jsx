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
import {
  fetchRestaurantAnalytics,
  clearRestaurantAnalyticsState,
} from "../redux/slices/restaurantAnalyticsSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import { Chart, Line } from "react-chartjs-2";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController
);

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
    allChats: restaurantChats,
    status: chatsStatus,
    error: chatsError,
  } = useSelector((state) => state.restaurantChats);
  const {
    data: analytics,
    status: analyticsStatus,
    error: analyticsError,
  } = useSelector((state) => state.restaurantAnalytics);

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchRestaurant({ token, restaurantId }));
      dispatch(fetchChatBot({ token, restaurantId }));
      dispatch(fetchRestaurantChats({ token, restaurantId }));
      dispatch(fetchRestaurantAnalytics({ token, restaurantId }));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        dispatch(clearRestaurantState());
        dispatch(clearChatBotState());
        dispatch(clearRestaurantChatsState());
        dispatch(clearRestaurantAnalyticsState());
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
  if (analyticsStatus === "failed") return <div>Error: {analyticsError}</div>;
  if (!analytics || !analytics.monthlyStats) {
    return <div>No analytics data available.</div>;
  }

  const { totalChats, totalMessages, monthlyStats } = analytics;

  const chartData = {
    labels:
      monthlyStats.length > 0
        ? monthlyStats.map((stat) => `${stat.month}/${stat.year}`)
        : ["No Data"],
    datasets: [
      {
        label: "Total Chats",
        data:
          monthlyStats.length > 0
            ? monthlyStats.map((stat) => stat.chats)
            : [0],
        borderColor: "blue",
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Month/Year",
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Chats",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Restaurant Info Container */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-500">{restaurant.location}</p>
      </div>

      {/* Analytics Overview */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <p>Total Chats: {totalChats}</p>
        <p>Total Messages: {totalMessages}</p>
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
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access`
              )
            }
          >
            Manage Employee Access
          </button>
        </div>
      </div>

      {/* Performance Graph */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold">Performance</h2>
        <div className="mt-4 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          {monthlyStats.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="text-center text-gray-500">
              No analytics data available to display.
            </p>
          )}
        </div>
      </div>

      {/* Latest Chats Container */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">LATEST CHATS</h2>
          <button
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/chats`
              )
            }
            className="text-blue-500 underline"
          >
            See All
          </button>
        </div>
        <div className="space-y-2">
          {restaurantChats?.map((chat) => (
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
